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
        self.assertIn("tut.tick({ totalDist, trackLength: track.length })", source)
        self.assertNotIn("trackLength >= 3", source)

    def test_location_page_uses_position_based_route_maps(self):
        source = LOCATION_SOURCE.read_text(encoding="utf-8")

        self.assertNotIn("const vtrack =", source)
        self.assertNotIn("const atrack =", source)
        self.assertIn("track.push({ x: xE, y: yN, speed: null, accel: null })", source)
        self.assertIn("track[track.length - 1].speed = speedMag", source)
        self.assertIn("track[track.length - 1].accel = accelMag", source)
        self.assertIn("metricKey: 'speed'", source)
        self.assertIn("metricKey: 'accel'", source)
        self.assertNotIn("pts.map((p) => p[opts.metricKey]).filter((v) => Number.isFinite(v))", source)
        self.assertNotIn("Math.max(...metricValues)", source)

    def test_location_page_has_actionable_status_and_error_copy(self):
        source = LOCATION_SOURCE.read_text(encoding="utf-8")

        self.assertIn('id="status"', source)
        self.assertIn("function startWatching()", source)
        self.assertIn("function stopWatching(reason)", source)
        self.assertIn("setStatus('記録中。少し歩いて、線や地図の変化を見よう')", source)
        self.assertIn("stopWatching('error')", source)
        self.assertIn("setStatus('記録は停止しました。原因を確認してから、▶でやり直せます')", source)
        self.assertIn("document.addEventListener('visibilitychange'", source)
        self.assertIn("stopWatching('hidden')", source)
        self.assertIn("if (document.hidden && isRunning()) stopWatching('hidden');", source)
        self.assertIn("if (isRunning()) {", source)
        self.assertIn("stopWatching('paused')", source)
        self.assertIn("startWatching();", source)
        self.assertIn("このタブを離れたので停止しました。▶で再開できます", source)
        self.assertIn("位置情報の使用が許可されませんでした。ブラウザの設定で許可してから、もう一度▶を押してね", source)
        self.assertIn("位置の取得がタイムアウトしました。空が開けた場所で、もう一度▶を押してね", source)
        self.assertIn('<span class="hint-plain">', source)
        self.assertIn('<span class="hint-zoom">', source)

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
        self.assertNotIn("const vtrack =", generated)
        self.assertNotIn("const atrack =", generated)
        self.assertIn("metricKey: 'speed'", generated)
        self.assertIn("metricKey: 'accel'", generated)


if __name__ == "__main__":
    unittest.main()
