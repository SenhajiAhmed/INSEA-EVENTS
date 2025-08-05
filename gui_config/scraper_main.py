from scraper.driver_factory import DriverFactory
from scraper.scroll_manager import ScrollManager
from scraper.products import ProductExtractor
from scraper.product_info_scraper import ProductInfoScraper
from scraper.product_normalizer import ProductNormalizer
from config import settings

def lancer_scraping(keyword: str, key: str, skip_extraction: bool = False):
    driver = DriverFactory.create()

    try:
        if not skip_extraction:
            driver.get(settings.get_search_url(keyword))

            scroll_mgr = ScrollManager(driver)
            scroll_mgr.scroll_to_end()

            product_extractor = ProductExtractor(driver, filter_by_first_class=True)
            product_extractor.run()

            # ➕ Le key est maintenant passé ici
            info_scraper = ProductInfoScraper(driver, key)
            info_scraper.scrape_info()

    finally:
        driver.quit()

    # Utilise le key pour la normalisation
    normalizer = ProductNormalizer(
        input_path= f"out/product_details_live_{key}.json",
        output_path= f"out/product_details_live_{key}_cleaned.json",
    )
    normalizer.run()

