import unittest
from pathlib import Path


LOCATION_SOURCE = Path(__file__).parents[1] / "src" / "location.html"


class LocationPageSourceTest(unittest.TestCase):
    def test_location_page_wires_learning_ui(self):
        source = LOCATION_SOURCE.read_text(encoding="utf-8")

        self.assertIn('<link rel="stylesheet" href="driver.css">', source)
        self.assertIn('id="missionBtn"', source)
        self.assertIn('id="tutorialMount"', source)
        self.assertIn('<script src="driver.js"></script>', source)
        self.assertIn('<script src="tutorial.js"></script>', source)
        self.assertIn('<script src="tour.js"></script>', source)


if __name__ == "__main__":
    unittest.main()
