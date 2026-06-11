# PhiGen

基于浏览器的 Phigros/Phira 谱面生成器，可将用户提供的音频和视频输入转换为可在 Phira 中游玩的谱面。\
移动设备也可以使用，不需要电脑。\
A browser-based Phigros/Phira chart generator, converting user-provided audio and video inputs into charts playable in Phira.

在线使用 | Live demo: https://cmdhl.github.io/PhiGen/

代码仓库 | Repository: https://github.com/CMDHL/PhiGen

## 项目背景 | Project Context

PhiGen 的早期版本是多年前出于兴趣制作的，并保留在一个单独的分支中。此版本经过了较大幅度的修改和扩展，作为 CS6682 的结课作业完成。\
An earlier version of PhiGen was originally made for fun years ago, and kept as a separate branch. This version was substantially revised and extended as the final project for CS6682.

## AI 协助 | AI Assistance

本版本也在编码、调试和文档编写过程中使用了 AI 协助。项目的原始想法、方向、设计选择、实现规划以及最终责任仍由项目作者承担。\
This version was also developed with AI assistance in coding, debugging, and documentation. The original idea, project direction, design choices, implementation planning, and final responsibility for the work remain with the project author.

## 第三方库与模型 | Third-Party Libraries and Models

本项目使用以下第三方库与模型：\
This project uses the following third-party libraries and models:

- [fflate](https://github.com/101arrowz/fflate)，通过 jsDelivr 加载，用于生成 ZIP 文件。fflate 使用 MIT 许可证。| loaded from jsDelivr, for ZIP file generation. fflate is MIT licensed.

- [OpenCV.js](https://opencv.org/)，通过 OpenCV 文档 CDN 加载，用于浏览器端视觉跟踪中的图像/模板匹配。OpenCV 4.5.0 及更新版本使用 Apache-2.0 许可证。| loaded from the OpenCV documentation CDN, for image/template matching in browser-based visual tracking. OpenCV 4.5.0 and newer are Apache-2.0 licensed.

- [TensorFlow.js](https://github.com/tensorflow/tfjs)，通过 jsDelivr 加载，作为浏览器端机器学习运行时。TensorFlow.js 使用 Apache-2.0 许可证。| loaded from jsDelivr, as the browser ML runtime. TensorFlow.js is Apache-2.0 licensed.

- [TensorFlow.js pose-detection](https://github.com/tensorflow/tfjs-models/tree/master/pose-detection)，通过 jsDelivr 加载，用于基于 MoveNet 的姿态检测。TensorFlow.js models 仓库使用 Apache-2.0 许可证。| loaded from jsDelivr, for MoveNet-based pose detection. The TensorFlow.js models repository is Apache-2.0 licensed.

- [MoveNet](https://blog.tensorflow.org/2021/05/next-generation-pose-detection-with-movenet-and-tensorflowjs.html)，通过 TensorFlow.js pose-detection 使用，用于单人与多人身体关键点检测。 | used through TensorFlow.js pose-detection for single-person and multi-person body keypoint detection.
