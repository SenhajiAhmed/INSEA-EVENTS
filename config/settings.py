from pathlib import Path

# --- Selenium ---
HEADLESS          = True
WINDOW_SIZE       = (1920, 1080)
SCROLL_INCREMENT  = 400        # px
SCROLL_PAUSE_SEC  = 0.8
MAX_SCROLL_LOOPS  = 60

# --- Google Maps query ---
def get_search_url(key: str) -> str:
    return f"https://www.google.com/maps/search/{key}/@34.0150613,-6.8471705,10z?entry=ttu&g_ep=EgoyMDI1MDczMC4wIKXMDSoASAFQAw%3D%3D"


# --- Output ---
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "out"
OUTPUT_DIR.mkdir(exist_ok=True)