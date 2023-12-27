# PhiGen
- A Phigros/Phira chart generator, converting a video to a chart that's playable in Phira.
- To use it, simply download PhiGen_English.zip from Releases page and click PhiGen.exe to open. The dependencies listed below are required only for building from the source code instead.
- [Demonstration Videos](https://b23.tv/Y1A9JUy)
- The current code is messy and buggy but in general, it works. 
  - During the export process, especially with longer videos, it might briefly become unresponsive. This is due to difficulties in threading 'parseVideo()' to trigger subsequent QProcesses. As a result, it remains in the main thread, causing UI delays.
  - Error message pop-ups haven't been implemented. Instead, debug messages, including those from third-party executables, appear at the top of the window for issue identification.

## Dependencies (only needed if you want to build from source)

- [Qt](https://www.qt.io/)
  - Developed using Qt 5.14.1 and Qt Creator 4.11.1.

- [Visual Studio](https://visualstudio.microsoft.com/vs/older-downloads/)
  - Compiled using msvc2017 in Qt Creator.

- [OpenCV](https://opencv.org/releases/)
  - Used for frame pixel traversal in videos.

- [FFmpeg](https://ffmpeg.org/)
  - Used to convert videos to mp3 files.

- [audiowaveform](https://github.com/bbc/audiowaveform)
  - Used to analyze waveforms in audio files and insert notes accordingly.

- [7-Zip](https://www.7-zip.org/)
  - Used 7z.exe to zip the files.

## Other References

- I basically followed the output format of Re:PhiEdit, but somehow I could not import my generated zip into RPE even after manually adding info.txt and changing the extension to .pez, so I guess I am missing something... 
- Special thanks to ChatGPT for all the assistance, including finding libraries, debugging, phrasing this document, and more!
