import json
import os
from datetime import datetime
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class ProductExtractor:
    def __init__(self, driver, filter_by_first_class=False):
        self.driver = driver
        self.filter_by_first_class = filter_by_first_class
        self.output_dir = "out"
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        self.output_filename = f"products_{timestamp}.json"
        self.output_path = os.path.join(self.output_dir, self.output_filename)

    def wait_for_content(self):
        WebDriverWait(self.driver, 15).until(
            EC.presence_of_element_located((By.TAG_NAME, "a"))
        )

    def extract_links(self):
        self.wait_for_content()
        a_tags = self.driver.find_elements(By.TAG_NAME, "a")
        products = []

        first_class = None
        for i, a in enumerate(a_tags):
            class_attr = a.get_attribute("class")
            href = a.get_attribute("href")
            text = a.get_attribute("aria-label") or ""

            # Skip if no href
            if not href:
                continue

            # Capture class of the first <a> for filtering
            if self.filter_by_first_class:
                if i == 0:
                    first_class = class_attr
                elif class_attr != first_class:
                    continue  # Skip non-matching classes

            products.append({
                "name": text,
                "class": class_attr,
                "href": href
            })

        return products

    def save_to_json(self, data):
        os.makedirs(self.output_dir, exist_ok=True)
        with open(self.output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def run(self):
        print("[🔍] Extracting <a> tags with class and href...")
        data = self.extract_links()
        print(f"[✅] Found {len(data)} matching links.")
        self.save_to_json(data)
        print(f"[💾] Saved to {self.output_path}")
