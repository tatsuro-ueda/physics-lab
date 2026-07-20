import unittest
from pathlib import Path


ACCEL_SOURCE = Path(__file__).parents[1] / "src" / "acceleration.html"
ACCEL_BUILD = Path(__file__).parents[1] / "acceleration.html"


class AccelerationPageCopyTest(unittest.TestCase):
    def test_source_uses_workshop_hint_but_keeps_basic_tutorial(self):
        source = ACCEL_SOURCE.read_text(encoding="utf-8")

        self.assertIn("講習会では自由落下区間を広げて約9.8 m/s² を読む", source)
        self.assertIn("<b>▶で計測</b>。<b>⏸で止める</b>。<b>グラフをタップ</b>して拡大。", source)
        self.assertIn("<b>2本指</b>で拡大縮小", source)
        self.assertIn("<b>1本指</b>で移動", source)
        self.assertIn("<b>線をタップ</b>して値を読む", source)
        self.assertIn("<b>線から離れてタップ</b>して戻る", source)
        self.assertIn("グラフの線から はなれた場所をタップして、拡大してみよう", source)
        self.assertNotIn("約9.8 m/s² か確かめよう", source)

    def test_tutorial_requires_pause_zoom_pinch_pan_marker_and_restore(self):
        source = ACCEL_SOURCE.read_text(encoding="utf-8")

        steps = [
            "を押して、グラフを止めよう",
            "グラフの線から はなれた場所をタップして、拡大してみよう",
            "2本指でグラフを拡大縮小しよう",
            "1本指でグラフを動かそう",
            "線の上をタップして、その点の値を読もう",
            "線から離れたところをタップして、元の大きさに戻そう",
        ]
        missing = [step for step in steps if step not in source]
        self.assertFalse(missing, f"missing tutorial steps: {missing}")
        positions = [source.index(step) for step in steps]
        self.assertEqual(positions, sorted(positions))
        self.assertIn("on: 'pinched'", source)
        self.assertIn("on: 'panned'", source)
        self.assertIn("onPan: () => tut.event('panned')", source)
        self.assertIn("onPinch: () => tut.event('pinched')", source)

    def test_axis_success_note_does_not_embed_svg_markup(self):
        source = ACCEL_SOURCE.read_text(encoding="utf-8")

        self.assertIn("api.note('正解！動いたのは ' + hit + ' でした')", source)
        self.assertNotIn("' でした' + TUT_ICONS.check", source)

    def test_generated_page_includes_updated_hint_copy(self):
        generated = ACCEL_BUILD.read_text(encoding="utf-8")

        self.assertIn("講習会では自由落下区間を広げて約9.8 m/s² を読む", generated)
        self.assertIn("<b>▶で計測</b>。<b>⏸で止める</b>。<b>グラフをタップ</b>して拡大。", generated)
        self.assertIn("<b>2本指</b>で拡大縮小", generated)
        self.assertIn("<b>1本指</b>で移動", generated)


if __name__ == "__main__":
    unittest.main()
