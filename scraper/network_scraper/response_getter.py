import requests
import json
import os

class ResponseGetter:
    def __init__(self, urls, output_dir="responses"):
        self.urls = urls
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def fetch_and_save(self):
        for i, url in enumerate(self.urls, start=1):
            try:
                response = requests.get(url)
                response.raise_for_status()
                data = response.json()

                filename = os.path.join(self.output_dir, f"response_{i}.json")
                with open(filename, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=4, ensure_ascii=False)

                print(f"Saved response from {url} to {filename}")

            except requests.RequestException as e:
                print(f"Failed to fetch {url}: {e}")
            except json.JSONDecodeError:
                print(f"Response from {url} is not valid JSON.")

#method to use NetworkLogger in main.py AVEC network_logger.py et extractor.py

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
