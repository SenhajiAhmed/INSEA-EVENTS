import time, math
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, JavascriptException
from config import settings
import logging

class ScrollManager:
    def __init__(self, driver, logger):
        self.driver = driver
        self.logger = logger
        self._container = None

    # ---------- helpers -------------------------------------------------
    def _find_scrollable_parent(self, element):
        """Walk up the tree until scrollHeight > clientHeight."""
        for _ in range(3):  # max 3 levels
            try:
                is_scrollable = self.driver.execute_script(
                    "return arguments[0].scrollHeight > arguments[0].clientHeight",
                    element
                )
                if is_scrollable:
                    return element
                element = element.find_element(By.XPATH, "..")
            except JavascriptException:
                break
        return element  # fallback

    def _get_metrics(self, el):
        return self.driver.execute_script(
            "return {sh: arguments[0].scrollHeight, st: arguments[0].scrollTop, ch: arguments[0].clientHeight}",
            el
        )

    # ---------- public API ----------------------------------------------
    def locate_scroll_container(self):
        """Find (and cache) the real scrollable container."""
        if self._container is None:
            try:
                feed = WebDriverWait(self.driver, 20).until(
                    EC.presence_of_element_located((
                        By.XPATH,
                        "//div[@role='feed' and contains(@aria-label, 'Résultats')]"
                    ))
                )
                self._container = self._find_scrollable_parent(feed)
                self.logger.info("Scroll container located: %s", self._container.get_attribute("class"))
            except TimeoutException as e:
                raise RuntimeError("Scroll container not found") from e
        return self._container

    def scroll_to_end(self):
        container = self.locate_scroll_container()

        last_sh = 0
        loops = 0
        stale_count = 0
        max_stale = 4

        while loops < settings.MAX_SCROLL_LOOPS and stale_count < max_stale:
            # scroll
            self.driver.execute_script(
                "arguments[0].scrollBy(0, arguments[1]);",
                container,
                settings.SCROLL_INCREMENT
            )
            loops += 1

            # Wait until height increases OR timeout
            for _ in range(int(3 / settings.SCROLL_PAUSE_SEC)):
                time.sleep(settings.SCROLL_PAUSE_SEC)
                metrics = self._get_metrics(container)
                if metrics["sh"] > last_sh:
                    stale_count = 0
                    break
            else:
                stale_count += 1
                self.logger.debug("Height unchanged for %d cycle(s).", stale_count)

            last_sh = metrics["sh"]
            self.logger.info("Loop %d: scrollHeight=%d", loops, last_sh)

        if stale_count >= max_stale:
            self.logger.info("Scrolling appears finished (no new content).")
        else:
            self.logger.info("Reached max loops (%d).", settings.MAX_SCROLL_LOOPS)