# PhiGen V2

A browser-based Phigros/Phira chart generator, converting user-provided audio and video inputs into charts playable in Phira.

Live demo: https://cmdhl.github.io/PhiGen/

Repository: https://github.com/CMDHL/PhiGen

## Project Context

An earlier version of PhiGen was originally made for fun years ago, and kept as a separate branch. This version was substantially revised and extended as the final project for CS6682.

## AI Assistance

This version was also developed with AI assistance in coding, debugging, and documentation. The original idea, project direction, design choices, implementation planning, and final responsibility for the work remain with the project author.

## Third-Party Libraries and Models

This project uses the following third-party libraries and models:

- [fflate](https://github.com/101arrowz/fflate), loaded from jsDelivr, for ZIP file generation. fflate is MIT licensed.
- [OpenCV.js](https://opencv.org/), loaded from the OpenCV documentation CDN, for image/template matching in browser-based visual tracking. OpenCV 4.5.0 and newer are Apache-2.0 licensed.
- [TensorFlow.js](https://github.com/tensorflow/tfjs), loaded from jsDelivr, as the browser ML runtime. TensorFlow.js is Apache-2.0 licensed.
- [TensorFlow.js pose-detection](https://github.com/tensorflow/tfjs-models/tree/master/pose-detection), loaded from jsDelivr, for MoveNet-based pose detection. The TensorFlow.js models repository is Apache-2.0 licensed.
- [MoveNet](https://blog.tensorflow.org/2021/05/next-generation-pose-detection-with-movenet-and-tensorflowjs.html), used through TensorFlow.js pose-detection for single-person and multi-person body keypoint detection.
