import json
import re
import subprocess
import unittest
from pathlib import Path


LAB_COMMON = Path(__file__).parents[1] / "src" / "lab-common.js"
ROOT = Path(__file__).parents[1]
GENERATED_GRAPH_PAGES = (
    "acceleration.html",
    "gyroscope.html",
    "location.html",
    "magnetometer.html",
)


def extract_graph_tap_helpers() -> str:
    source = LAB_COMMON.read_text(encoding="utf-8")
    marker = "// ---- graph tap hit testing ----"
    if marker not in source:
        return ""
    start = source.index(marker)
    end = source.index("function injectLabUplotStyle()", start)
    return source[start:end]


def run_graph_tap_script(script: str) -> dict:
    completed = subprocess.run(
        ["node", "-e", script],
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(completed.stdout)


class TutorialMarkerProgressTest(unittest.TestCase):
    def test_graph_tap_uses_polyline_distance_and_three_action_zones(self):
        helpers = extract_graph_tap_helpers()
        self.assertIn("function classifyGraphTap", helpers)
        script = f"""
{helpers}
const diagonal = [{{ x: 0, y: 0 }}, {{ x: 100, y: 100 }}];
const horizontal = [{{ x: 0, y: 0 }}, {{ x: 100, y: 0 }}];
console.log(JSON.stringify({{
  betweenSamples: classifyGraphTap(50, 50, diagonal),
  lineBoundary: classifyGraphTap(50, 44, horizontal),
  nearMiss: classifyGraphTap(50, 60, horizontal),
  ignoreBoundary: classifyGraphTap(50, 80, horizontal),
  farAway: classifyGraphTap(50, 81, horizontal),
}}));
"""
        payload = run_graph_tap_script(script)

        self.assertEqual(payload["betweenSamples"]["action"], "read")
        self.assertEqual(payload["lineBoundary"]["action"], "read")
        self.assertEqual(payload["nearMiss"]["action"], "ignore")
        self.assertEqual(payload["ignoreBoundary"]["action"], "ignore")
        self.assertEqual(payload["farAway"]["action"], "close")

    def test_shared_time_series_helper_exists(self):
        source = LAB_COMMON.read_text(encoding="utf-8")

        self.assertIn("function createTimeSeriesCharts(cfg)", source)
        self.assertIn("function injectLabUplotStyle()", source)
        self.assertIn("function toggleCardZoom(card)", source)
        self.assertIn("function clearMarkers() {", source)
        self.assertIn("function refreshVisible() {", source)
        self.assertIn("clearMarkers,", source)
        self.assertIn("refreshVisible,", source)

    def test_line_tap_is_exposed_to_tutorial(self):
        source = LAB_COMMON.read_text(encoding="utf-8")

        self.assertRegex(source, r"let\s+hasMarker\s*=\s*false")
        self.assertRegex(
            source,
            re.compile(r"tapResult\.action\s*===\s*'read'.*?hasMarker\s*=\s*true", re.DOTALL),
        )
        self.assertRegex(source, r"hasMarker:\s*\(\)\s*=>\s*hasMarker")

    def test_marker_values_are_only_created_when_value_reading_is_allowed(self):
        source = LAB_COMMON.read_text(encoding="utf-8")

        self.assertIn("const GRAPH_LINE_HIT_PX = 44;", source)
        self.assertIn("const GRAPH_CLOSE_DISTANCE_PX = 80;", source)
        self.assertIn("function canReadValue() {", source)
        self.assertIn("return !cfg.canReadValue || cfg.canReadValue();", source)
        self.assertIn("if (!canReadValue() || !zoomed", source)
        self.assertIn("if (tapResult.action === 'read' && canReadValue()) {", source)
        self.assertRegex(
            source,
            re.compile(
                r"if \(tapResult\.action === 'read' && canReadValue\(\)\) \{.*?hasMarker = true;.*?if \(cfg\.onMarker\)",
                re.DOTALL,
            ),
        )
        self.assertIn("canReadValue: () => !running,", source)
        self.assertRegex(
            source,
            re.compile(r"graphs\.clearMarkers\(\);\s*running = true;", re.DOTALL),
        )

    def test_single_pointer_move_does_not_cancel_tap_before_zoom(self):
        source = LAB_COMMON.read_text(encoding="utf-8")

        self.assertRegex(
            source,
            re.compile(
                r"else if \(cache\.size === 1\) \{\s*const zoomed = document\.body\.classList\.contains\('zoom'\);\s*if \(!zoomed\) return;",
                re.DOTALL,
            ),
        )
        self.assertIn("const TAP_SLOP_PX = 8;", source)
        self.assertIn("Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y)", source)

    def test_two_pointer_pinch_only_works_while_zoomed(self):
        source = LAB_COMMON.read_text(encoding="utf-8")

        self.assertRegex(
            source,
            re.compile(
                r"if \(cache\.size === 2\) \{\s*const zoomed = document\.body\.classList\.contains\('zoom'\);\s*if \(!zoomed\) return;",
                re.DOTALL,
            ),
        )
        self.assertIn("const dist = Math.hypot(", source)
        self.assertIn("const centerY = (pts[0].clientY + pts[1].clientY) / 2;", source)
        self.assertIn("const yScale = plot.scales.y;", source)
        self.assertIn("const vc = yScale.max - (centerY - rect.top) / rect.height * (yScale.max - yScale.min);", source)
        self.assertIn("viewV[key].autoScale = false;", source)
        self.assertIn("plot.setScale('y', { min: newYMin, max: newYMax });", source)

    def test_pinch_uses_two_dimensional_distance_from_pointer_down(self):
        source = LAB_COMMON.read_text(encoding="utf-8")

        self.assertIn("prevDist = Math.hypot(", source)
        self.assertNotIn("prevDist = Math.abs(", source)

    def test_single_pointer_pan_moves_time_and_value_axes(self):
        source = LAB_COMMON.read_text(encoding="utf-8")

        self.assertIn("let panPrevY = 0;", source)
        self.assertIn("panPrevY = e.clientY;", source)
        self.assertIn("const dy = e.clientY - panPrevY;", source)
        self.assertIn("const dv = dy / rect.height * (yScale.max - yScale.min);", source)
        self.assertIn("viewV[key].min = yScale.min + dv;", source)
        self.assertIn("viewV[key].max = yScale.max + dv;", source)
        self.assertIn("plot.setScale('y', { min: viewV[key].min, max: viewV[key].max });", source)

    def test_pan_and_pinch_notify_pages_without_hidden_double_tap(self):
        source = LAB_COMMON.read_text(encoding="utf-8")

        self.assertIn("if (cfg.onPan) cfg.onPan({ key });", source)
        self.assertIn("cfg.onPinch({ key });", source)
        self.assertIn("onPan: cfg.onPan,", source)
        self.assertIn("onPinch: cfg.onPinch,", source)
        self.assertNotIn("lastTapTime", source)

    def test_zoom_height_is_not_blocked_by_inline_mount_height(self):
        source = LAB_COMMON.read_text(encoding="utf-8")

        self.assertIn("height:var(--lab-plot-height,180px)", source)
        self.assertIn("mount.style.setProperty('--lab-plot-height',", source)
        self.assertNotIn("mount.style.height =", source)

    def test_zoom_toggle_schedules_delayed_plot_resize(self):
        source = LAB_COMMON.read_text(encoding="utf-8")

        self.assertIn("function refreshVisible() {", source)
        self.assertIn("function scheduleZoomRefresh()", source)
        self.assertIn("setTimeout(() => refreshVisible(), 60);", source)
        self.assertGreaterEqual(source.count("scheduleZoomRefresh();"), 2)

    def test_shared_gestures_are_inlined_into_every_generated_graph_page(self):
        for page_name in GENERATED_GRAPH_PAGES:
            with self.subTest(page=page_name):
                generated = (ROOT / page_name).read_text(encoding="utf-8")
                self.assertNotIn('<script src="lab-common.js"></script>', generated)
                self.assertIn("if (cfg.onPan) cfg.onPan({ key });", generated)
                self.assertIn("cfg.onPinch({ key });", generated)
                self.assertIn("function classifyGraphTap(tapX, tapY, points)", generated)
                self.assertIn("const GRAPH_LINE_HIT_PX = 44;", generated)
                self.assertIn("const GRAPH_CLOSE_DISTANCE_PX = 80;", generated)
                self.assertIn("if (!canReadValue() || !zoomed", generated)
                self.assertIn("if (tapResult.action === 'read' && canReadValue()) {", generated)

    def test_sensor_page_hints_require_pause_before_reading_a_value(self):
        for page_name in ("gyroscope.html", "magnetometer.html"):
            with self.subTest(page=page_name):
                source = (ROOT / "src" / page_name).read_text(encoding="utf-8")
                self.assertIn("⏸で止めてから", source)
                self.assertNotIn("止めると読みやすい", source)


if __name__ == "__main__":
    unittest.main()
