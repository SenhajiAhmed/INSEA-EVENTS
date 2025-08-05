import json
from urllib.parse import urlparse
from config import settings

class NetworkLogger:
    def __init__(self, driver):
        self.driver = driver

    def get_matching_requests(self, keyword: str = "search?tbm=map"):
        """Return all network requests whose URL contains `keyword`."""
        logs = self.driver.get_log("performance")
        matches = []
        for entry in logs:
            msg = json.loads(entry["message"])["message"]
            if msg.get("method") != "Network.requestWillBeSent":
                continue
            url = msg["params"]["request"]["url"]
            if keyword in url:
                matches.append(url)
        return matches
    
#method to use NetworkLogger in main.py AVEC extractor.py

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