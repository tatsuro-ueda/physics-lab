import unittest
from pathlib import Path


STOPWATCH_SOURCE = Path(__file__).parents[1] / "src" / "stopwatch.html"
STOPWATCH_BUILD = Path(__file__).parents[1] / "stopwatch.html"


class StopwatchPageSourceTest(unittest.TestCase):
    def test_stopwatch_formats_display_to_three_decimal_places(self):
        source = STOPWATCH_SOURCE.read_text(encoding="utf-8")

        self.assertIn('<div id="time">0.000</div>', source)
        self.assertIn("timeEl.textContent = '0.000';", source)
        self.assertIn("function formatSeconds(sec) {", source)
        self.assertIn("return sec.toFixed(3);", source)
        self.assertIn("formatSeconds(r)", source)
        self.assertIn("formatSeconds(accum)", source)
        self.assertIn("formatSeconds(accum + (now - segmentStart))", source)

    def test_stopwatch_requires_button_rearm_after_pause(self):
        source = STOPWATCH_SOURCE.read_text(encoding="utf-8")

        self.assertIn("function releaseAudio()", source)
        self.assertIn("if (mode === 'paused') {", source)
        self.assertIn("tutorialEvent: 'rearmed'", source)
        self.assertIn("止まりました。「開始」を押すと次の音を待ちます", source)
        self.assertIn("releaseAudio();", source)
        self.assertNotIn("} else if (triggered && mode === 'paused') {", source)
        self.assertNotIn("tut.event('resumed')", source)
        self.assertNotIn("もう一度たたくと、続きから動きます", source)

    def test_stopwatch_tutorial_matches_manual_rearm_flow(self):
        source = STOPWATCH_SOURCE.read_text(encoding="utf-8")

        self.assertIn("もう一度たたくと、タイマーは止まります", source)
        self.assertIn("「開始」を押すと、次の音を待てます", source)
        self.assertIn("次の音で、続きの区間をスタート", source)

    def test_generated_stopwatch_page_has_manual_rearm_copy(self):
        generated = STOPWATCH_BUILD.read_text(encoding="utf-8")

        self.assertIn('<div id="time">0.000</div>', generated)
        self.assertIn("止まりました。「開始」を押すと次の音を待ちます", generated)
        self.assertNotIn("もう一度たたくと続きから動きます", generated)


if __name__ == "__main__":
    unittest.main()
