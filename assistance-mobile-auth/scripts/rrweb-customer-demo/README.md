# 银杏助理 JSSDK rrweb 录屏 Demo

本 Demo 面向 JSSDK 接入方，演示两件事：

1. 在业务方父页面获取“业务页面 + 银杏助理跨域授权 iframe”的统一 rrweb 事件流。
2. 把导出的 rrweb 事件转换为 WebM 或 MP4 视频。

## 版本

- 银杏助理 JSSDK 示例版本：`0.2.3`
- rrweb 固定版本：`2.0.0-alpha.4`
- 跨域 iframe 录制必须在父子页面使用相同 rrweb 版本，并启用 `recordCrossOriginIframes: true`。

## 获取录屏事件

1. 安装依赖并启动 Demo：

   ```bash
   npm install
   npm run demo
   ```

2. 浏览器打开终端输出的地址，不要直接双击用 `file://` 打开。
3. 页面会先启动父页面 rrweb，再允许 JSSDK 打开授权 iframe。
4. 完成一次授权操作后，点击“停止录制”。
5. 点击“下载完整 events.json”。

Demo 默认从固定版本 CDN 加载 rrweb；CDN 不可用时自动使用包内 `vendor/rrweb.min.js`。

父页面的核心代码如下：

```js
const events = []

const stopRecord = window.rrweb.record({
  emit(event) {
    events.push(event) // 这里收到父页面和授权 iframe 合并后的事件
  },
  recordCrossOriginIframes: true,
})
```

银杏助理 iframe 只生成并转发事件，不保存或上传事件。存储、访问控制、保留时长及删除由接入方负责。

## 转换为视频

环境要求：Node.js 20+。生成 MP4 还需要本机安装 `ffmpeg`。

```bash
npm install
npx playwright install chromium

# 直接生成 MP4
node rrweb-events-to-video.mjs ./rrweb-events-xxx.json ./replay.mp4

# 不安装 ffmpeg 时可先生成 WebM
node rrweb-events-to-video.mjs ./rrweb-events-xxx.json ./replay.webm
```

转换脚本会用同一版本 rrweb 回放事件，再通过 Playwright Chromium 录制画面；MP4 输出最后由 ffmpeg 转为 H.264。

## 数据安全

rrweb 事件可能包含页面文本、输入内容和用户操作轨迹，应按敏感数据管理。示例不会自动上传事件；`events.json` 和生成的视频仅保存在运行 Demo/转换脚本的设备上。
