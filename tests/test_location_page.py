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
        self.assertIn('<script src="uplot.js"></script>', source)
        self.assertIn('<script src="lab-common.js"></script>', source)
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
        self.assertIn("tut.event('pinched')", source)
        self.assertIn("tut.event('panned')", source)
        self.assertIn("tut.tick({ totalDist, trackLength: track.length })", source)
        self.assertNotIn("trackLength >= 3", source)

    def test_location_tutorial_requires_shared_graph_gestures(self):
        source = LOCATION_SOURCE.read_text(encoding="utf-8")

        steps = [
            "グラフをタップして拡大してみよう",
            "2本指でグラフを拡大縮小しよう",
            "1本指でグラフを動かそう",
            "線をタップして値を読んでみよう",
            "線から離れてタップして元に戻そう",
        ]
        missing = [step for step in steps if step not in source]
        self.assertFalse(missing, f"missing tutorial steps: {missing}")
        positions = [source.index(step) for step in steps]
        self.assertEqual(positions, sorted(positions))
        self.assertIn("on: 'pinched'", source)
        self.assertIn("on: 'panned'", source)
        self.assertIn("onPan: () => tut.event('panned')", source)
        self.assertIn("onPinch: () => tut.event('pinched')", source)

    def test_location_zoom_hint_matches_acceleration(self):
        source = LOCATION_SOURCE.read_text(encoding="utf-8")

        self.assertIn("<b>2本指</b>で拡大縮小", source)
        self.assertIn("<b>1本指</b>で移動", source)
        self.assertIn("<b>線をタップ</b>して値を読む", source)
        self.assertIn("<b>線から離れてタップ</b>して戻る", source)

    def test_location_page_uses_position_based_route_maps(self):
        source = LOCATION_SOURCE.read_text(encoding="utf-8")

        self.assertNotIn("const vtrack =", source)
        self.assertNotIn("const atrack =", source)
        self.assertIn("track.push({ x: xE, y: yN, speed: null, accel: null })", source)
        self.assertIn("metricKey: 'speed'", source)
        self.assertIn("metricKey: 'accel'", source)
        self.assertNotIn("pts.map((p) => p[opts.metricKey]).filter((v) => Number.isFinite(v))", source)
        self.assertNotIn("Math.max(...metricValues)", source)

    def test_location_time_series_cards_match_acceleration_style(self):
        source = LOCATION_SOURCE.read_text(encoding="utf-8")

        self.assertIn('class="card graph-card visible" id="card-x"', source)
        self.assertIn('class="card graph-card" id="card-vx"', source)
        self.assertIn('class="card graph-card" id="card-ax"', source)
        self.assertIn('class="card map-card visible" id="card-map"', source)
        self.assertIn('class="card map-card" id="card-vmap"', source)
        self.assertIn('class="card map-card" id="card-amap"', source)
        self.assertIn(".graph-card {", source)
        self.assertIn("position: relative;", source)
        self.assertIn("border-radius: 14px;", source)
        self.assertIn("background: #181818;", source)
        self.assertIn(".graph-card .head {", source)
        self.assertIn("pointer-events: none;", source)
        self.assertIn("body.zoom .graph-card { display: none; }", source)
        self.assertIn("body.zoom .graph-card.zoomed { display: block; }", source)

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

    def test_location_page_filters_velocity_and_acceleration_spikes(self):
        source = LOCATION_SOURCE.read_text(encoding="utf-8")

        self.assertIn("const velocityWindow = []", source)
        self.assertIn("const accelWindow = []", source)
        self.assertIn("function confirmVelocitySample(rawSample)", source)
        self.assertIn("function confirmAccelerationSample(rawSample)", source)
        self.assertIn("const settledVelocity = pushMedianWindow(velocityWindow, rawSample, ['vx', 'vy', 'vz']);", source)
        self.assertIn("const settledAccel = pushMedianWindow(accelWindow, rawSample, ['ax', 'ay', 'az']);", source)
        self.assertIn("track[settledVelocity.trackIndex].speed = speedMag", source)
        self.assertIn("track[settledAccel.trackIndex].accel = accelMag", source)
        self.assertIn("velocityWindow.length = 0;", source)
        self.assertIn("accelWindow.length = 0;", source)
        self.assertNotIn("pushS('vx', t, vX); pushS('vy', t, vY); pushS('vz', t, vZ);", source)
        self.assertNotIn("pushS('ax', t, aX); pushS('ay', t, aY); pushS('az', t, aZ);", source)

    def test_location_page_schedules_draws_instead_of_looping_forever(self):
        source = LOCATION_SOURCE.read_text(encoding="utf-8")

        self.assertIn("let drawScheduled = false;", source)
        self.assertIn("function scheduleDraw()", source)
        self.assertIn("if (drawScheduled) return;", source)
        self.assertIn("drawScheduled = true;", source)
        self.assertIn("requestAnimationFrame(() => {", source)
        self.assertIn("drawScheduled = false;", source)
        self.assertIn("scheduleDraw();", source)
        self.assertNotIn("requestAnimationFrame(draw);", source)
        self.assertNotIn("if (watchId === null) return;", source)

    def test_location_page_uses_shared_time_series_graphs(self):
        source = LOCATION_SOURCE.read_text(encoding="utf-8")

        self.assertIn("const graphs = createTimeSeriesCharts({", source)
        self.assertIn("graphs.pushPoint('x', t, xE);", source)
        self.assertIn("graphs.pushPoint('vx', settledVelocity.t, settledVelocity.vx);", source)
        self.assertIn("graphs.pushPoint('ax', settledAccel.t, settledAccel.ax);", source)
        self.assertIn("graphs.clear();", source)
        self.assertIn("graphs.clearMarkers();", source)
        self.assertIn("graphs.refreshVisible();", source)
        self.assertIn("scheduleDraw();", source)
        self.assertIn("document.querySelectorAll('.tab').forEach(tab => {", source)
        self.assertNotIn("function drawGraph(", source)
        self.assertNotIn("function seriesMinMax(", source)
        self.assertNotIn("cvEl.addEventListener('click'", source)

    def test_generated_location_page_has_learning_hooks(self):
        generated = LOCATION_BUILD.read_text(encoding="utf-8")

        self.assertIn('id="missionBtn"', generated)
        self.assertIn('id="tutorialMount"', generated)
        self.assertIn('driver-popover', generated)
        self.assertIn('window.createTutorial', generated)
        self.assertIn('window.createOnboardingTour', generated)
        self.assertIn('function createTimeSeriesCharts(cfg)', generated)
        self.assertNotIn('<script src="driver.js"></script>', generated)
        self.assertNotIn('<script src="uplot.js"></script>', generated)
        self.assertNotIn('<script src="lab-common.js"></script>', generated)
        self.assertNotIn('<script src="tutorial.js"></script>', generated)
        self.assertNotIn('<script src="tour.js"></script>', generated)
        self.assertNotIn('<link rel="stylesheet" href="driver.css">', generated)
        self.assertNotIn("const vtrack =", generated)
        self.assertNotIn("const atrack =", generated)
        self.assertIn("metricKey: 'speed'", generated)
        self.assertIn("metricKey: 'accel'", generated)


if __name__ == "__main__":
    unittest.main()
