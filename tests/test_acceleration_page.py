import unittest
from pathlib import Path


ACCEL_SOURCE = Path(__file__).parents[1] / "src" / "acceleration.html"
ACCEL_BUILD = Path(__file__).parents[1] / "acceleration.html"


class AccelerationPageCopyTest(unittest.TestCase):
    def test_source_uses_workshop_hint_but_keeps_basic_tutorial(self):
        source = ACCEL_SOURCE.read_text(encoding="utf-8")

        self.assertIn("講習会では自由落下区間を広げて約9.8 m/s² を読む", source)
        self.assertIn("<b>▶で計測</b>、<b>⏸で止める</b>、<b>グラフをタップ</b>＝拡大", source)
        self.assertIn("<b>2本指</b>＝拡大、<b>1本指</b>＝移動、<b>線をタップ</b>＝値、<b>まわりをタップ</b>＝縮小", source)
        self.assertIn("グラフの線から はなれた場所をタップして、拡大してみよう", source)
        self.assertNotIn("約9.8 m/s² か確かめよう", source)

    def test_generated_page_includes_updated_hint_copy(self):
        generated = ACCEL_BUILD.read_text(encoding="utf-8")

        self.assertIn("講習会では自由落下区間を広げて約9.8 m/s² を読む", generated)
        self.assertIn("<b>▶で計測</b>、<b>⏸で止める</b>、<b>グラフをタップ</b>＝拡大", generated)
        self.assertIn("<b>2本指</b>＝拡大、<b>1本指</b>＝移動、<b>線をタップ</b>＝値、<b>まわりをタップ</b>＝縮小", generated)


if __name__ == "__main__":
    unittest.main()
