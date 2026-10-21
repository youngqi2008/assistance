import contextlib
import importlib.util
import io
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("watch_sdk", Path(__file__).with_name("watch-sdk-cache-refresh.py"))
watch_sdk = importlib.util.module_from_spec(spec)
spec.loader.exec_module(watch_sdk)


class WatchTests(unittest.TestCase):
    def test_old_network_error_and_non_200_continue_until_exact_match(self):
        expected = ("updated " + " ".join(watch_sdk.APP_IDS)).encode()
        attempts = [(0, "200", watch_sdk.APP_IDS[0].encode()), (28, "000", b""), (0, "503", expected), (0, "200", expected)]
        calls = []

        def curl(command, **kwargs):
            calls.append(command)
            code, status, body = attempts.pop(0)
            Path(command[command.index("--output") + 1]).write_bytes(body)
            Path(command[command.index("--dump-header") + 1]).write_text("HTTP/1.1 200 Connection established\r\nAge: 999\r\n\r\nHTTP/2 " + status + "\r\nCache-Control: max-age=86400\r\nLast-Modified: Thu, 17 Sep 2026 10:55:00 GMT\r\nX-Cache: HIT\r\n\r\n")
            return subprocess.CompletedProcess(command, code, status, "timeout" if code else "")

        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            expected_file = root / "expected.js"
            expected_file.write_bytes(expected)
            output = io.StringIO()
            with patch.object(watch_sdk.subprocess, "run", side_effect=curl), patch.object(watch_sdk.time, "sleep") as sleep, patch.object(watch_sdk, "play_alert") as alert, contextlib.redirect_stdout(output):
                watch_sdk.watch(expected_file, root / "out", 30)
            self.assertEqual(sleep.call_count, 3)
            alert.assert_called_once()
            self.assertEqual((root / "out/matched-body.js").read_bytes(), expected)
            log = (root / "out/watch.log").read_text()
            self.assertEqual(log, output.getvalue())
            for text in ("oldAppId=yes newAppId=no", "网络请求失败", "非 200（503）", "Age=<missing>", "已刷新", "内容片段="):
                self.assertIn(text, log)
            self.assertEqual(log.count("已刷新"), 1)
            for command in calls:
                self.assertEqual(command[-1], watch_sdk.SDK_URL)
                self.assertNotIn("?", command[-1])
                self.assertNotIn("--header", command)
                self.assertIn("--compressed", command)
                self.assertEqual(command[command.index("--max-time") + 1], "15")

    def test_audio_three_real_process_results(self):
        logs = []
        with patch.object(watch_sdk.subprocess, "run", return_value=subprocess.CompletedProcess([], 0, "", "")) as run:
            self.assertTrue(watch_sdk.play_alert(logs.append))
        self.assertEqual(run.call_count, 3)
        self.assertTrue(all("afplay" in entry for entry in logs))

    def test_audio_fallback_success_and_failure_are_reported(self):
        for fallback_code in (0, 1):
            with self.subTest(fallback_code=fallback_code):
                logs = []
                responses = [FileNotFoundError("afplay unavailable"), subprocess.CompletedProcess([], fallback_code, "", "no audio device" if fallback_code else "")]
                with patch.object(watch_sdk.subprocess, "run", side_effect=responses) as run:
                    self.assertEqual(watch_sdk.play_alert(logs.append), fallback_code == 0)
                self.assertEqual(run.call_args_list[1].args[0][0], "/usr/bin/say")
                self.assertIn("afplay 失败", logs[0])
                self.assertIn("进程成功" if fallback_code == 0 else "提示音失败", logs[-1])


if __name__ == "__main__":
    unittest.main()
