from pathlib import Path
import json
from config import settings

class Extractor:
    @staticmethod
    def save_requests(requests: list[str], filename: str = "matching_urls.json"):
        out_file = settings.OUTPUT_DIR / filename
        with open(out_file, "w", encoding="utf-8") as fh:
            json.dump(requests, fh, ensure_ascii=False, indent=2)
        print(f"Saved {len(requests)} URLs → {out_file}")

#method to use NetworkLogger in main.py AVEC network_logger.py et response_getter.py

#main.py

        # 2. Collect filtered network logs
        #logger = NetworkLogger(driver)
        #urls = logger.get_matching_requests()
        #print(f"Found {len(urls)} matching requests.")

        # 3. Persist extracted URLs (if needed)
        #Extractor.save_requests(urls)

        # 4. Fetch and save JSON responses for the URLs
        #response_getter = ResponseGetter(urls)
        #response_getter.fetch_and_save()