# Bilibili Web 音频模式（Chrome 扩展）

基于 [Ashish-Bansal/audio-only-youtube: Listen to only audio on youtube.](https://github.com/Ashish-Bansal/audio-only-youtube)

=======================================

好处：
- 节省带宽（视频部分）
- 节省视频解码、渲染的系统资源开销

使用：
- 点击扩展图标切换模式

效果:

![效果](https://pic3.zhimg.com/80/v2-a62fb0dd18360c753d1b03f9a7abee6a_720w.jpg)

## 安装

1. 下载：[Releases · cyio/audio-only-bilibili](https://github.com/cyio/audio-only-bilibili/releases)
2. 打开：`chrome://extensions`，将下载包拖入安装

> 由于上传 Chrome 商店,要求的升级改动(v2 => v3)较大,暂不会支持

## 贡献

1. After cloning the repo,  run `npm run dev`.
2. Open chrome, go to extensions tab, load unpacked extension and select
   `build/dev` directory.
3. Go to bilibili and see extension in live.

In case you edit code, it would automatically rebuild the extension and after
that you need to reload it in the browser.

## 原理

一般主流视频网站都支持视频、音频流分离，扩展获取到音频流地址，设置给`<video>`
