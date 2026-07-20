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

    def test_zoom_height_is_not_blocked_by_inline_mount_height(self):
        source = LAB_COMMON.read_text(encoding="utf-8")

        self.assertIn("height:var(--lab-plot-height,180px)", source)
        self.assertIn("mount.style.setProperty('--lab-plot-height',", source)
        self.assertNotIn("mount.style.height =", source)

    def test_zoom_toggle_schedules_delayed_plot_resize(self):
        source = LAB_COMMON.read_text(encoding="utf-8")

        self.assertIn("function scheduleZoomRefresh()", source)
        self.assertIn("setTimeout(() => refreshVisible(), 60);", source)
        self.assertGreaterEqual(source.count("scheduleZoomRefresh();"), 2)


if __name__ == "__main__":
    unittest.main()
