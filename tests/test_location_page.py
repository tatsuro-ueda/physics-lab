import unittest
from pathlib import Path


LOCATION_SOURCE = Path(__file__).parents[1] / "src" / "location.html"
LOCATION_BUILD = Path(__file__).parents[1] / "location.html"


class LocationPageSourceTest(unittest.TestCase):
    def test_location_page_wires_learning_ui(self):
        source = LOCATION_SOURCE.read_text(encoding="utf-8")

        self.assertIn('<link rel="stylesheet" href="driver.css">', source)
        self.assertIn('id="missionBtn"', source)
        self.assertIn('id="tutorialMount"', source)
        self.assertIn('<script src="driver.js"></script>', source)
        self.assertIn('<script src="tutorial.js"></script>', source)
        self.assertIn('<script src="tour.js"></script>', source)

    def test_location_page_defines_tutorial_and_onboarding(self):
        source = LOCATION_SOURCE.read_text(encoding="utf-8")

        self.assertIn("createTutorial({", source)
        self.assertIn("keyPrefix: 'phylab-location'", source)
        self.assertIn("mountId: 'tutorialMount'", source)
        self.assertIn("toggleBtnId: 'missionBtn'", source)
        self.assertIn("createOnboardingTour({", source)
        self.assertIn("key: 'location-onboarding-seen'", source)
        self.assertIn("tut.event('started')", source)
        self.assertIn("tut.event('zoomed')", source)
        self.assertIn("tut.event('marker')", source)

    def test_generated_location_page_has_learning_hooks(self):
        generated = LOCATION_BUILD.read_text(encoding="utf-8")

        self.assertIn('id="missionBtn"', generated)
        self.assertIn('id="tutorialMount"', generated)
        self.assertIn('driver-popover', generated)
        self.assertIn('window.createTutorial', generated)
        self.assertIn('window.createOnboardingTour', generated)
        self.assertNotIn('<script src="driver.js"></script>', generated)
        self.assertNotIn('<script src="tutorial.js"></script>', generated)
        self.assertNotIn('<script src="tour.js"></script>', generated)
        self.assertNotIn('<link rel="stylesheet" href="driver.css">', generated)


if __name__ == "__main__":
    unittest.main()
