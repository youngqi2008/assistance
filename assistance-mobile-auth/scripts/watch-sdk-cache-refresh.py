#!/usr/bin/env python3
"""Poll the original SDK URL until its decoded bytes match the delivered file."""

import argparse
from datetime import datetime
from pathlib import Path
import shutil
import subprocess
import tempfile
import time


SDK_URL = "https://ginkgo.chinaums.com/sign-pay-pro/assist/0.2.5/assistance-mobile-auth/assistance-mobile-auth.0.2.5.umd.cjs"
APP_IDS = ("10037e6f9d903f86019ed8cfb6320365", "8a9481c79c05c8bd019ed8d49fb81df2")
DEFAULT_EXPECTED = Path(__file__).resolve().parents[1] / "release-frozen/static-mobile-auth-0.2.5/dist/assistance-mobile-auth/assistance-mobile-auth.0.2.5.umd.cjs"


def response_headers(path):
    headers = {}
    for line in path.read_text(errors="replace").splitlines():
        if line.startswith("HTTP/"):
            headers = {}  # Ignore proxy CONNECT and interim response headers.
        elif ":" in line:
            key, value = line.split(":", 1)
            headers[key.lower()] = value.strip()
    return headers


def play_alert(log):
    sound = ["/usr/bin/afplay", "/System/Library/Sounds/Glass.aiff"]
    for attempt in range(1, 4):
        try:
            result = subprocess.run(sound, capture_output=True, text=True, timeout=15)
            if result.returncode != 0:
                raise RuntimeError(f"exit={result.returncode} {result.stderr.strip()}")
            log(f"提示音 afplay 第 {attempt}/3 次播放进程成功")
        except (OSError, subprocess.TimeoutExpired, RuntimeError) as error:
            log(f"提示音 afplay 失败：{error}；尝试 say 回退")
            try:
                result = subprocess.run(["/usr/bin/say", "SDK 已刷新"], capture_output=True, text=True, timeout=20)
                if result.returncode != 0:
                    raise RuntimeError(f"exit={result.returncode} {result.stderr.strip()}")
                log("提示音 say 回退进程成功")
                return True
            except (OSError, subprocess.TimeoutExpired, RuntimeError) as fallback_error:
                log(f"提示音失败：{fallback_error}；HTTP 已匹配事实不变，请查看日志")
                return False
    return True


def watch(expected_file, output_dir, interval):
    expected = expected_file.read_bytes()
    if not expected:
        raise ValueError(f"期望文件为空：{expected_file}")
    output_dir.mkdir(parents=True, exist_ok=True)
    body_path, headers_path = output_dir / "latest-body.js", output_dir / "latest-headers.txt"
    with (output_dir / "watch.log").open("a", encoding="utf-8") as logfile:
        def log(message):
            line = f"{datetime.now().astimezone().isoformat(timespec='seconds')} {message}"
            print(line, flush=True)
            logfile.write(line + "\n")
            logfile.flush()

        log(f"开始监测 URL={SDK_URL} interval={interval}s expected={expected_file.resolve()} bytes={len(expected)}")
        while True:
            # Clear the previous attempt, so a failed curl cannot reuse old bytes.
            body_path.write_bytes(b"")
            headers_path.write_text("")
            status, failure = "000", ""
            try:
                result = subprocess.run([
                    "curl", "--silent", "--show-error", "--compressed", "--max-time", "15",
                    "--dump-header", str(headers_path), "--output", str(body_path),
                    "--write-out", "%{http_code}", SDK_URL,
                ], capture_output=True, text=True, timeout=20)
                status = result.stdout.strip() or "000"
                if result.returncode:
                    failure = f"curl exit={result.returncode}: {result.stderr.strip()}"
            except (OSError, subprocess.TimeoutExpired) as error:
                failure = str(error)
            body = body_path.read_bytes()
            headers = response_headers(headers_path)
            cache = " ".join(f"{name}={headers.get(name.lower(), '<missing>')}" for name in ("Cache-Control", "X-Cache", "Age", "Last-Modified"))
            markers = " ".join(f"{label}AppId={'yes' if app_id.encode() in body else 'no'}" for label, app_id in zip(("old", "new"), APP_IDS))
            log(f"HTTP={status} bytes={len(body)} {markers} {cache} URL={SDK_URL}")
            if failure:
                log(f"网络请求失败：{failure}；继续轮询")
            elif status != "200":
                log(f"HTTP 非 200（{status}）；继续轮询")
            elif body == expected:
                saved_body, saved_headers = output_dir / "matched-body.js", output_dir / "matched-headers.txt"
                shutil.copyfile(body_path, saved_body)
                shutil.copyfile(headers_path, saved_headers)
                log(f"已刷新：HTTP 200 且正文与期望文件逐字节一致。body={saved_body.resolve()} headers={saved_headers.resolve()}")
                for app_id in APP_IDS:
                    position = body.find(app_id.encode())
                    snippet = body[max(0, position - 45):position + len(app_id) + 45].decode("utf-8", errors="replace") if position >= 0 else "<missing>"
                    log(f"appId={app_id} 内容片段={snippet!r}")
                play_alert(log)
                log("监测结束；日志和匹配响应已保留")
                return
            else:
                log("正文尚未与期望文件一致；继续轮询")
            time.sleep(interval)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--interval", type=float, default=30)
    parser.add_argument("--output-dir", type=Path, default=Path(tempfile.gettempdir()) / "yuanbao-sdk-cache-watch")
    parser.add_argument("--expected-file", type=Path, default=DEFAULT_EXPECTED)
    args = parser.parse_args()
    if args.interval <= 0:
        parser.error("--interval 必须大于 0")
    try:
        watch(args.expected_file, args.output_dir, args.interval)
    except KeyboardInterrupt:
        print("监测已手动停止", flush=True)
    except (OSError, ValueError) as error:
        parser.exit(1, f"监测无法运行：{error}\n")


if __name__ == "__main__":
    main()
