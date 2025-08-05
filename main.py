from scraper.driver_factory import DriverFactory
from scraper.scroll_manager import ScrollManager
from scraper.products import ProductExtractor
from scraper.product_info_scraper import ProductInfoScraper
from scraper.product_normalizer import ProductNormalizer

SKIP_EXTRACTION = True  # ❗ Change à False si tu veux récupérer les liens à nouveau

def main():
    driver = DriverFactory.create()

    try:
        key = input("Entrez le service à scraper (par exemple, 'traiteur'): ")
        if not SKIP_EXTRACTION:
            from config import settings
            driver.get(settings.get_search_url(key))

            scroll_mgr = ScrollManager(driver)
            scroll_mgr.scroll_to_end()

            product_extractor = ProductExtractor(driver, filter_by_first_class=True)
            product_extractor.run()

        info_scraper = ProductInfoScraper(driver, key)
        info_scraper.scrape_info()

    finally:
        driver.quit()

    # Normalisation du JSON extrait
    normalizer = ProductNormalizer(
        input_path= f"out/{key}_details_live.json",
        output_path= f"out/{key}_details_live_cleaned.json",
    )
    normalizer.run()


if __name__ == "__main__":
    main()
