import json
import subprocess
import unittest
from pathlib import Path


LOCATION_SOURCE = Path(__file__).parents[1] / "src" / "location.html"


def extract_filter_block() -> str:
    source = LOCATION_SOURCE.read_text(encoding="utf-8")
    start = source.index("// ---- spike filter helpers ----")
    end = source.index("// ---- タブ切り替え ----", start)
    return source[start:end]


def run_filter_script(script: str) -> dict:
    completed = subprocess.run(
        ["node", "-e", script],
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(completed.stdout)


class LocationSpikeFilterTest(unittest.TestCase):
    def test_push_median_window_returns_medianized_center_velocity(self):
        helpers = extract_filter_block()
        script = f"""
{helpers}
const buffer = [];
const first = pushMedianWindow(buffer, {{ t: 1, trackIndex: 1, vx: 1.0, vy: 0.0, vz: 0.0 }}, ['vx', 'vy', 'vz']);
const second = pushMedianWindow(buffer, {{ t: 2, trackIndex: 2, vx: 12.0, vy: 0.0, vz: 0.0 }}, ['vx', 'vy', 'vz']);
const third = pushMedianWindow(buffer, {{ t: 3, trackIndex: 3, vx: 1.2, vy: 0.0, vz: 0.0 }}, ['vx', 'vy', 'vz']);
console.log(JSON.stringify({{
  first,
  second,
  third,
  bufferLength: buffer.length,
}}));
"""
        payload = run_filter_script(script)

        self.assertIsNone(payload["first"])
        self.assertIsNone(payload["second"])
        self.assertEqual(payload["third"]["t"], 2)
        self.assertEqual(payload["third"]["trackIndex"], 2)
        self.assertAlmostEqual(payload["third"]["vx"], 1.2)
        self.assertEqual(payload["bufferLength"], 2)

    def test_push_median_window_is_generic_for_acceleration_axes(self):
        helpers = extract_filter_block()
        script = f"""
{helpers}
const buffer = [];
pushMedianWindow(buffer, {{ t: 4, trackIndex: 4, ax: 0.5, ay: 0.2, az: 0.0 }}, ['ax', 'ay', 'az']);
pushMedianWindow(buffer, {{ t: 5, trackIndex: 5, ax: 9.0, ay: 0.3, az: 0.0 }}, ['ax', 'ay', 'az']);
const settled = pushMedianWindow(buffer, {{ t: 6, trackIndex: 6, ax: 0.6, ay: 0.4, az: 0.0 }}, ['ax', 'ay', 'az']);
console.log(JSON.stringify(settled));
"""
        payload = run_filter_script(script)

        self.assertEqual(payload["t"], 5)
        self.assertAlmostEqual(payload["ax"], 0.6)
        self.assertAlmostEqual(payload["ay"], 0.3)
        self.assertAlmostEqual(payload["az"], 0.0)


if __name__ == "__main__":
    unittest.main()
