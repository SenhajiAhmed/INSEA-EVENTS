from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from scraper.driver_factory import DriverFactory
from scraper.scroll_manager import ScrollManager
from scraper.products import ProductExtractor
from scraper.product_info_scraper import ProductInfoScraper
from scraper.product_normalizer import ProductNormalizer
from config import settings

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class ScrapeRequest(BaseModel):
    keyword: str
    key: str

def lancer_scraping(keyword: str, key: str, skip_extraction: bool = False):
    """The main scraping function, integrated from gui_config."""
    driver = DriverFactory.create()
    try:
        if not skip_extraction:
            driver.get(settings.get_search_url(key))
            scroll_mgr = ScrollManager(driver)
            scroll_mgr.scroll_to_end()
            product_extractor = ProductExtractor(driver, filter_by_first_class=True)
            product_extractor.run()
        
        info_scraper = ProductInfoScraper(driver, key)
        info_scraper.scrape_info()
    finally:
        driver.quit()

    normalizer = ProductNormalizer(
        input_path=f"out/product_details_live_{key}.json",
        output_path=f"out/product_details_live_{key}_cleaned.json",
    )
    normalizer.run()
    print(f"Scraping and normalization for '{key}' completed.")

@app.post("/scrape")
def scrape(request: ScrapeRequest, background_tasks: BackgroundTasks):
    """API endpoint to trigger the scraping process in the background."""
    background_tasks.add_task(lancer_scraping, request.keyword, request.key)
    return {"message": "Scraping started successfully in the background."}

# To run this app, use the command: uvicorn main:app --reload
