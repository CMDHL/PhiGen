# PhiGen
- Phigros/Phira 制谱器, 视频自动生成谱面，导入phira可打。可调参。
- 在Releases页面下载PhiGen_Chinese.zip并解压后，点击PhiGen.exe即可运行。
- [B站视频](https://www.bilibili.com/video/BV1eK411t7XE)
- 目前代码很乱，可能有各种问题，但基本上是能跑了。 
  - 导出过程可能有几秒窗口无响应，视频越长可能越明显。本来想把访问每帧像素的部分放在单独的线程里，但线程进程套来套去一直报错就放弃了...
  - 暂时没做报错弹窗，进度与报错信息都统一在窗口上方显示...

## 依赖/第三方库 (如果不打算从源码编译的话可以忽略)

- [Qt](https://www.qt.io/)
  - 我用的是 Qt 5.14.1, Qt Creator 4.11.1

- [Visual Studio](https://visualstudio.microsoft.com/vs/older-downloads/)
  - 在Qt Creator里用msvc2017编译。

- [OpenCV](https://opencv.org/releases/)
  - 用于访问视频每帧各像素。

- [FFmpeg](https://ffmpeg.org/)
  - 用于将视频转MP3。

- [audiowaveform](https://github.com/bbc/audiowaveform)
  - 用于分析音频的波形以采音。

- [7-Zip](https://www.7-zip.org/)
  - 使用 7z.exe 压缩文件。

## 其他参考

- 我基本上是照着Re:PhiEdit的格式搞的，但就是无法导入RPE... 试过添加info.txt以及把.zip改.pez什么的还是不行... 就暂时放弃了。

- 最后，感谢ChatGPT老师的耐心指导！
