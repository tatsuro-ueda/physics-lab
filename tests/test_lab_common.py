import re
import unittest
from pathlib import Path


LAB_COMMON = Path(__file__).parents[1] / "src" / "lab-common.js"


class TutorialMarkerProgressTest(unittest.TestCase):
    def test_shared_time_series_helper_exists(self):
        source = LAB_COMMON.read_text(encoding="utf-8")

        self.assertIn("function createTimeSeriesCharts(cfg)", source)
        self.assertIn("function injectLabUplotStyle()", source)
        self.assertIn("function toggleCardZoom(card)", source)
        self.assertIn("clearMarkers: () => {", source)
        self.assertIn("refreshVisible: () => {", source)

    def test_line_tap_is_exposed_to_tutorial(self):
        source = LAB_COMMON.read_text(encoding="utf-8")

        self.assertRegex(source, r"let\s+hasMarker\s*=\s*false")
        self.assertRegex(
            source,
            re.compile(r"if\s*\(dist\s*<\s*30\).*?hasMarker\s*=\s*true", re.DOTALL),
        )
        self.assertRegex(source, r"hasMarker:\s*\(\)\s*=>\s*hasMarker")


if __name__ == "__main__":
    unittest.main()
