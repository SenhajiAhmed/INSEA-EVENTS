from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from config import settings

class DriverFactory:
    @staticmethod
    def create() -> webdriver.Chrome:
        options = webdriver.ChromeOptions()
        options.add_argument("--start-maximized")
        if settings.HEADLESS:
            options.add_argument("--headless=new")
        options.set_capability("goog:loggingPrefs", {"performance": "ALL"})
        driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()),
            options=options
        )
        driver.set_window_size(*settings.WINDOW_SIZE)
        return driver