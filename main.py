from fastapi import FastAPI, BackgroundTasks, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import logging

from scraper.driver_factory import DriverFactory
from scraper.scroll_manager import ScrollManager
from scraper.products import ProductExtractor
from scraper.product_info_scraper import ProductInfoScraper
from scraper.product_normalizer import ProductNormalizer
from config import settings
from config.logging_config import setup_logging

# --- New Imports for Blog --- #
from sqlalchemy.orm import Session
import crud, models, schemas
from database import SessionLocal, engine, get_db
from posts_router import router as posts_router
# --- End New Imports --- #

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- Add Posts Router --- #
app.include_router(posts_router)
# ------------------------ #

# Setup logging
logger, stream_handler = setup_logging()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# --- Function to create initial post --- #
@app.on_event("startup")
def create_initial_post():
    db: Session = SessionLocal()
    patinage_post = crud.get_post_by_slug(db, slug="patinage")
    if not patinage_post:
        # Ensure a default user exists
        default_user = crud.get_user_by_email(db, email="default@example.com")
        if not default_user:
            user_in = schemas.UserCreate(email="default@example.com", password="password")
            default_user = crud.create_user(db, user=user_in)
        
        post_in = schemas.PostCreate(
            title="Patinage", 
            content="Le patinage est une activité passionnante qui combine sport et art..."
        )
        crud.create_user_post(db, post=post_in, user_id=default_user.id)
    db.close()
# ------------------------------------ #

class ScrapeRequest(BaseModel):
    keyword: str

async def log_streamer():
    # Continuously yield log messages from the stream handler
    last_index = 0
    while True:
        if last_index < len(stream_handler.records):
            for i in range(last_index, len(stream_handler.records)):
                yield f"data: {stream_handler.records[i]}\n\n"
            last_index = len(stream_handler.records)
        await asyncio.sleep(0.5) # Prevent a busy-wait loop

@app.get("/stream-logs")
async def stream_logs(request: Request):
    return StreamingResponse(log_streamer(), media_type="text/event-stream")


def lancer_scraping(keyword: str, skip_extraction: bool = False):
    """The main scraping function, integrated from gui_config."""
    key = keyword.replace(' ', '_').lower()
    logger.info(f"Starting scraping process for keyword: '{keyword}' (key: '{key}')")
    driver = DriverFactory.create()
    try:
        if not skip_extraction:
            logger.info(f"Navigating to search URL for key: '{key}'")
            driver.get(settings.get_search_url(key))
            scroll_mgr = ScrollManager(driver, logger)
            scroll_mgr.scroll_to_end()
            product_extractor = ProductExtractor(driver, logger, filter_by_first_class=True)
            product_extractor.run()
        
        info_scraper = ProductInfoScraper(driver, key, logger)
        info_scraper.scrape_info()
    except Exception as e:
        logger.error(f"An error occurred during scraping: {e}", exc_info=True)
    finally:
        logger.info("Closing the browser driver.")
        driver.quit()

    normalizer = ProductNormalizer(
        input_path=f"out/product_details_live_{key}.json",
        output_path=f"out/product_details_live_{key}_cleaned.json",
        logger=logger
    )
    normalizer.run()
    logger.info(f"Scraping and normalization for '{key}' completed.")

@app.post("/scrape")
def scrape(request: ScrapeRequest, background_tasks: BackgroundTasks):
    """API endpoint to trigger the scraping process in the background."""
    # Clear previous logs before starting a new job
    stream_handler.records.clear()
    background_tasks.add_task(lancer_scraping, request.keyword)
    return {"message": "Scraping started successfully in the background."}

# To run this app, use the command: uvicorn main:app --reload
