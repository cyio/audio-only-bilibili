# Bilibili Web 音频模式（Chrome 扩展）

基于 [Ashish-Bansal/audio-only-youtube: Listen to only audio on youtube.](https://github.com/Ashish-Bansal/audio-only-youtube)

=======================================

- 节省带宽
- 节省视频解码开销

## Installation

- [ ][安装](https://chrome.google.com/webstore/detail/audio-only-bilibili/pkocpiliahoaohbolmkelakpiphnllog)

## Contribute

1. After cloning the repo,  run `yarn run start`.
2. Open chrome, go to extensions tab, load unpacked extension and select
   `build/dev` directory.
3. Go to bilibili and see extension in live.

In case you edit code, it would automatically rebuild the extension and after
that you need to reload it in the browser.

## 原理

一般主流视频网站都支持视频、音频流分离，扩展获取到音频流地址，设置给`<video>`
