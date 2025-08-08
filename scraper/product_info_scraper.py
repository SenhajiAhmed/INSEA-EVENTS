import json
import os
import re
import time
from datetime import datetime
import logging

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class ProductInfoScraper:
    def __init__(self, driver, key, logger: logging.Logger, input_folder="out", output_folder="out"):
        self.driver = driver
        self.logger = logger
        self.input_folder = input_folder
        self.output_folder = output_folder
        self.output_path = os.path.join(self.output_folder, f"product_details_live_{key}.json")
        self.links = self._load_latest_urls()
        self.results = self._load_existing_data()

    def _load_latest_urls(self):
        pattern = "products_"
        files = [f for f in os.listdir(self.input_folder) if f.startswith(pattern) and f.endswith(".json")]
        if not files:
            self.logger.error("Aucun fichier de produits trouvé dans le dossier 'out/'.")
            raise FileNotFoundError("Aucun fichier de produits trouvé dans le dossier 'out/'.")

        files.sort(key=lambda x: datetime.strptime(x.split("_")[1] + "_" + x.split("_")[2].replace(".json", ""), "%Y-%m-%d_%H-%M-%S"), reverse=True)
        latest_file = files[0]

        with open(os.path.join(self.input_folder, latest_file), "r", encoding="utf-8") as f:
            data = json.load(f)

        # Retourne la liste complète des objets avec name + href
        return [item for item in data if "href" in item and "name" in item]


    def _load_existing_data(self):
        if os.path.exists(self.output_path):
            with open(self.output_path, "r", encoding="utf-8") as f:
                try:
                    data = json.load(f)
                    self.logger.info(f" {len(data)} liens déjà traités.")
                    return data
                except json.JSONDecodeError:
                    self.logger.warning(" Fichier de sortie corrompu. Nouveau fichier créé.")
                    return []
        return []

    def _has_been_scraped(self, href):
        return any(entry["url"] == href for entry in self.results)

    def _save_one(self, result):
        self.results.append(result)
        with open(self.output_path, "w", encoding="utf-8") as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)

    def scrape_info(self):
        for index, link in enumerate(self.links, start=1):
            href = link["href"]
            name = link["name"]

            if self._has_been_scraped(href):
                self.logger.info(f" Déjà traité : {href}")
                continue

            self.logger.info(f"\n Scraping {index}/{len(self.links)}: {name}")
            try:
                self.driver.get(href)
                time.sleep(1)

                data = {
                    "url": href,
                    "name": name  # ajoute le nom ici
                }

                WebDriverWait(self.driver, 15).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, '[data-item-id^="address"], [data-item-id^="phone"], [data-item-id^="authority"]'))
                )
                items = self.driver.find_elements(By.CSS_SELECTOR, '[data-item-id^="address"], [data-item-id^="phone"], [data-item-id^="authority"]')

                for item in items:
                    item_id = item.get_attribute("data-item-id")
                    label = next((p for p in ["address", "phone", "authority"] if item_id.startswith(p)), "unknown")
                    try:
                        font_el = WebDriverWait(item, 5).until(EC.presence_of_element_located((By.CLASS_NAME, "fontBodyMedium")))
                        text = font_el.text.strip()
                    except:
                        text = ""

                    if label == "phone" and not text:
                        parts = item_id.split(":")
                        if len(parts) >= 3:
                            text = parts[2]

                    data[label] = text

                # Rating & number of rates
                spans = self.driver.find_elements(By.CLASS_NAME, "fontBodyMedium")
                valid_spans = [s.text.strip() for c in spans for s in c.find_elements(By.TAG_NAME, "span") if s.text.strip()]
                if len(valid_spans) >= 1:
                    data["rating"] = valid_spans[0]
                if len(valid_spans) >= 3:
                    data["number_of_rates"] = valid_spans[2]

                # Informations détaillées
                try:
                    info_button = WebDriverWait(self.driver, 5).until(
                        EC.element_to_be_clickable((By.CSS_SELECTOR, 'button[aria-label^="Informations sur"]'))
                    )
                    info_button.click()
                    WebDriverWait(self.driver, 5).until(
                        EC.presence_of_all_elements_located((By.CLASS_NAME, "fontBodyMedium"))
                    )
                    divs = self.driver.find_elements(By.CLASS_NAME, "fontBodyMedium")
                    if len(divs) >= 2:
                        classes = divs[1].get_attribute("class").split()
                        if len(classes) >= 2:
                            class_name = classes[1]
                            sections = self.driver.find_elements(By.CSS_SELECTOR, f'div.{class_name.replace(" ", ".")}')
                            details = []
                            for sec in sections:
                                try:
                                    title = sec.find_element(By.TAG_NAME, "h2").text.strip()
                                    items = [re.sub(r'^[^\w\d]+', '', li.text.strip()) for li in sec.find_elements(By.TAG_NAME, "li")]
                                    details.append({title: items})
                                except:
                                    continue
                            data["details"] = details
                except:
                    pass

                # Sauvegarde immédiate
                self._save_one(data)
                self.logger.info(f" Données sauvegardées pour : {href}")

            except Exception as e:
                self.logger.error(f" Erreur scraping {href} : {e}")
                continue
