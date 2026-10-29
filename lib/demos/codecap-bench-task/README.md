# 按 CodeCap-Bench 协议做一道视频重建题

打开 [三栏同步对照](https://bblog.031105.xyz/lib/demos/codecap-bench-task/compare.html)：参考视频、单文件 HTML 实时画面、由 HTML 渲染得到的 MP4。可同步播放、暂停、逐帧前后定位，也可查看三次数字交换的中点。

## 题目与来源

输入文件是 `input/reference.mp4`：24 秒、300×180、24 fps、576 帧、无音频。来自 Wikimedia Commons 上 Swfung8 的 [Bubble-sort-example-300px.gif](https://commons.wikimedia.org/wiki/File:Bubble-sort-example-300px.gif)，原动画 153.7 秒。此题截取前 24 秒并转码，不重新设计画面。完整来源 GIF 另存为 `input/source.gif`。

官方 [CodeCap-Bench 项目页](https://codecap-bench.github.io/) 在 2026-10-29 复核时仍显示 Code、Dataset 链接待开放，未提供完整案例视频。此处是使用公开动画的自选题，不声称属于官方 323 个样本。

目标是用纯代码重建这段完整的 24 秒参考片段，包括八个数字的位置、红框、三次数值交换、红框移到下一对数字，以及比较前的短暂闪烁和停顿。

## 提交文件

`index.html` 是唯一提交入口。直接打开会自动播放，在窗口中按原比例缩放；画面只有参考动画中的数字和红框。用原生 Canvas 的 `fillText`、`strokeRect` 绘制，根据时间计算状态。没有视频、图片、参考帧、纹理、字形轮廓、外部字体或第三方库依赖。

接口为 `window.videoCompare = { duration: 24, width: 300, height: 180, seek(seconds), play() }`。`seek` 暂停自动播放，恢复请求时刻的画面，支持重复和乱序调用。`play` 是额外的预览便利方法。

`compare.html` 是查看结果的辅助页面，会加载输入和成品视频以及提交 HTML；它与提交文件分开。其播放器和说明不进入提交画面，也不进入 `reconstructed.mp4`。

## 实际执行的流程

协议依据是 [论文 Appendix A、C.1](https://arxiv.org/html/2610.37341v1)：从参考视频抽帧观察，写单文件 HTML，检查同时间截图并修正；视频渲染以 24 fps 调用页面的 `seek(seconds)`，截图后编码。

1. 下载公开动画并确认作者与许可，使用 FFmpeg 截取前 24 秒转为题目输入。
2. ffprobe 读取输入尺寸、帧率、帧数与时长；从实际 MP4 抽帧观察布局与变化时刻。
3. 写 Canvas 版本，先对照 2 秒画面修正数字位置和红框，再按实际 MP4 的转码后帧号修正交换、框移动及闪烁时刻。源动画的运动本身按约 100 ms 步进更新，重建保留该节奏。
4. 将最终 HTML 独立复制到临时目录，仅保留 `index.html`，用无头 Chromium 打开。
5. 对 `i=0…575` 调用 `seek(i/24)`，截图为 `000000.png…000575.png`。
6. 用 FFmpeg 将这些浏览器截图按 24 fps 编码为 `reconstructed.mp4`，没有录屏或二次生成模型参与。

随附的 `capture.mjs` 和 `render.mjs` 是本次按论文描述编写的本地脚本；并非尚未公开的作者原始脚本。运行环境为 Node.js 22、Playwright/Chromium 和 FFmpeg。脚本默认导入 `playwright` 包，也可设置 `PLAYWRIGHT_MODULE_PATH` 为已有模块路径。首次使用可先运行 `npm install playwright` 与 `npx playwright install chromium`。

在本目录运行：

```sh
# 定位并保存一帧
node capture.mjs index.html 6.416666667 frame.png

# 完整重渲染；不指定帧目录时会清理中间 PNG
node render.mjs index.html reconstructed.mp4

# 保留中间截图以便检查
node render.mjs index.html reconstructed.mp4 frames

# 输入准备（原动画前 24 秒）
ffmpeg -ignore_loop 1 -i input/source.gif -t 24 -vf fps=24 \
  -an -c:v libx264 -crf 12 -pix_fmt yuv420p input/reference.mp4
```

实际编码参数：

```sh
ffmpeg -framerate 24 -start_number 0 -i frames/%06d.png \
  -frames:v 576 -an -c:v libx264 -crf 12 -pix_fmt yuv420p \
  -movflags +faststart reconstructed.mp4
```

## 验收与边界

`reconstructed.mp4.render.json` 是去除本机路径后的实际渲染记录：576 帧，300×180，24 秒，隔离目录仅含 HTML，浏览器错误和额外请求均为空。`keyframes.png` 展示起始、红框出现、三次交换中点及末帧的对应时间对照；`comparison.mp4` 是原视频与渲染视频的并排观看版本，标题仅用于对照。

辅助像素检查：两段编码视频的全帧 SSIM 为 0.987767；只比较包含数字和红框的区域（x=0、y=60、w=300、h=60）为 0.960835。大面积白底会抬高全帧相似度，因此一并给出内容区域结果。它们不是论文的 V-JEPA 相似度、对象时空 IoU 或模型 judge 分数，不能当作官方 benchmark 成绩。

可见近似包括系统字体的数字轮廓与抗锯齿、若干约 1–2 像素的位置差异，以及红框边缘的锐度；并不宣称逐像素复原。帧数、时长、尺寸和关键动作顺序已保留。最终界面检查和重复定位证据见已去除本机临时目录的 `validation.json`；`files.zip` 包含本目录的完整公开文件。

对照页暂停时把两段 MP4 定位到所选帧的时间区间中点，避免浏览器在浮点时间边界显示前一帧；界面标示的仍是该帧起点 `i/24`，HTML 也定位到该起点。已通过视频帧回调核对输入、输出真正显示的帧号一致，未只比较 `currentTime` 数字。提交渲染脚本始终使用论文规定的 `seek(i/24)`。

## 许可

原动画作者：Swfung8，2011-04-18，Wikimedia Commons。[CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)。原 GIF、截取和转码后的输入视频，以及本次画面重建和对照视频按同一许可提供；本次改动已在上文列明。参考资源只作为观察输入，未嵌入提交代码。编码和抓帧脚本为本次新写。
