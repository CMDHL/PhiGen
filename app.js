const els = {
  audioInput: document.querySelector("#audioInput"),
  useVideoAudioInput: document.querySelector("#useVideoAudioInput"),
  useVideoCoverInput: document.querySelector("#useVideoCoverInput"),
  coverInput: document.querySelector("#coverInput"),
  videoInput: document.querySelector("#videoInput"),
  targetInput: document.querySelector("#targetInput"),
  video: document.querySelector("#videoPreview"),
  outputCanvas: document.querySelector("#outputCanvas"),
  previewBody: document.querySelector("#previewBody"),
  previewToggle: document.querySelector("#previewToggleButton"),
  workCanvas: document.querySelector("#workCanvas"),
  targetCanvas: document.querySelector("#targetCanvas"),
  targetPreview: document.querySelector("#targetPreview"),
  targetList: document.querySelector("#targetList"),
  audioButton: document.querySelector("#audioButton"),
  removeAudioButton: document.querySelector("#removeAudioButton"),
  visualButton: document.querySelector("#visualButton"),
  removeVisualButton: document.querySelector("#removeVisualButton"),
  exportButton: document.querySelector("#exportButton"),
  play: document.querySelector("#playButton"),
  previewSlider: document.querySelector("#previewSlider"),
  waveCanvas: document.querySelector("#waveCanvas"),
  wavePanel: document.querySelector("#wavePanel"),
  statusTitle: document.querySelector("#statusTitle"),
  statusText: document.querySelector("#statusText"),
  progress: document.querySelector("#progressBar"),
  inputPanels: document.querySelectorAll("[data-input-panel]"),
  settingsSections: document.querySelectorAll("[data-settings-section]"),
  pixelNotes: document.querySelectorAll("[data-pixel-note]"),
  stickOnsetOnlyInput: document.querySelector("#stickOnsetOnlyInput"),
  stickHoldPoseInput: document.querySelector("#stickHoldPoseInput"),
  stickFpsPanel: document.querySelector("[data-stick-fps-panel]"),
};

const P = {
  pixelPerSec: 512,
  msPerPixel: 1000 / 512,
  dragInterval: 0.1,
  chartWidth: 968,
  chartHeight: 560,
  videoCols: 89,
  videoRows: 57,
  videoX0: -484,
  videoY0: 280,
  videoXStep: 11,
  videoYStep: 10,
  maxTrackWidth: 480,
  stickFrameWidth: 180,
  noteWidthAtSizeOne: 157,
  localSearchRadius: 96,
  previewLead: 3.5,
  previewFallPxPerSec: 120,
  previewDefaultFallSpeed: 0.25,
  previewNoteWidth: 100,
  previewMargin: 100,
  sliderScale: 1000,
  oldVertiMax: 211.36,
  oldHoriOuterMax: 590.63,
  oldHoriInnerMax: 421.88,
  oldXInc: 50,
  oldShortXInc: 150,
};

const LINE_PRESETS = {
  center: { x: 0, y: 0, rotation: 0 },
  left: { x: -500, y: 0, rotation: -90 },
  right: { x: 500, y: 0, rotation: 90 },
  up: { x: 0, y: 300, rotation: 0 },
  down: { x: 0, y: -300, rotation: 180 },
};

const AUDIO_DETECTION = {
  // Browser-only spectral-flux onset detector defaults.
  // These replace only the old amplitude peak/minimum contrast logic.
  thresholdStdScale: 0.78,
  thresholdFloor: 0.043,
  oldVolumeDiff: 3,
};

const PIXEL_DECORATION_TEMPLATES = ["fake-pixels-bw", "fake-pixels-grey"];

let cvReady = false;
let latestPreview = null;
let latestPreviewFrame = null;
let latestPreviewJudgeLines = null;
let latestPreviewJudgeLinesKey = "";
let previewEvents = [];
let pixelPreviewEvents = [];
let targetFiles = [];
let audioAbort = null;
let visualAbort = null;
let audioStatus = "empty";
let visualStatus = "empty";
let exportStatus = "empty";
let latestAudioBuffer = null;
let latestAudioAnalysis = null;
let latestVisualTracking = null;
let latestDecorationLines = [];
let latestCoverBlob = null;
let previewVideoDuration = 0;
let previewPlaying = false;
let previewDragging = false;
let previewVisible = true;
let previewRaf = 0;
let previewStartClock = 0;
let previewStartTime = 0;
let audioCtx = null;
let audioSource = null;
const stickPoseDetectorPromises = new Map();
const APP_BUILD_ID = "stick-multipose-2026-05-11-a";
let lastStaticFourDebug = null;
console.log(`[PhiGen] Loaded app.js build ${APP_BUILD_ID}`);

function invalidatePreviewJudgeLines() {
  latestPreviewJudgeLines = null;
  latestPreviewJudgeLinesKey = "";
}

window.Module = {
  onRuntimeInitialized() {
    cvReady = true;
    setStatus("Ready", "OpenCV loaded. Upload files and process audio / visual.");
    updateProcessButtons();
  },
};

els.audioInput.addEventListener("change", () => {
  const file = els.audioInput.files?.[0];
  stopPreviewPlayback(true);
  latestAudioBuffer = null;
  latestAudioAnalysis = null;
  audioStatus = "empty";
  invalidatePreviewJudgeLines();
  els.previewSlider.value = 0;
  els.previewSlider.max = 0;
  els.previewSlider.disabled = true;
  els.play.disabled = true;
  drawWaveform(0);
  renderPreviewAtTime(0);
  if (file) setStatus("Audio loaded", file.name);
  updateInputPanels();
  updateProcessButtons();
});

els.useVideoAudioInput.addEventListener("change", () => {
  latestAudioBuffer = null;
  latestAudioAnalysis = null;
  invalidatePreviewJudgeLines();
  audioStatus = "empty";
  updateInputPanels();
  updateProcessButtons();
  renderCurrentPreview();
});

els.useVideoCoverInput.addEventListener("change", () => {
  latestCoverBlob = null;
  updateInputPanels();
  updateProcessButtons();
});

els.coverInput.addEventListener("change", () => {
  latestCoverBlob = null;
  if (els.coverInput.files?.[0]) els.useVideoCoverInput.checked = false;
  else els.useVideoCoverInput.checked = true;
  updateInputPanels();
  updateProcessButtons();
});

els.videoInput.addEventListener("change", () => {
  const file = els.videoInput.files?.[0];
  if (!file) return;
  stopPreviewPlayback(true);
  latestAudioBuffer = null;
  latestAudioAnalysis = null;
  latestVisualTracking = null;
  latestDecorationLines = [];
  latestCoverBlob = null;
  latestPreviewFrame = null;
  previewEvents = [];
  pixelPreviewEvents = [];
  invalidatePreviewJudgeLines();
  audioStatus = "empty";
  visualStatus = "empty";
  previewVideoDuration = 0;
  els.video.src = URL.createObjectURL(file);
  els.previewSlider.value = 0;
  els.previewSlider.max = 0;
  els.previewSlider.disabled = true;
  els.play.disabled = true;
  drawWaveform(0);
  drawPreview({ x: 0, y: 0, rotation: 0, detected: false, time: 0 }, [], null, { showLine: false, currentTime: 0 });
  setStatus("Video loaded", file.name);
  updateInputPanels();
  updateProcessButtons();
});

els.video.addEventListener("loadedmetadata", () => {
  previewVideoDuration = Math.max(0, els.video.duration || 0);

  // Do not show raw video frames before visual tracking has produced frames.
  // Before visual processing, the preview canvas stays as an explicit waiting
  // placeholder so it does not look like a laggy / broken frame preview.
  setSliderForPreviewEvents();
  renderPreviewAtTime(0);
  updateProcessButtons();
});

els.targetInput.addEventListener("change", () => {
  targetFiles = Array.from(els.targetInput.files || []);
  latestPreviewFrame = null;
  previewEvents = [];
  pixelPreviewEvents = [];
  latestVisualTracking = null;
  latestDecorationLines = [];
  visualStatus = "empty";
  latestCoverBlob = null;
  invalidatePreviewJudgeLines();
  renderTargetList();
  if (targetFiles.length) {
    els.targetPreview.src = URL.createObjectURL(targetFiles[0]);
    setStatus("Targets loaded", `${targetFiles.length} target image(s). Top item has highest priority.`);
  }
  setSliderForPreviewEvents();
  renderCurrentPreview();
  updateProcessButtons();
});

els.previewSlider.addEventListener("input", () => {
  previewDragging = true;
  stopPreviewAudio();
  stopPreviewPlayback(false);
  renderPreviewAtSlider();
});

els.previewSlider.addEventListener("pointerdown", () => {
  previewDragging = true;
  stopPreviewAudio();
  stopPreviewPlayback(false);
});

els.previewSlider.addEventListener("pointerup", () => {
  previewDragging = false;
});

els.play.addEventListener("click", () => {
  if (previewPlaying) {
    stopPreviewPlayback(true);
  } else {
    startPreviewPlayback();
  }
});

els.previewToggle.addEventListener("click", () => {
  previewVisible = !previewVisible;
  els.previewBody.hidden = !previewVisible;
  els.previewToggle.textContent = previewVisible ? "Hide preview" : "Show preview";
  stopPreviewPlayback(true);
  updateProcessButtons();
  if (previewVisible) renderCurrentPreview();
});

new ResizeObserver(() => {
  if (previewVisible) drawWaveform(currentPreviewTime());
}).observe(els.wavePanel);

document.querySelectorAll("input[name='judgeTemplate'], input[name='decorationTemplate']").forEach((input) => {
  input.addEventListener("change", () => {
    if (input.name === "decorationTemplate" && input.checked) applyDecorationDefaults(input.value);
    invalidatePreviewJudgeLines();
    updateInputPanels();
    updateSettingsVisibility();
    updateProcessButtons();
    renderCurrentPreview();
  });
});

[els.stickOnsetOnlyInput, els.stickHoldPoseInput].forEach((input) => {
  input.addEventListener("change", () => {
    updateSettingsVisibility();
    updateProcessButtons();
  });
});

function renderTargetList() {
  els.targetList.replaceChildren();
  targetFiles.forEach((file, index) => {
    const item = document.createElement("div");
    item.className = "target-item";

    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.alt = "";

    const name = document.createElement("span");
    name.textContent = `${index + 1}. ${file.name}`;

    const up = document.createElement("button");
    up.type = "button";
    up.textContent = "Up";
    up.disabled = index === 0;
    up.addEventListener("click", () => moveTarget(index, -1));

    const down = document.createElement("button");
    down.type = "button";
    down.textContent = "Dn";
    down.disabled = index === targetFiles.length - 1;
    down.addEventListener("click", () => moveTarget(index, 1));

    item.append(img, name, up, down);
    els.targetList.append(item);
  });
}

function moveTarget(index, delta) {
  const next = index + delta;
  if (next < 0 || next >= targetFiles.length) return;
  [targetFiles[index], targetFiles[next]] = [targetFiles[next], targetFiles[index]];
  if (targetFiles.length) els.targetPreview.src = URL.createObjectURL(targetFiles[0]);
  renderTargetList();
}

function throwIfAborted(signal) {
  if (!signal?.aborted) return;
  throw new DOMException("Generation stopped", "AbortError");
}

els.audioButton.addEventListener("click", async () => {
  if (audioAbort) {
    audioAbort.abort();
    setStatus("Stopping audio", "Cancelling audio processing.");
    updateProcessButtons();
    return;
  }
  if (audioStatus === "done") return;
  await processAudio();
});

els.visualButton.addEventListener("click", async () => {
  if (visualAbort) {
    visualAbort.abort();
    setStatus("Stopping visual", "Cancelling visual processing after the current frame.");
    updateProcessButtons();
    return;
  }
  if (visualStatus === "done") return;
  await processVisual();
});

els.removeVisualButton.addEventListener("click", () => {
  if (visualStatus !== "done") return;
  removeVisualResult();
});

els.removeAudioButton.addEventListener("click", () => {
  if (audioStatus !== "done") return;
  removeAudioResult();
});

els.exportButton.addEventListener("click", async () => {
  await exportChart();
});

function currentPreviewTime() {
  if (previewEvents.length > 0) {
    const index = Math.max(0, Math.min(previewEvents.length - 1, Math.round(Number(els.previewSlider.value) || 0)));
    return previewEvents[index]?.time ?? 0;
  }
  return Math.max(0, (Number(els.previewSlider.value) || 0) / P.sliderScale);
}

function setPreviewTime(time) {
  const duration = previewEvents.length
    ? Math.max(previewVideoDuration, latestAudioAnalysis?.duration || latestVisualTracking?.duration || 0)
    : Math.max(latestAudioAnalysis?.duration || 0, 0);
  if (duration > 0) {
    els.previewSlider.max = Math.max(0, Math.round(duration * P.sliderScale));
    setPreviewControlsEnabled(true);
  }
  els.previewSlider.value = Math.max(0, Math.min(Number(els.previewSlider.max) || 0, Math.round(time * P.sliderScale)));
}

function setSliderForPreviewEvents() {
  if (previewEvents.length > 0) {
    els.previewSlider.max = Math.max(0, previewEvents.length - 1);
    els.previewSlider.step = 1;
    setPreviewControlsEnabled(true);
  } else {
    // No raw-video preview before visual processing. If audio exists, keep the
    // slider useful for the waveform only; otherwise keep it disabled.
    const duration = Math.max(latestAudioAnalysis?.duration || 0, 0);
    els.previewSlider.max = Math.max(0, Math.round(duration * P.sliderScale));
    els.previewSlider.step = 1;
    setPreviewControlsEnabled(!!duration);
  }
}

function sliderIndex() {
  return Math.max(0, Math.min(previewEvents.length - 1, Math.round(Number(els.previewSlider.value) || 0)));
}

function previewControlsLocked() {
  return !previewVisible || audioStatus === "processing" || visualStatus === "processing" || exportStatus === "processing";
}

function setPreviewControlsEnabled(enabled) {
  const active = enabled && !previewControlsLocked();
  els.previewSlider.disabled = !active;
  els.play.disabled = !active;
}

function updateProcessButtons() {
  const hasVideo = !!els.videoInput.files?.[0];
  const hasAudioSource = !!audioSourceFile();
  const hasTargets = targetFiles.length > 0;
  const settings = readSettings();
  const needsVisual = settings.judgeTemplate === "tracking-single";
  const canProcessVisual = needsVisual || isImplementedDecoration(settings.decorationTemplate);
  const needsProcessedAudioForVisual = settings.decorationTemplate === "stick-figure" && settings.stickDetectOnsetOnly;
  const needsVideoForDecoration = settings.decorationTemplate !== "none";
  const needsVideoForExport = needsVisual || needsVideoForDecoration;

  els.audioButton.textContent = audioStatus === "processing" ? "Stop audio" : "Process audio";
  els.visualButton.textContent = visualStatus === "processing" ? "Stop visual" : "Process visual";

  els.audioButton.disabled =
    (audioStatus !== "processing" && !hasAudioSource) || audioStatus === "done";
  els.visualButton.disabled = visualStatus === "done" || (
    visualStatus !== "processing" && (
      !canProcessVisual ||
      !hasVideo ||
      (needsVisual && (!hasTargets || !cvReady)) ||
      (needsProcessedAudioForVisual && audioStatus !== "done")
    )
  );

  els.removeAudioButton.disabled = audioStatus !== "done";
  els.removeVisualButton.disabled = visualStatus !== "done";
  els.exportButton.disabled =
    exportStatus === "processing" ||
    !(audioStatus === "done" || visualStatus === "done") ||
    (needsVisual && visualStatus !== "done") ||
    (needsVideoForExport && !hasVideo);
  const hasPreview = previewEvents.length > 0 || latestAudioAnalysis?.duration > 0;
  setPreviewControlsEnabled(hasPreview);
}

function updateInputPanels() {
  const settings = readSettings();
  const needsTargets = settings.judgeTemplate === "tracking-single";
  const needsVideo = needsTargets || settings.decorationTemplate !== "none" || els.useVideoAudioInput.checked || els.useVideoCoverInput.checked;
  const needsAudioFile = !els.useVideoAudioInput.checked;
  const shouldShow = {
    audio: needsAudioFile,
    video: needsVideo,
    targets: needsTargets,
    cover: !els.useVideoCoverInput.checked,
  };

  els.inputPanels.forEach((panel) => {
    const kind = panel.dataset.inputPanel;
    const visible = shouldShow[kind] ?? true;
    panel.hidden = !visible;
    panel.querySelectorAll("input, button").forEach((control) => {
      control.disabled = !visible;
    });
  });
}

function updateSettingsVisibility() {
  const settings = readSettings();
  const visibleSections = {
    general: true,
    tracking: settings.judgeTemplate === "tracking-single",
    pixels: isPixelDecoration(settings.decorationTemplate),
    stick: settings.decorationTemplate === "stick-figure",
  };
  const pixelMode = pixelModeForDecoration(settings.decorationTemplate);

  els.settingsSections.forEach((section) => {
    const kind = section.dataset.settingsSection;
    const visible = visibleSections[kind] ?? true;
    section.hidden = !visible;
    section.querySelectorAll("input, button, select, textarea").forEach((control) => {
      control.disabled = !visible;
    });
  });

  els.pixelNotes.forEach((note) => {
    note.hidden = note.dataset.pixelNote !== pixelMode;
  });

  if (els.stickFpsPanel) {
    els.stickFpsPanel.hidden = settings.stickDetectOnsetOnly;
    els.stickFpsPanel.querySelectorAll("input, button, select, textarea").forEach((control) => {
      control.disabled = settings.stickDetectOnsetOnly || settings.decorationTemplate !== "stick-figure";
    });
  }
}

function applyDecorationDefaults(template) {
  const thresholdInput = document.querySelector("#fakePixelThresholdInput");
  if (!thresholdInput) return;
  if (template === "fake-pixels-grey") thresholdInput.value = "5";
  if (template === "fake-pixels-bw") thresholdInput.value = "128";
}

function isPixelDecoration(template) {
  return PIXEL_DECORATION_TEMPLATES.includes(template);
}

function isImplementedDecoration(template) {
  return isPixelDecoration(template) || template === "stick-figure";
}

function pixelModeForDecoration(template) {
  return template === "fake-pixels-grey" ? "grey" : "bw";
}

function audioSourceFile() {
  return els.useVideoAudioInput.checked
    ? els.videoInput.files?.[0] || null
    : els.audioInput.files?.[0] || null;
}

function discardAudioResult() {
  stopPreviewPlayback(true);
  latestAudioAnalysis = null;
  latestAudioBuffer = null;
  audioStatus = "empty";
  invalidatePreviewJudgeLines();
  setSliderForPreviewEvents();
  drawWaveform(currentPreviewTime());
  renderCurrentPreview();
  updateProcessButtons();
}

function removeAudioResult() {
  discardAudioResult();
  setStatus("Audio removed", "Audio notes were removed. You can process audio again or export visual-only.");
}

function discardVisualResult() {
  stopPreviewPlayback(true);
  latestVisualTracking = null;
  latestDecorationLines = [];
  latestCoverBlob = null;
  latestPreviewFrame = null;
  previewEvents = [];
  pixelPreviewEvents = [];
  visualStatus = "empty";
  invalidatePreviewJudgeLines();
  setSliderForPreviewEvents();
  renderCurrentPreview();
  updateProcessButtons();
}

function removeVisualResult() {
  discardVisualResult();
  setStatus("Visual removed", "Visual tracking was removed. You can process visual again or export audio-only.");
}

async function processAudio() {
  const sourceFile = audioSourceFile();
  if (!sourceFile) {
    setStatus("Missing input", "Choose an audio file or a video first.");
    return;
  }

  audioAbort = new AbortController();
  const signal = audioAbort.signal;
  audioStatus = "processing";
  latestAudioBuffer = null;
  latestAudioAnalysis = null;
  invalidatePreviewJudgeLines();
  updateProcessButtons();
  stopPreviewPlayback(true);
  updateProgress(0);

  try {
    setStatus("Processing audio", "Decoding audio and detecting notes.");
    const audioBuffer = await decodeAudio(sourceFile);
    throwIfAborted(signal);
    latestAudioBuffer = audioBuffer;

    const audioAnalysis = generateAudioAnalysis(audioBuffer, readSettings());
    throwIfAborted(signal);
    latestAudioAnalysis = audioAnalysis;
    invalidatePreviewJudgeLines();

    updateProgress(1);
    audioStatus = "done";
    setSliderForPreviewEvents();
    drawWaveform(currentPreviewTime());
    renderCurrentPreview();
    const longCount = (audioAnalysis.detections || []).filter((d) => (d.end || 0) - (d.start || 0) > (readSettings().holdTime || 0)).length;
    setStatus("Audio done", `Detected ${audioAnalysis.notes.length} notes from ${audioAnalysis.detections.length} onset/stop windows (${longCount} long).`);
  } catch (err) {
    console.error(err);
    if (err?.name === "AbortError") {
      discardAudioResult();
      updateProgress(0);
      setStatus("Audio stopped", "Audio processing cancelled.");
    } else {
      discardAudioResult();
      updateProgress(0);
      setStatus("Audio failed", err?.message || String(err));
    }
  } finally {
    audioAbort = null;
    updateProcessButtons();
  }
}

async function processVisual() {
  const videoFile = els.videoInput.files?.[0];
  const settings = readSettings();
  if (!videoFile) {
    setStatus("Missing input", "Choose a video first.");
    return;
  }
  if (
    settings.judgeTemplate !== "tracking-single" &&
    !isImplementedDecoration(settings.decorationTemplate)
  ) {
    setStatus("No visual template", "Choose target tracking, pixel notes, or stick figure humanoids first.");
    return;
  }
  if (settings.judgeTemplate === "tracking-single" && !targetFiles.length) {
    setStatus("Missing input", "Choose at least one target image.");
    return;
  }
  if (settings.judgeTemplate === "tracking-single" && (!cvReady || !window.cv?.Mat)) {
    setStatus("Still loading", "OpenCV is not ready yet.");
    return;
  }
  if (settings.decorationTemplate === "stick-figure" && settings.stickDetectOnsetOnly && audioStatus !== "done") {
    setStatus("Process audio first", "Stick figure onset detection needs processed audio notes.");
    return;
  }

  visualAbort = new AbortController();
  const signal = visualAbort.signal;
  visualStatus = "processing";
  latestVisualTracking = null;
  latestDecorationLines = [];
  latestCoverBlob = null;
  latestPreviewFrame = null;
  previewEvents = [];
  pixelPreviewEvents = [];
  invalidatePreviewJudgeLines();
  updateProcessButtons();
  stopPreviewPlayback(true);
  updateProgress(0);

  try {
    setStatus("Processing visual", visualProcessLabel(settings));
    latestCoverBlob = await captureCover(videoFile);
    throwIfAborted(signal);

    if (isPixelDecoration(settings.decorationTemplate)) {
      const fake = await buildFakePixelLines(videoFile, settings, signal, true);
      throwIfAborted(signal);
      latestDecorationLines = fake.lines;
      invalidatePreviewJudgeLines();
    }

    if (settings.judgeTemplate === "tracking-single") {
      updateProgress(0.12);
      previewEvents = [];
      const tracking = await trackTarget(videoFile, targetFiles, settings, signal);
      throwIfAborted(signal);
      latestVisualTracking = tracking;
      invalidatePreviewJudgeLines();
    }

    if (settings.decorationTemplate === "stick-figure") {
      if (pixelPreviewEvents.length) previewEvents = [];
      const stick = await buildStickFigureLines(videoFile, settings, signal, !previewEvents.length);
      throwIfAborted(signal);
      latestDecorationLines = stick.lines;
      invalidatePreviewJudgeLines();
    }

    visualStatus = "done";
    latestPreviewFrame = null;
    updateProgress(1);
    setSliderForPreviewEvents();
    renderCurrentPreview();
    const trackingCount = latestVisualTracking?.chartEvents?.length || 0;
    const decorationCount = latestDecorationLines.reduce((sum, line) => sum + (line.notes?.length || 0), 0);
    setStatus("Visual done", decorationCount ? `Created ${decorationCount} fake decoration notes.` : `Created ${trackingCount} line keyframes.`);
  } catch (err) {
    console.error(err);
    if (err?.name === "AbortError") {
      discardVisualResult();
      updateProgress(0);
      setStatus("Visual stopped", "Visual processing cancelled. Processed preview states were cleared.");
    } else {
      discardVisualResult();
      updateProgress(0);
      setStatus("Visual failed", err?.message || String(err));
    }
  } finally {
    visualAbort = null;
    updateProcessButtons();
  }
}

async function exportChart() {
  const videoFile = els.videoInput.files?.[0];
  const sourceFile = audioSourceFile();
  const settings = readSettings();
  const requiresVideo = settings.judgeTemplate === "tracking-single" || settings.decorationTemplate !== "none";
  if (!sourceFile || (audioStatus !== "done" && visualStatus !== "done")) {
    setStatus("Nothing to export", "Process audio or visual first.");
    return;
  }
  if (requiresVideo && !videoFile) {
    setStatus("Missing video", "This template needs a video file.");
    return;
  }

  exportStatus = "processing";
  updateProcessButtons();
  stopPreviewPlayback(true);
  updateProgress(0);

  try {
    if (settings.decorationTemplate !== "none" && !isImplementedDecoration(settings.decorationTemplate)) {
      setStatus("Decoration not implemented", "Rect matching is not implemented yet.");
      return;
    }

    setStatus("Exporting", "Preparing chart package.");

    let audioBuffer = latestAudioBuffer;
    if (!audioBuffer) {
      audioBuffer = await decodeAudio(sourceFile);
      latestAudioBuffer = audioBuffer;
    }

    const notes = audioStatus === "done" ? latestAudioAnalysis?.notes || [] : [];
    const visualEvents = visualStatus === "done"
      ? latestVisualTracking?.chartEvents || []
      : [{ time: 0, x: 0, y: 0, rotation: 0, detected: false }];

    const duration = Math.max(
      audioBuffer?.duration || 0,
      latestVisualTracking?.duration || 0,
      previewVideoDuration || 0
    );

    const decorationLines = [];
    if (isPixelDecoration(settings.decorationTemplate)) {
      if (latestDecorationLines.length) {
        decorationLines.push(...latestDecorationLines);
      } else {
        setStatus("Building pixel decoration", "Sampling video changes into fake notes.");
        const fake = await buildFakePixelLines(videoFile, settings);
        decorationLines.push(...fake.lines);
      }
    }

    if (settings.decorationTemplate === "stick-figure") {
      if (latestDecorationLines.length) {
        decorationLines.push(...latestDecorationLines);
      } else {
        setStatus("Building stick figure", "Detecting lightweight MoveNet body pose.");
        const stick = await buildStickFigureLines(videoFile, settings);
        decorationLines.push(...stick.lines);
      }
    }

    const chart = buildChart({
      notes,
      audioAnalysis: latestAudioAnalysis,
      tracking: { events: visualEvents },
      duration,
      settings,
      decorationLines,
    });

    updateProgress(0.35);
    const coverBlob = latestCoverBlob || await coverBlobForExport(videoFile);
    latestCoverBlob = coverBlob;

    updateProgress(0.55);
    setStatus("Writing audio", "Encoding decoded audio as music.wav.");
    const audioBlob = encodeWav(audioBuffer);

    updateProgress(0.8);
    const zipBlob = await makeZip(chart, coverBlob, audioBlob);
    downloadBlob(zipBlob, `${safeName(readText("#nameInput", "PhiGen"))}.zip`);

    updateProgress(1);
    const counts = countChartNotes(chart);
    const fourLineDebugText = settings.judgeTemplate === "static-four" && lastStaticFourDebug
      ? ` Four-line debug ${APP_BUILD_ID}: source=${lastStaticFourDebug.source}, detections=${lastStaticFourDebug.detections}, long=${lastStaticFourDebug.longDetections}, fixedHori=${lastStaticFourDebug.fixedHoriNotes}, fixedVerti=${lastStaticFourDebug.fixedVertiNotes}, movingHori=${lastStaticFourDebug.movingHoriNotes}, movingVerti=${lastStaticFourDebug.movingVertiNotes}, moveXHori=${lastStaticFourDebug.moveXHoriEvents}, moveXVerti=${lastStaticFourDebug.moveXVertiEvents}.`
      : "";
    setStatus(
      "Export done",
      `Playable: ${counts.playableNotes} notes on ${counts.playableLines} line(s). Decorations: ${counts.fakeNotes} fake notes on ${counts.fakeLines} line(s).${fourLineDebugText}`
    );
  } catch (err) {
    console.error(err);
    setStatus("Export failed", err?.message || String(err));
  } finally {
    exportStatus = "empty";
    updateProcessButtons();
  }
}

function countChartNotes(chart) {
  let playableNotes = 0;
  let fakeNotes = 0;
  let playableLines = 0;
  let fakeLines = 0;

  for (const line of chart.judgeLineList || []) {
    const notes = line.notes || [];
    const realOnLine = notes.filter((note) => !note.isFake).length;
    const fakeOnLine = notes.filter((note) => note.isFake).length;
    playableNotes += realOnLine;
    fakeNotes += fakeOnLine;
    if (realOnLine) playableLines++;
    if (fakeOnLine) fakeLines++;
  }

  return { playableNotes, fakeNotes, playableLines, fakeLines };
}

function readSettings() {
  return {
    fallSpeed: readNumber("#fallSpeedInput", 0.25, 0),
    offset: readNumber("#offsetInput", 2, 0),
    noteInterval: readNumber("#noteIntervalInput", 0, 0),
    holdTime: readNumber("#holdTimeInput", 0.5, 0),
    clickInterval: readNumber("#clickIntervalInput", 0.2, 0),
    holdInterval: readNumber("#holdIntervalInput", 0.2, 0),
    trackFps: readNumber("#trackFpsInput", 5, 1),
    trackOriginalSize: !!document.querySelector("#trackOriginalSizeInput")?.checked,
    matchThreshold: readNumber("#matchThresholdInput", 0.68, 0),
    localMatchThreshold: readNumber("#localMatchThresholdInput", 0.56, 0),
    maxColorDiff: readNumber("#maxColorDiffInput", 35, 0),
    fakePixelFps: readNumber("#fakePixelFpsInput", 6, 1),
    fakePixelThreshold: readNumber("#fakePixelThresholdInput", 128, 1),
    stickFps: readNumber("#stickFpsInput", 5, 1),
    stickMaxHumanoids: Math.round(readNumber("#stickMaxHumanoidsInput", 1, 1)),
    stickDetectOnsetOnly: !!document.querySelector("#stickOnsetOnlyInput")?.checked,
    stickHoldPose: !!document.querySelector("#stickHoldPoseInput")?.checked,
    stickHoldMissingJoints: !!document.querySelector("#stickHoldMissingJointsInput")?.checked,
    stickOriginalSize: !!document.querySelector("#stickOriginalSizeInput")?.checked,
    stickJointThreshold: Math.min(1, readNumber("#stickJointThresholdInput", 0.1, 0)),
    judgeTemplate: readSelected("judgeTemplate", "static-single"),
    decorationTemplate: readSelected("decorationTemplate", "none"),
    fakePixelMode: pixelModeForDecoration(readSelected("decorationTemplate", "none")),
  };
}

function readNumber(selector, fallback, min) {
  const value = Number(document.querySelector(selector).value);
  return Number.isFinite(value) ? Math.max(min, value) : fallback;
}

function readText(selector, fallback) {
  const value = document.querySelector(selector).value.trim();
  return value || fallback;
}

function readSelected(name, fallback) {
  return document.querySelector(`input[name="${name}"]:checked`)?.value || fallback;
}

function visualProcessLabel(settings) {
  if (isPixelDecoration(settings.decorationTemplate)) return "Sampling video into fake-note pixels.";
  if (settings.decorationTemplate === "stick-figure") return "Detecting lightweight MoveNet body pose.";
  return "Capturing cover and tracking target.";
}

async function decodeAudio(file) {
  const ctx = new AudioContext();
  const buffer = await file.arrayBuffer();
  const audio = await ctx.decodeAudioData(buffer.slice(0));
  await ctx.close();
  return audio;
}

function generateAudioAnalysis(audioBuffer, settings) {
  const sampleRate = audioBuffer.sampleRate;
  const mono = mixToMono(audioBuffer);
  const waveform = buildDisplayWaveform(mono, sampleRate);
  const onset = computeSpectralFluxOnsets(mono, sampleRate, settings);
  const oldAudioDetections = computeOldAmplitudeDetections(mono, sampleRate, settings);
  const notes = [];
  let prev = { noteType: 1, endI: 0 };

  for (const d of onset.detections) {
    const startI = Math.max(0, Math.round(d.start * P.pixelPerSec));
    const endI = Math.max(startI, Math.round(d.end * P.pixelPerSec));
    prev = appendPattern(notes, startI, endI, prev, settings);
  }

  return {
    notes,
    waveform,
    detections: onset.detections,
    oldAudioDetections,
    duration: audioBuffer.duration,
    onsetEnvelope: onset.envelope,
  };
}

function mixToMono(audioBuffer) {
  const channels = Math.max(1, audioBuffer.numberOfChannels || 1);
  const length = audioBuffer.length;
  const mono = new Float32Array(length);

  for (let ch = 0; ch < channels; ch++) {
    const data = audioBuffer.getChannelData(ch);
    for (let i = 0; i < length; i++) mono[i] += data[i] / channels;
  }

  return mono;
}

function buildDisplayWaveform(samples, sampleRate) {
  const step = Math.max(1, Math.floor(sampleRate / P.pixelPerSec));
  const length = Math.floor(samples.length / step);
  const data = new Float32Array(length);

  for (let i = 0; i < length; i++) {
    let peak = 0;
    const start = i * step;
    const end = Math.min(samples.length, start + step);
    for (let j = start; j < end; j++) peak = Math.max(peak, Math.abs(samples[j]));
    data[i] = peak;
  }

  return data;
}

function computeOldAmplitudeDetections(samples, sampleRate, settings) {
  const data = buildOldAmplitudeData(samples, sampleRate);
  const detections = [];
  const offset = Math.max(0, Math.round((settings.offset || 0) * P.pixelPerSec));
  const noteInterval = Math.max(0, Math.round((settings.noteInterval || 0) * P.pixelPerSec));
  const vDiff = AUDIO_DETECTION.oldVolumeDiff;
  let maxI = 0;
  let max = 0;
  let minI = 0;
  let min = 0;
  let prevMaxI = -99999;

  for (let i = offset; i < data.length; i++) {
    const val = data[i];
    if (max > vDiff * min && max > vDiff * val && maxI > minI && maxI - prevMaxI > noteInterval) {
      detections.push({
        start: maxI / P.pixelPerSec,
        end: i / P.pixelPerSec,
        strength: max,
      });
      prevMaxI = maxI;
      maxI = i + 1;
      minI = i + 1;
      max = data[i + 1] || 0;
      min = data[i + 1] || 0;
    } else if (val > max) {
      max = val;
      maxI = i;
    } else if (val < min) {
      min = val;
      minI = i;
    }
  }

  return detections;
}

function buildOldAmplitudeData(samples, sampleRate) {
  const step = Math.max(1, Math.floor(sampleRate / P.pixelPerSec));
  const length = Math.floor(samples.length / step);
  const data = new Float32Array(length);

  for (let i = 0; i < length; i++) {
    const start = i * step;
    const end = Math.min(samples.length, start + step);
    let min = Infinity;
    let max = -Infinity;
    for (let j = start; j < end; j++) {
      const sample = samples[j] || 0;
      min = Math.min(min, sample);
      max = Math.max(max, sample);
    }
    data[i] = Math.max(0, max - min);
  }

  return data;
}

function computeSpectralFluxOnsets(samples, sampleRate, settings) {
  const frameSize = 2048;
  const hopSize = 512;
  const frameCount = Math.max(0, Math.floor((samples.length - frameSize) / hopSize) + 1);
  const halfBins = frameSize / 2;
  const window = hannWindow(frameSize);
  const real = new Float32Array(frameSize);
  const imag = new Float32Array(frameSize);
  const prevMag = new Float32Array(halfBins);
  const envelope = new Float32Array(frameCount);
  const rms = new Float32Array(frameCount);

  for (let frame = 0; frame < frameCount; frame++) {
    const offset = frame * hopSize;
    let energy = 0;

    for (let i = 0; i < frameSize; i++) {
      const sample = samples[offset + i] || 0;
      const windowed = sample * window[i];
      real[i] = windowed;
      imag[i] = 0;
      energy += sample * sample;
    }

    fftRadix2(real, imag);

    let flux = 0;
    for (let bin = 1; bin < halfBins; bin++) {
      const mag = Math.hypot(real[bin], imag[bin]);
      const diff = mag - prevMag[bin];
      if (diff > 0) flux += diff;
      prevMag[bin] = mag;
    }

    envelope[frame] = flux / halfBins;
    rms[frame] = Math.sqrt(energy / frameSize);
  }

  const smoothed = smoothArray(envelope, 2);
  normalizeArrayInPlace(smoothed);

  const adaptive = adaptiveThreshold(smoothed);
  const detections = pickOnsetPeaks(smoothed, rms, adaptive, sampleRate, hopSize, settings);

  return { detections, envelope: smoothed, rms };
}

function hannWindow(size) {
  const window = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    window[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / Math.max(1, size - 1));
  }
  return window;
}

function fftRadix2(real, imag) {
  const n = real.length;
  let j = 0;

  for (let i = 1; i < n; i++) {
    let bit = n >> 1;
    while (j & bit) {
      j ^= bit;
      bit >>= 1;
    }
    j ^= bit;

    if (i < j) {
      const tr = real[i];
      const ti = imag[i];
      real[i] = real[j];
      imag[i] = imag[j];
      real[j] = tr;
      imag[j] = ti;
    }
  }

  for (let len = 2; len <= n; len <<= 1) {
    const angle = (-2 * Math.PI) / len;
    const wLenR = Math.cos(angle);
    const wLenI = Math.sin(angle);

    for (let i = 0; i < n; i += len) {
      let wr = 1;
      let wi = 0;
      const half = len >> 1;

      for (let k = 0; k < half; k++) {
        const evenR = real[i + k];
        const evenI = imag[i + k];
        const oddR = real[i + k + half] * wr - imag[i + k + half] * wi;
        const oddI = real[i + k + half] * wi + imag[i + k + half] * wr;

        real[i + k] = evenR + oddR;
        imag[i + k] = evenI + oddI;
        real[i + k + half] = evenR - oddR;
        imag[i + k + half] = evenI - oddI;

        const nextWr = wr * wLenR - wi * wLenI;
        wi = wr * wLenI + wi * wLenR;
        wr = nextWr;
      }
    }
  }
}

function smoothArray(input, radius) {
  const output = new Float32Array(input.length);
  for (let i = 0; i < input.length; i++) {
    let sum = 0;
    let count = 0;
    for (let j = Math.max(0, i - radius); j <= Math.min(input.length - 1, i + radius); j++) {
      sum += input[j];
      count++;
    }
    output[i] = count ? sum / count : 0;
  }
  return output;
}

function normalizeArrayInPlace(data) {
  let max = 0;
  for (const value of data) max = Math.max(max, value);
  if (max <= 0) return;
  for (let i = 0; i < data.length; i++) data[i] /= max;
}

function adaptiveThreshold(envelope) {
  const threshold = new Float32Array(envelope.length);
  const radius = 18;
  const stdScale = AUDIO_DETECTION.thresholdStdScale;
  const floor = AUDIO_DETECTION.thresholdFloor;

  for (let i = 0; i < envelope.length; i++) {
    let sum = 0;
    let sqSum = 0;
    let count = 0;

    for (let j = Math.max(0, i - radius); j <= Math.min(envelope.length - 1, i + radius); j++) {
      const value = envelope[j];
      sum += value;
      sqSum += value * value;
      count++;
    }

    const mean = count ? sum / count : 0;
    const variance = count ? Math.max(0, sqSum / count - mean * mean) : 0;
    threshold[i] = Math.max(floor, mean + Math.sqrt(variance) * stdScale);
  }

  return threshold;
}

function pickOnsetPeaks(envelope, rms, threshold, sampleRate, hopSize, settings) {
  const detections = [];
  const noteInterval = Math.max(0, Number.isFinite(settings.noteInterval) ? settings.noteInterval : 0.2);
  const holdTime = Math.max(0, Number.isFinite(settings.holdTime) ? settings.holdTime : 0.5);
  const offset = Math.max(0, Number.isFinite(settings.offset) ? settings.offset : 0);
  const minGapFrames = Math.max(1, Math.round(noteInterval * sampleRate / hopSize));
  const offsetFrames = Math.max(0, Math.round(offset * sampleRate / hopSize));
  let lastPeak = -999999;

  for (let i = Math.max(1, offsetFrames); i < envelope.length - 1; i++) {
    const isPeak = envelope[i] >= envelope[i - 1] && envelope[i] > envelope[i + 1];
    if (!isPeak || envelope[i] < threshold[i]) continue;

    if (i - lastPeak < minGapFrames) {
      if (detections.length && envelope[i] > detections[detections.length - 1].strength) {
        detections.pop();
        const end = estimateNoteEnd(i, envelope, rms, sampleRate, hopSize);
        detections.push({ start: i * hopSize / sampleRate, end, strength: envelope[i], long: false });
        lastPeak = i;
      }
      continue;
    }

    const end = estimateNoteEnd(i, envelope, rms, sampleRate, hopSize);
    detections.push({ start: i * hopSize / sampleRate, end, strength: envelope[i], long: false });
    lastPeak = i;
  }

  for (let i = 0; i < detections.length; i++) {
    const nextStart = detections[i + 1]?.start ?? Infinity;
    detections[i].end = Math.max(
      detections[i].start,
      Math.min(detections[i].end, nextStart - Math.max(0.03, noteInterval * 0.45))
    );
    detections[i].long = detections[i].end - detections[i].start > holdTime;
  }

  return detections;
}

function estimateNoteEnd(peakFrame, envelope, rms, sampleRate, hopSize) {
  const peakRms = Math.max(rms[peakFrame] || 0, 0.000001);
  const localPeak = Math.max(envelope[peakFrame] || 0, 0.000001);
  const minFrames = Math.max(2, Math.round(0.08 * sampleRate / hopSize));
  const maxFrames = Math.max(minFrames + 1, Math.round(1.8 * sampleRate / hopSize));
  const energyCutoff = peakRms * 0.32;
  const fluxCutoff = localPeak * 0.24;

  let endFrame = Math.min(envelope.length - 1, peakFrame + minFrames);

  for (let i = peakFrame + minFrames; i < Math.min(envelope.length, peakFrame + maxFrames); i++) {
    endFrame = i;
    if ((rms[i] || 0) <= energyCutoff && (envelope[i] || 0) <= fluxCutoff) break;
  }

  return endFrame * hopSize / sampleRate;
}

function appendPattern(notes, maxI, minI, prev, settings) {
  const holdTime = settings.holdTime * P.pixelPerSec;
  const clickInterval = settings.clickInterval * P.pixelPerSec;
  const holdInterval = settings.holdInterval * P.pixelPerSec;
  const interval = prev.noteType === 1 ? clickInterval : holdInterval;
  const isLong = minI - maxI > holdTime;
  const tooClose = maxI - prev.endI < interval;
  const flickEnd = Math.random() < 0.5;
  const dragStep = Math.max(1, Math.floor(P.dragInterval * P.pixelPerSec));
  const next = { ...prev, endI: isLong ? minI : maxI };

  if (isLong) {
    if (tooClose) {
      for (let t = maxI; t < minI; t += dragStep) notes.push(note(4, t, t, settings));
      if (flickEnd) notes.push(note(3, minI, minI, settings));
      next.noteType = flickEnd ? 3 : 4;
    } else {
      notes.push(note(2, maxI, minI, settings));
      if (flickEnd) notes.push(note(3, minI, minI, settings));
      next.noteType = flickEnd ? 3 : 2;
    }
  } else if (tooClose) {
    notes.push(note(4, maxI, maxI, settings));
    next.noteType = 4;
  } else {
    notes.push(note(1, maxI, maxI, settings));
    next.noteType = 1;
  }

  return next;
}

function note(type, startI, endI, settings) {
  return {
    above: 1,
    alpha: 255,
    endTime: timeArray(endI),
    isFake: 0,
    positionX: 0,
    size: 1,
    speed: settings.fallSpeed,
    startTime: timeArray(type === 2 ? startI : endI),
    type,
    visibleTime: 999999,
    yOffset: 0,
  };
}

async function captureCover(file) {
  const video = document.createElement("video");
  video.src = URL.createObjectURL(file);
  video.muted = true;
  video.playsInline = true;
  await once(video, "loadedmetadata");
  await seekVideo(video, Math.random() * Math.max(0, video.duration - 0.1));
  const canvas = els.workCanvas;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);
  URL.revokeObjectURL(video.src);
  return await canvasToBlob(canvas, "image/png");
}

async function trackTarget(videoFile, targetFiles, settings, signal) {
  const video = document.createElement("video");
  video.src = URL.createObjectURL(videoFile);
  video.muted = true;
  video.playsInline = true;
  await once(video, "loadedmetadata");

  const duration = video.duration || 0;
  const step = 1 / settings.trackFps;
  const events = [];
  const work = els.workCanvas;
  const ctx = work.getContext("2d", { willReadFrequently: true });
  const previewScale = Math.min(1, P.maxTrackWidth / video.videoWidth);
  const detectionScale = settings.trackOriginalSize ? 1 : previewScale;
  work.width = Math.max(1, Math.round(video.videoWidth * detectionScale));
  work.height = Math.max(1, Math.round(video.videoHeight * detectionScale));
  const targetSets = await buildTargetSets(targetFiles, detectionScale);
  const trackingSettings = {
    ...settings,
    trackSearchRadius: settings.trackOriginalSize ? P.localSearchRadius / Math.max(previewScale, 0.0001) : P.localSearchRadius,
  };

  let lastGood = null;
  for (let t = 0; t <= duration; t += step) {
    throwIfAborted(signal);
    setStatus("Tracking target", `${Math.min(duration, t).toFixed(1)}s / ${duration.toFixed(1)}s`);
    updateProgress(0.26 + 0.44 * (duration ? t / duration : 1));
    await seekVideo(video, Math.min(duration, t));
    ctx.drawImage(video, 0, 0, work.width, work.height);
    const frame = cv.imread(work);
    const match = findBestPriorityMatch(frame, targetSets, lastGood, trackingSettings);
    frame.delete();
    const event = trackedEvent(match, lastGood, t, work.width, work.height, trackingSettings);
    events.push(event);
    previewEvents.push(event);

    if (event.detected) {
      lastGood = event;
    }

    if (!previewDragging && previewVisible) {
      els.previewSlider.max = Math.max(0, previewEvents.length - 1);
      els.previewSlider.step = 1;
      els.previewSlider.value = previewEvents.length - 1;
      setPreviewControlsEnabled(true);
      drawPreview(event, latestAudioAnalysis?.notes || [], video, {
        showLine: true,
        showOrigin: true,
        currentTime: event.time ?? t,
        frameWidth: work.width,
        frameHeight: work.height,
      });
      drawWaveform(event.time ?? t);
    }
    await waitFrame();
  }

  targetSets.forEach((set) => {
    set.mats.forEach((m) => {
      m.mat.delete();
      m.mask.delete();
    });
  });
  URL.revokeObjectURL(video.src);
  return { duration, events, chartEvents: simplifyEvents(events) };
}

async function buildTargetSets(files, frameScale = 1) {
  const sets = [];
  for (let i = 0; i < files.length; i++) {
    const img = await loadImage(files[i]);
    sets.push({ index: i, mats: buildTargetMats(img, frameScale) });
  }
  return sets;
}

function buildTargetMats(img, frameScale = 1) {
  const canvas = els.targetCanvas;
  const baseWidth = Math.min(160, img.naturalWidth * frameScale);
  const ratio = baseWidth / img.naturalWidth;
  const baseW = Math.max(12, Math.round(img.naturalWidth * ratio));
  const baseH = Math.max(12, Math.round(img.naturalHeight * ratio));
  const ctx = canvas.getContext("2d");
  const variants = [];
  const angles = [-60, -45, -30, -15, 0, 15, 30, 45, 60];
  const scales = [0.5, 0.65, 0.8, 1, 1.25, 1.5, 1.8];

  for (const angle of angles) {
    for (const s of scales) {
      const w = Math.round(baseW * s);
      const h = Math.round(baseH * s);
      const pad = Math.ceil(Math.hypot(w, h));
      canvas.width = pad;
      canvas.height = pad;
      ctx.clearRect(0, 0, pad, pad);
      ctx.save();
      ctx.translate(pad / 2, pad / 2);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
      const mat = cv.imread(canvas);
      const rgb = new cv.Mat();
      const channels = new cv.MatVector();
      const mask = new cv.Mat();
      cv.cvtColor(mat, rgb, cv.COLOR_RGBA2RGB);
      cv.split(mat, channels);
      const alpha = channels.get(3);
      cv.threshold(alpha, mask, 16, 255, cv.THRESH_BINARY);
      alpha.delete();
      channels.delete();
      mat.delete();
      variants.push({ mat: rgb, mask, angle });
    }
  }
  return variants;
}

function findBestPriorityMatch(frameRgba, targetSets, lastGood = null, settings) {
  const frame = new cv.Mat();
  cv.cvtColor(frameRgba, frame, cv.COLOR_RGBA2RGB);
  let best = { score: -1 };

  for (const targetSet of targetSets) {
    const match = findMatchForTarget(frame, targetSet, lastGood, settings);
    const threshold = lastGood?.targetIndex === targetSet.index ? settings.localMatchThreshold : settings.matchThreshold;
    if (match.score >= threshold) {
      best = match;
      break;
    }
    if (match.score > best.score) best = match;
  }

  frame.delete();
  return best;
}

function findMatchForTarget(frame, targetSet, lastGood, settings) {
  const sameTarget = lastGood?.targetIndex === targetSet.index;
  let best = sameTarget ? findBestMatchInRegion(frame, targetSet, lastGood, settings) : { score: -1 };

  if (best.score < settings.localMatchThreshold) {
    const global = findBestMatchInRegion(frame, targetSet, null, settings);
    const jump = sameTarget ? Math.hypot(global.x - lastGood.frameX, global.y - lastGood.frameY) : 0;
    const farJumpNeedsConfidence = !sameTarget || jump < P.localSearchRadius * 1.5 || global.score > Math.max(settings.matchThreshold + 0.12, best.score + 0.16);
    if (farJumpNeedsConfidence && global.score > best.score) best = global;
  }

  return best;
}

function findBestMatchInRegion(frame, targetSet, lastGood, settings) {
  const region = searchRegion(frame, lastGood, settings);
  const roi = frame.roi(new cv.Rect(region.x, region.y, region.w, region.h));
  let best = { score: -1 };

  for (const target of targetSet.mats) {
    if (target.mat.cols >= roi.cols || target.mat.rows >= roi.rows) continue;
    const result = new cv.Mat();
    cv.matchTemplate(roi, target.mat, result, cv.TM_CCORR_NORMED, target.mask);
    const mm = cv.minMaxLoc(result);
    const x = region.x + mm.maxLoc.x + target.mat.cols / 2;
    const y = region.y + mm.maxLoc.y + target.mat.rows / 2;
    const colorDiff = candidateColorDiff(frame, target, x, y);
    const rawScore = Number.isFinite(mm.maxVal) ? mm.maxVal : -1;
    const score = colorDiff <= settings.maxColorDiff ? rawScore : -1;
    if (score > best.score) {
      best = {
        score,
        rawScore,
        colorDiff,
        x,
        y,
        angle: target.angle,
        targetIndex: targetSet.index,
      };
    }
    result.delete();
  }

  roi.delete();
  return best;
}

function searchRegion(frame, lastGood, settings) {
  if (!lastGood) return { x: 0, y: 0, w: frame.cols, h: frame.rows };
  const r = settings.trackSearchRadius || P.localSearchRadius;
  const x = Math.max(0, Math.floor(lastGood.frameX - r));
  const y = Math.max(0, Math.floor(lastGood.frameY - r));
  return {
    x,
    y,
    w: Math.min(frame.cols - x, Math.ceil(r * 2)),
    h: Math.min(frame.rows - y, Math.ceil(r * 2)),
  };
}

function candidateColorDiff(frame, target, centerX, centerY) {
  const x = Math.max(0, Math.min(frame.cols - target.mat.cols, Math.round(centerX - target.mat.cols / 2)));
  const y = Math.max(0, Math.min(frame.rows - target.mat.rows, Math.round(centerY - target.mat.rows / 2)));
  const roi = frame.roi(new cv.Rect(x, y, target.mat.cols, target.mat.rows));
  const diff = new cv.Mat();
  cv.absdiff(roi, target.mat, diff);
  const mean = cv.mean(diff, target.mask);
  diff.delete();
  roi.delete();
  return (mean[0] + mean[1] + mean[2]) / 3;
}

function trackedEvent(match, lastGood, time, width, height, settings) {
  const threshold = lastGood?.targetIndex === match?.targetIndex ? settings.localMatchThreshold : settings.matchThreshold;
  if (match && match.score >= threshold) {
    return matchToEvent(match, time, width, height, true, false);
  }

  if (lastGood) {
    return {
      ...lastGood,
      time,
      detected: false,
      held: true,
      score: match?.score ?? -1,
    };
  }

  return { time, x: 0, y: 0, rotation: 0, detected: false, held: false, score: match?.score ?? -1 };
}

function matchToEvent(match, time, width, height, detected = true, held = false) {
  return {
    time,
    x: P.videoX0 + (match.x / Math.max(1, width - 1)) * (P.videoXStep * (P.videoCols - 1)),
    y: P.videoY0 - (match.y / Math.max(1, height - 1)) * (P.videoYStep * (P.videoRows - 1)),
    rotation: match.angle,
    detected,
    held,
    score: match.score,
    rawScore: match.rawScore ?? match.score,
    colorDiff: match.colorDiff ?? 0,
    targetIndex: match.targetIndex,
    frameX: match.x,
    frameY: match.y,
  };
}

function simplifyEvents(events) {
  if (!events.length) return [{ time: 0, x: 0, y: 0, rotation: 0, detected: false }];
  const kept = [events[0]];
  for (const ev of events.slice(1)) {
    const prev = kept.at(-1);
    const moved = Math.hypot(ev.x - prev.x, ev.y - prev.y) > 12;
    const rotated = Math.abs(ev.rotation - prev.rotation) > 4;
    if (ev.detected !== prev.detected || moved || rotated) kept.push(ev);
  }
  return kept;
}

function buildChart({ notes, audioAnalysis, tracking, duration, settings, decorationLines = [] }) {
  const events = tracking.events.length ? tracking.events : [{ time: 0, x: 0, y: 0, rotation: 0 }];
  const lastTime = Math.max(duration, events.at(-1).time + 0.01);
  const judgeLines = buildJudgeLinesForTemplate({
    template: settings.judgeTemplate,
    notes,
    audioAnalysis,
    trackingEvents: events,
    lastTime,
    settings,
  });

  return {
    BPMList: [{ bpm: 60, startTime: [0, 0, 1] }],
    META: {
      RPEVersion: 130,
      background: "cover.png",
      charter: readText("#charterInput", "Unknown"),
      composer: readText("#composerInput", "Unknown"),
      id: "99999999",
      level: readText("#levelInput", "SP Lv.?"),
      name: readText("#nameInput", "Unknown"),
      offset: 0,
      song: "music.wav",
    },
    judgeLineGroup: ["Default", "Border", "Decoration"],
    judgeLineList: [...judgeLines, ...decorationLines],
  };
}

function buildJudgeLinesForTemplate({ template, notes, audioAnalysis, trackingEvents, lastTime, settings }) {
  if (template === "tracking-single") {
    return [
      judgeLine({
        name: "Target line",
        group: 0,
        notes,
        alpha: 255,
        moveXEvents: series(trackingEvents, "x", lastTime),
        moveYEvents: series(trackingEvents, "y", lastTime),
        rotateEvents: series(trackingEvents, "rotation", lastTime),
        lastTime,
      }),
    ];
  }

  if (template === "static-four" || template === "audio-dynamic" || template === "audio-dynamic-two") {
    // IMPORTANT: keep the old C++ pattern generator, but feed it the newer
    // onset/stop detections that already work well for the single static line.
    // Fall back to the old amplitude detector only if the new detector is empty.
    const patternSource = selectOldPatternDetections(audioAnalysis);
    const pattern = generateOldAudioPattern(patternSource.detections, settings, {
      forceHorizontal: template === "audio-dynamic",
    });
    const debug = summarizeOldAudioPattern(pattern, patternSource.detections, settings, patternSource.source);
    lastStaticFourDebug = debug;
    console.groupCollapsed(`[PhiGen] Four-line pattern debug ${APP_BUILD_ID}`);
    console.table(debug);
    console.groupEnd();
    if (template === "static-four") {
      return [
        judgeLine({ name: "Left fixed", group: 1, notes: pattern.fixedVerti, lastTime, ...LINE_PRESETS.left }),
        judgeLine({ name: "Right fixed", group: 1, notes: pattern.fixedVerti, lastTime, ...LINE_PRESETS.right }),
        judgeLine({ name: "Upper fixed", group: 1, notes: pattern.fixedHori, lastTime, ...LINE_PRESETS.up }),
        judgeLine({ name: "Lower fixed", group: 1, notes: pattern.fixedHori, lastTime, ...LINE_PRESETS.down }),
        judgeLine({
          name: "Left moving notes",
          group: 1,
          notes: pattern.movingVerti,
          alpha: 0,
          // Vertical moving holds should move ALONG the vertical line, not slide
          // the line toward screen center. Keep global X fixed, and put the old
          // C++ moveXVerti value onto global Y. For the left line (rotation -90),
          // use the raw sign so the hold follows the same side as fixedVerti
          // drag notes.
          moveXEvents: [event(LINE_PRESETS.left.x, LINE_PRESETS.left.x, 0, lastTime)],
          moveYEvents: moveSeries(pattern.moveXVerti, true, lastTime, dynamicMoveStart(true, P.oldVertiMax)),
          lastTime,
          ...LINE_PRESETS.left,
        }),
        judgeLine({
          name: "Right moving notes",
          group: 1,
          notes: pattern.movingVerti,
          alpha: 0,
          // Mirror of the left vertical moving line: fixed global X, opposite
          // global-Y sign, matching the mirrored fixedVerti drag notes.
          moveXEvents: [event(LINE_PRESETS.right.x, LINE_PRESETS.right.x, 0, lastTime)],
          moveYEvents: moveSeries(pattern.moveXVerti, false, lastTime, dynamicMoveStart(false, P.oldVertiMax)),
          lastTime,
          ...LINE_PRESETS.right,
        }),
        judgeLine({
          name: "Upper moving notes",
          group: 1,
          notes: pattern.movingHori,
          alpha: 0,
          moveXEvents: moveSeries(pattern.moveXHori, true, lastTime, dynamicMoveStart(true, P.oldHoriInnerMax)),
          lastTime,
          ...LINE_PRESETS.up,
        }),
        judgeLine({
          name: "Lower moving notes",
          group: 1,
          notes: pattern.movingHori,
          alpha: 0,
          moveXEvents: moveSeries(pattern.moveXHori, false, lastTime, dynamicMoveStart(false, P.oldHoriInnerMax)),
          lastTime,
          ...LINE_PRESETS.down,
        }),
      ];
    }

    if (template === "audio-dynamic-two") return twoStaticAudioDynamicLines(pattern, lastTime);
    return horizontalOnlyAudioDynamicLines(pattern, lastTime);
  }

  return [
    judgeLine({
      name: "Static line",
      group: 0,
      notes,
      lastTime,
      ...LINE_PRESETS.center,
    }),
  ];
}

function judgeLine({
  name,
  group = 0,
  notes = [],
  x = 0,
  y = 0,
  rotation = 0,
  alpha = 255,
  moveXEvents,
  moveYEvents,
  rotateEvents,
  lastTime,
  zOrder = 0,
}) {
  return {
    Group: group,
    Name: name,
    Texture: "line.png",
    alphaControl: control("alpha", 1),
    bpmfactor: 1,
    eventLayers: [{
      alphaEvents: [event(alpha, alpha, 0, lastTime)],
      moveXEvents: moveXEvents || [event(x, x, 0, lastTime)],
      moveYEvents: moveYEvents || [event(y, y, 0, lastTime)],
      rotateEvents: rotateEvents || [event(rotation, rotation, 0, lastTime)],
      speedEvents: [{ start: 10, end: 10, startTime: timeArray(0), endTime: timeArray(lastTime * P.pixelPerSec), linkgroup: 0 }],
    }],
    extended: { inclineEvents: [event(0, 0, 0, lastTime)] },
    father: -1,
    isCover: 1,
    notes,
    numOfNotes: notes.length,
    posControl: control("pos", 1),
    sizeControl: control("size", 1),
    skewControl: control("skew", 0),
    yControl: [{ easing: 1, x: 0, y: 1 }, { easing: 1, x: 9999999, y: 1 }],
    zOrder,
  };
}

function selectOldPatternDetections(audioAnalysis) {
  const newDetections = audioAnalysis?.detections || [];
  if (newDetections.length) {
    return { source: "spectral-flux detections", detections: newDetections };
  }
  return {
    source: "old amplitude detections",
    detections: audioAnalysis?.oldAudioDetections || [],
  };
}

function summarizeOldAudioPattern(pattern, detections, settings, source) {
  const holdThresholdSec = Math.max(0, settings.holdTime || 0);
  const durations = detections.map((d) => Math.max(0, (d.end || 0) - (d.start || 0)));
  const longDetections = durations.filter((duration) => duration > holdThresholdSec).length;
  const noteTypeCounts = (notes) => notes.reduce((acc, n) => {
    acc[`type${n.type}`] = (acc[`type${n.type}`] || 0) + 1;
    return acc;
  }, {});

  return {
    build: APP_BUILD_ID,
    source,
    detections: detections.length,
    longDetections,
    shortDetections: Math.max(0, detections.length - longDetections),
    holdThresholdSec,
    maxDurationSec: durations.length ? Math.max(...durations) : 0,
    fixedHoriNotes: pattern.fixedHori.length,
    fixedVertiNotes: pattern.fixedVerti.length,
    movingHoriNotes: pattern.movingHori.length,
    movingVertiNotes: pattern.movingVerti.length,
    movingHoriHolds: pattern.movingHori.filter((n) => n.type === 2).length,
    movingVertiHolds: pattern.movingVerti.filter((n) => n.type === 2).length,
    moveXHoriEvents: pattern.moveXHori.length,
    moveXVertiEvents: pattern.moveXVerti.length,
    moveXHoriRange: summarizeMoveRange(pattern.moveXHori),
    moveXVertiRange: summarizeMoveRange(pattern.moveXVerti),
    fixedHoriTypes: JSON.stringify(noteTypeCounts(pattern.fixedHori)),
    fixedVertiTypes: JSON.stringify(noteTypeCounts(pattern.fixedVerti)),
    movingHoriTypes: JSON.stringify(noteTypeCounts(pattern.movingHori)),
    movingVertiTypes: JSON.stringify(noteTypeCounts(pattern.movingVerti)),
  };
}

function summarizeMoveRange(moves) {
  if (!moves.length) return "none";
  let min = Infinity;
  let max = -Infinity;
  for (const m of moves) {
    min = Math.min(min, m.startX, m.endX);
    max = Math.max(max, m.startX, m.endX);
  }
  return `${min.toFixed(1)}..${max.toFixed(1)}`;
}

function horizontalOnlyAudioDynamicLines(pattern, lastTime) {
  const centerUp = { ...LINE_PRESETS.center, rotation: LINE_PRESETS.up.rotation };
  const centerDown = { ...LINE_PRESETS.center, rotation: LINE_PRESETS.down.rotation };

  return [
    judgeLine({ name: "Center upper fixed", group: 1, notes: pattern.fixedHori, lastTime, ...centerUp }),
    judgeLine({ name: "Center lower fixed", group: 1, notes: pattern.fixedHori, lastTime, ...centerDown }),
    judgeLine({
      name: "Center upper moving notes",
      group: 1,
      notes: pattern.movingHori,
      alpha: 0,
      moveXEvents: moveSeries(pattern.moveXHori, true, lastTime, dynamicMoveStart(true, P.oldHoriInnerMax)),
      lastTime,
      ...centerUp,
    }),
    judgeLine({
      name: "Center lower moving notes",
      group: 1,
      notes: pattern.movingHori,
      alpha: 0,
      moveXEvents: moveSeries(pattern.moveXHori, false, lastTime, dynamicMoveStart(false, P.oldHoriInnerMax)),
      lastTime,
      ...centerDown,
    }),
  ];
}

function twoStaticAudioDynamicLines(pattern, lastTime) {
  const centerLeft = { ...LINE_PRESETS.center, rotation: LINE_PRESETS.left.rotation };
  const centerRight = { ...LINE_PRESETS.center, rotation: LINE_PRESETS.right.rotation };
  const centerUp = { ...LINE_PRESETS.center, rotation: LINE_PRESETS.up.rotation };
  const centerDown = { ...LINE_PRESETS.center, rotation: LINE_PRESETS.down.rotation };

  return [
    judgeLine({ name: "Center left fixed", group: 1, notes: pattern.fixedVerti, lastTime, ...centerLeft }),
    judgeLine({ name: "Center right fixed", group: 1, notes: pattern.fixedVerti, lastTime, ...centerRight }),
    judgeLine({ name: "Center upper fixed", group: 1, notes: pattern.fixedHori, lastTime, ...centerUp }),
    judgeLine({ name: "Center lower fixed", group: 1, notes: pattern.fixedHori, lastTime, ...centerDown }),
    judgeLine({
      name: "Center left moving notes",
      group: 1,
      notes: pattern.movingVerti,
      alpha: 0,
      moveXEvents: [event(LINE_PRESETS.center.x, LINE_PRESETS.center.x, 0, lastTime)],
      moveYEvents: moveSeries(pattern.moveXVerti, true, lastTime, dynamicMoveStart(true, P.oldVertiMax)),
      lastTime,
      ...centerLeft,
    }),
    judgeLine({
      name: "Center right moving notes",
      group: 1,
      notes: pattern.movingVerti,
      alpha: 0,
      moveXEvents: [event(LINE_PRESETS.center.x, LINE_PRESETS.center.x, 0, lastTime)],
      moveYEvents: moveSeries(pattern.moveXVerti, false, lastTime, dynamicMoveStart(false, P.oldVertiMax)),
      lastTime,
      ...centerRight,
    }),
    judgeLine({
      name: "Center upper moving notes",
      group: 1,
      notes: pattern.movingHori,
      alpha: 0,
      moveXEvents: moveSeries(pattern.moveXHori, true, lastTime, dynamicMoveStart(true, P.oldHoriInnerMax)),
      lastTime,
      ...centerUp,
    }),
    judgeLine({
      name: "Center lower moving notes",
      group: 1,
      notes: pattern.movingHori,
      alpha: 0,
      moveXEvents: moveSeries(pattern.moveXHori, false, lastTime, dynamicMoveStart(false, P.oldHoriInnerMax)),
      lastTime,
      ...centerDown,
    }),
  ];
}

function generateOldAudioPattern(detections, settings, options = {}) {
  const out = {
    fixedVerti: [],
    fixedHori: [],
    movingVerti: [],
    movingHori: [],
    moveXVerti: [],
    moveXHori: [],
  };
  let seed = 0x9e3779b9;
  let prev = {
    noteType: 1,
    endI: 0,
    verti: false,
    vertiX: oldPatternInitialX(true),
    horiX: oldPatternInitialX(false),
    vertiDir: 1,
    horiDir: 1,
    vertiLastNoteX: oldPatternInitialX(true),
    horiLastNoteX: oldPatternInitialX(false),
    followHold: false,
  };

  for (const d of detections) {
    const maxI = Math.max(0, Math.round(d.start * P.pixelPerSec));
    const minI = Math.max(maxI, Math.round(d.end * P.pixelPerSec));
    seed = (seed + 0x6d2b79f5) | 0;
    prev = appendOldPattern(out, maxI, minI, prev, settings, seededUnit(seed), options);
  }

  return out;
}

function appendOldPattern(out, maxI, minI, prev, settings, rand, options = {}) {
  const holdTime = settings.holdTime * P.pixelPerSec;
  const clickInterval = settings.clickInterval * P.pixelPerSec;
  const holdInterval = settings.holdInterval * P.pixelPerSec;
  const dragInterval = Math.max(1, Math.floor(P.dragInterval * P.pixelPerSec));
  const interval = prev.noteType === 1 ? clickInterval : holdInterval;
  const next = { ...prev };
  if (options.forceHorizontal) next.verti = false;
  const isLong = minI - maxI > holdTime;
  const tooClose = maxI - prev.endI < interval;
  const flickEnd = rand < 0.5;

  if (isLong) {
    next.endI = minI;
    if (tooClose) {
      const list = next.verti ? out.fixedVerti : out.fixedHori;
      const x = patternLastNoteX(prev, next.verti);
      for (let t = maxI; t < minI; t += dragInterval) list.push(audioNote(4, x, t, t, settings));
      if (flickEnd) list.push(audioNote(3, x, minI, minI, settings));
      rememberPatternNoteX(next, next.verti, x);
      next.noteType = flickEnd ? 3 : 4;
    } else {
      next.verti = options.forceHorizontal ? false : rand < 0.5;
      const moving = minI - maxI > holdTime * 2 || rand < 1 / 3;
      next.followHold = true;
      if (next.verti) {
        out.movingVerti.push(audioNote(2, 0, maxI, minI, settings));
      } else {
        out.movingHori.push(audioNote(2, 0, maxI, minI, settings));
      }
      rememberPatternNoteX(next, next.verti, patternCurrentLineX(prev, next.verti));
      next.noteType = 2;

      if (moving) appendOldMovingDrags(out, next, prev, maxI, minI, settings, dragInterval);
      else appendOldStationaryHoldMove(out, next, prev, maxI, minI);
      if (flickEnd) {
        next.noteType = 3;
        if (next.verti) out.movingVerti.push(audioNote(3, 0, minI, minI, settings));
        else out.movingHori.push(audioNote(4, 0, minI, minI, settings));
        rememberPatternNoteX(next, next.verti, patternCurrentLineX(next, next.verti));
      }
    }
  } else {
    next.endI = maxI;
    if (tooClose) {
      next.noteType = 4;
      if (next.verti) {
        const x = patternLastNoteX(prev, true);
        out.fixedVerti.push(audioNote(4, x, maxI, maxI, settings));
        rememberPatternNoteX(next, true, x);
      } else {
        const x = patternLastNoteX(prev, false);
        out.fixedHori.push(audioNote(4, x, maxI, maxI, settings));
        rememberPatternNoteX(next, false, x);
      }
    } else {
      next.verti = false;
      next.noteType = 1;
      next.followHold = false;
      const x = randomNearbyPatternSlot(prev, false, rand);
      out.fixedHori.push(audioNote(1, x, maxI, maxI, settings));
      rememberPatternNoteX(next, false, x);
    }
  }

  return next;
}

function patternCurrentLineX(prev, verti) {
  return verti ? prev.vertiX : prev.horiX;
}

function patternLastNoteX(prev, verti) {
  return verti ? prev.vertiLastNoteX : prev.horiLastNoteX;
}

function rememberPatternLineX(state, verti, x) {
  if (verti) {
    state.vertiX = x;
  } else {
    state.horiX = x;
  }
}

function rememberPatternNoteX(state, verti, x) {
  if (verti) state.vertiLastNoteX = x;
  else state.horiLastNoteX = x;
}

function randomNearbyPatternSlot(prev, verti, rand) {
  const center = patternCurrentLineX(prev, verti);
  const maxX = verti ? P.oldVertiMax : P.oldHoriOuterMax;
  const slots = [center - P.oldShortXInc, center, center + P.oldShortXInc]
    .filter((x) => x >= -maxX && x <= maxX);
  return slots[Math.min(slots.length - 1, Math.floor(rand * slots.length))] ?? center;
}

function appendOldStationaryHoldMove(out, next, prev, maxI, minI) {
  const moves = next.verti ? out.moveXVerti : out.moveXHori;
  const x = patternCurrentLineX(prev, next.verti);
  moves.push({ startX: x, endX: x, startI: maxI, endI: Math.max(maxI + 1, minI) });
  rememberPatternLineX(next, next.verti, x);
  rememberPatternNoteX(next, next.verti, x);
}

function appendOldMovingDrags(out, next, prev, maxI, minI, settings, dragInterval) {
  const list = next.verti ? out.fixedVerti : out.fixedHori;
  const moves = next.verti ? out.moveXVerti : out.moveXHori;
  const maxX = next.verti ? P.oldVertiMax : P.oldHoriInnerMax;
  let x = patternCurrentLineX(prev, next.verti);
  let startX = x;
  let startI = maxI;
  let dir = next.verti ? prev.vertiDir : prev.horiDir;
  let t = maxI;

  for (; t < minI; t += dragInterval) {
    list.push(audioNote(4, x, t, t, settings));
    x += dir * P.oldXInc;
    if (x <= -maxX) {
      x = -maxX;
      dir = 1;
      moves.push({ startX, endX: x, startI, endI: t });
      startX = x;
      startI = t;
    }
    if (x >= maxX) {
      x = maxX;
      dir = -1;
      moves.push({ startX, endX: x, startI, endI: t });
      startX = x;
      startI = t;
    }
  }

  moves.push({ startX, endX: x, startI, endI: t + dragInterval });
  if (next.verti) {
    next.vertiDir = dir;
    next.vertiX = x;
  } else {
    next.horiDir = dir;
    next.horiX = x;
  }
  rememberPatternNoteX(next, next.verti, x);
}

function audioNote(type, x, startI, endI, settings) {
  return {
    ...note(type, startI, endI, settings),
    positionX: x,
  };
}

function seededUnit(seed) {
  let x = seed | 0;
  x ^= x >>> 15;
  x = Math.imul(x, 0x2c1b3c6d);
  x ^= x >>> 12;
  x = Math.imul(x, 0x297a2d39);
  x ^= x >>> 15;
  return (x >>> 0) / 4294967296;
}

function moveSeries(moves, reverse, lastTime, initialX = 0) {
  // Match C++ moveXToStr(move, rev): generated move values are absolute
  // chart X values, not offsets added to the left/right/up/down preset.
  // initialX is only the template's starting hold position before the first
  // generated move event appears.
  if (!moves.length) return [event(initialX, initialX, 0, lastTime)];
  const out = [event(initialX, initialX, 0, Math.max(0.001, moves[0].startI / P.pixelPerSec))];
  for (const m of moves) {
    const start = reverse ? m.startX : -m.startX;
    const end = reverse ? m.endX : -m.endX;
    out.push(event(
      start,
      end,
      m.startI / P.pixelPerSec,
      Math.max(m.startI + 1, m.endI) / P.pixelPerSec
    ));
  }
  const last = out.at(-1);
  const lastEnd = secondsFromTime(last.endTime);
  if (lastEnd < lastTime) out.push(event(last.end, last.end, lastEnd, lastTime));
  return out;
}

function dynamicMoveStart(reverse, maxAbs) {
  return reverse ? -maxAbs : maxAbs;
}

function oldPatternInitialX(verti) {
  return -(verti ? P.oldVertiMax : P.oldHoriInnerMax);
}

function series(events, key, lastTime) {
  const out = [];
  for (let i = 0; i < events.length; i++) {
    const a = events[i];
    const b = events[i + 1] || { ...a, time: lastTime };
    out.push(event(a[key], b[key], a.time, Math.max(a.time + 0.001, b.time)));
  }
  return out;
}

function steppedSeries(events, key, lastTime) {
  const out = [];
  for (let i = 0; i < events.length; i++) {
    const a = events[i];
    const b = events[i + 1] || { ...a, time: lastTime };
    const end = Math.max(a.time + 0.001, b.time - 0.001);
    out.push(event(a[key], a[key], a.time, end));
  }
  return out;
}

function event(start, end, startSec, endSec) {
  return {
    bezier: 0,
    bezierPoints: [0, 0, 0, 0],
    easingLeft: 0,
    easingRight: 1,
    easingType: 1,
    end,
    endTime: timeArray(endSec * P.pixelPerSec),
    linkgroup: 0,
    start,
    startTime: timeArray(startSec * P.pixelPerSec),
  };
}

function control(name, value) {
  return [
    { easing: 1, [name]: value, x: 0 },
    { easing: 1, [name]: value, x: 9999999 },
  ];
}

function timeArray(pixel) {
  const px = Math.max(0, Math.round(pixel));
  return [Math.floor(px / P.pixelPerSec), Math.round((px % P.pixelPerSec) * P.msPerPixel), 1000];
}

async function makeZip(chart, coverBlob, audioBlob) {
  const lineBlob = await makeLineTexture();
  const files = {
    "chart.json": new TextEncoder().encode(JSON.stringify(chart, null, 2)),
    "cover.png": new Uint8Array(await coverBlob.arrayBuffer()),
    "line.png": new Uint8Array(await lineBlob.arrayBuffer()),
    "music.wav": new Uint8Array(await audioBlob.arrayBuffer()),
  };
  return new Blob([fflate.zipSync(files, { level: 6 })], { type: "application/zip" });
}

async function buildFakePixelLines(videoFile, settings, signal = null, writePreview = false) {
  const video = document.createElement("video");
  video.src = URL.createObjectURL(videoFile);
  video.muted = true;
  video.playsInline = true;
  await once(video, "loadedmetadata");

  const duration = video.duration || 0;
  const fps = Math.max(1, Math.min(12, Math.round(settings.fakePixelFps || 6)));
  const step = 1 / fps;
  const rows = P.videoRows;
  const cols = P.videoCols;
  const threshold = Math.max(1, Math.min(255, Math.round(settings.fakePixelThreshold || 128)));
  const useGrey = settings.fakePixelMode === "grey";
  const work = els.workCanvas;
  const ctx = work.getContext("2d", { willReadFrequently: true });
  work.width = cols;
  work.height = rows;

  const prev = new Uint8Array(rows * cols);
  const start = new Float32Array(rows * cols);
  const lines = Array.from({ length: rows }, (_, row) => judgeLine({
    name: `Pixel row ${P.videoY0 - row * P.videoYStep}`,
    group: 2,
    notes: [],
    x: 0,
    y: P.videoY0 - row * P.videoYStep,
    rotation: 0,
    alpha: 0,
    lastTime: Math.max(duration, 0.01),
    zOrder: -1,
  }));

  for (let t = 0; t <= duration + 0.0001; t += step) {
    throwIfAborted(signal);
    setStatus("Building pixel decoration", `${Math.min(duration, t).toFixed(1)}s / ${duration.toFixed(1)}s`);
    updateProgress(0.35 + 0.2 * (duration ? Math.min(1, t / duration) : 1));
    await seekVideo(video, Math.min(duration, t));
    ctx.drawImage(video, 0, 0, cols, rows);
    const data = ctx.getImageData(0, 0, cols, rows).data;

    for (let row = 0; row < rows; row++) {
      const notes = lines[row].notes;
      for (let col = 0; col < cols; col++) {
        const i = row * cols + col;
        const p = i * 4;
        const grey = Math.round(data[p] * 0.299 + data[p + 1] * 0.587 + data[p + 2] * 0.114);
        const val = useGrey ? grey : (grey < threshold ? 0 : 255);
        if (Math.abs(prev[i] - val) < threshold) continue;

        if (prev[i] > 0) {
          notes.push(fakePixelNote(col, start[i], t, prev[i]));
        }
        if (val > 0) start[i] = t;
        prev[i] = val;
      }
    }

    if (writePreview) {
      const time = Math.min(duration, t);
      const event = {
        time,
        x: 0,
        y: 0,
        rotation: 0,
        detected: true,
        pixelGrid: new Uint8Array(prev),
      };
      pixelPreviewEvents.push(event);
      if (!previewEvents.length || previewEvents[0]?.pixelGrid) previewEvents.push(event);
      if (!previewDragging && previewVisible) {
        els.previewSlider.max = Math.max(0, previewEvents.length - 1);
        els.previewSlider.step = 1;
        els.previewSlider.value = previewEvents.length - 1;
        setPreviewControlsEnabled(true);
        renderPreviewAtSlider();
      }
    }

    await waitFrame();
  }

  for (let row = 0; row < rows; row++) {
    const notes = lines[row].notes;
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col;
      if (prev[i] > 0) {
        notes.push(fakePixelNote(col, start[i], duration, prev[i]));
      }
    }
  }

  for (const line of lines) line.numOfNotes = line.notes.length;
  URL.revokeObjectURL(video.src);
  return { lines };
}

function fakePixelNote(col, startSec, endSec, alpha) {
  const safeEnd = Math.max(startSec + 0.001, endSec);
  return {
    above: 1,
    alpha,
    endTime: timeArray(safeEnd * P.pixelPerSec),
    isFake: 1,
    positionX: P.videoX0 + P.videoXStep * col,
    size: 0.07,
    speed: 0,
    startTime: timeArray(safeEnd * P.pixelPerSec),
    type: 4,
    visibleTime: Math.max(0.001, safeEnd - startSec),
    yOffset: 0,
  };
}

async function buildStickFigureLines(videoFile, settings, signal = null, writePreview = false) {
  const video = document.createElement("video");
  video.src = URL.createObjectURL(videoFile);
  video.muted = true;
  video.playsInline = true;
  await once(video, "loadedmetadata");

  const duration = video.duration || 0;
  const lastTime = Math.max(duration, 0.01);
  const sampleTimes = stickFigureSampleTimes(duration, settings);
  const work = els.workCanvas;
  const ctx = work.getContext("2d", { willReadFrequently: true });
  const previewScale = Math.min(1, P.stickFrameWidth / Math.max(1, video.videoWidth));
  const detectionScale = settings.stickOriginalSize ? 1 : previewScale;
  work.width = Math.max(1, Math.round(video.videoWidth * detectionScale));
  work.height = Math.max(1, Math.round(video.videoHeight * detectionScale));

  const maxHumanoids = stickMaxHumanoids(settings);
  setStatus("Loading MoveNet", maxHumanoids > 1
    ? "Loading lightweight multi-person pose detector for stick figure detection."
    : "Loading lightweight pose detector for stick figure detection.");
  const detector = await getStickPoseDetector(maxHumanoids);
  throwIfAborted(signal);

  const segmentNames = stickSegmentLineNames(maxHumanoids);
  const segmentSamples = new Map(segmentNames.map(({ key }) => [key, []]));
  const lastPoses = new Array(maxHumanoids).fill(null);
  const poseSlotById = new Map();

  for (let i = 0; i < sampleTimes.length; i++) {
    throwIfAborted(signal);
    const time = sampleTimes[i];
    setStatus("Building MoveNet stick figure", `${time.toFixed(1)}s / ${duration.toFixed(1)}s`);
    updateProgress(0.35 + 0.2 * (sampleTimes.length > 1 ? i / (sampleTimes.length - 1) : 1));
    await seekVideo(video, time);
    ctx.drawImage(video, 0, 0, work.width, work.height);

    const poses = await detector.estimatePoses(work, {
      maxPoses: maxHumanoids,
      flipHorizontal: false,
    });
    const slotPoses = assignStickPosesToSlots(poses || [], poseSlotById, maxHumanoids);
    const allSegments = [];
    const visibleUntil = Math.max(time + 0.001, sampleTimes[i + 1] ?? lastTime);

    for (let slot = 0; slot < maxHumanoids; slot++) {
      const keypoints = slotPoses[slot]?.keypoints || null;
      const pose = keypoints
        ? moveNetPoseToStickPose(keypoints, work.width, work.height, settings, lastPoses[slot])
        : (settings.stickHoldMissingJoints ? lastPoses[slot] : null);
      const segments = pose ? stickSegmentsFromPose(pose) : [];

      if (pose) lastPoses[slot] = pose;

      for (const segment of segments) {
        const lineKey = stickSegmentLineKey(slot, segment.name);
        const sample = { ...segment, end: { ...segment.end }, time, visibleUntil };
        segmentSamples.get(lineKey)?.push(sample);
        allSegments.push(sample);
      }
    }

    if (writePreview) {
      const event = {
        time,
        x: 0,
        y: 0,
        rotation: 0,
        detected: slotPoses.some((pose) => pose?.keypoints?.length),
        stickSegments: allSegments.map((segment) => ({ ...segment, end: { ...segment.end } })),
      };
      previewEvents.push(event);
      if (!previewDragging && previewVisible) {
        els.previewSlider.max = Math.max(0, previewEvents.length - 1);
        els.previewSlider.step = 1;
        els.previewSlider.value = previewEvents.length - 1;
        setPreviewControlsEnabled(true);
        drawPreview(event, latestAudioAnalysis?.notes || [], video, {
          showLine: false,
          showOrigin: false,
          currentTime: event.time ?? time,
          frameWidth: work.width,
          frameHeight: work.height,
        });
        drawWaveform(event.time ?? time);
      }
    }
    await waitFrame();
  }

  const lines = segmentNames.map(({ key, label }) => (
    stickFigureLine(label, segmentSamples.get(key) || [], lastTime, settings.stickHoldPose)
  ));
  URL.revokeObjectURL(video.src);
  return {
    duration,
    lines,
  };
}

function stickMaxHumanoids(settings) {
  const value = Number(settings.stickMaxHumanoids);
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.round(value));
}

function stickSegmentLineNames(maxHumanoids) {
  const count = Math.max(1, maxHumanoids);
  const names = [];

  for (let slot = 0; slot < count; slot++) {
    for (const segmentName of STICK_SEGMENT_NAMES) {
      names.push({
        key: stickSegmentLineKey(slot, segmentName),
        label: count > 1 ? `Humanoid ${slot + 1} ${segmentName}` : segmentName,
      });
    }
  }

  return names;
}

function stickSegmentLineKey(slot, segmentName) {
  return `${slot}:${segmentName}`;
}

function assignStickPosesToSlots(poses, poseSlotById, maxHumanoids) {
  const slots = new Array(maxHumanoids).fill(null);
  const sorted = poses
    .slice()
    .filter((pose) => pose?.keypoints?.length)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, maxHumanoids);

  for (const pose of sorted) {
    const id = stickPoseId(pose);
    const knownSlot = id === null ? null : poseSlotById.get(id);
    if (knownSlot !== null && knownSlot !== undefined && knownSlot < maxHumanoids && !slots[knownSlot]) {
      slots[knownSlot] = pose;
    }
  }

  let nextFreeSlot = 0;
  for (const pose of sorted) {
    if (slots.includes(pose)) continue;
    while (nextFreeSlot < maxHumanoids && slots[nextFreeSlot]) nextFreeSlot++;
    if (nextFreeSlot >= maxHumanoids) break;
    slots[nextFreeSlot] = pose;
  }

  poseSlotById.clear();
  slots.forEach((pose, slot) => {
    const id = stickPoseId(pose);
    if (id !== null) poseSlotById.set(id, slot);
  });

  return slots;
}

function stickPoseId(pose) {
  const id = pose?.id ?? pose?.poseId ?? pose?.trackingId;
  return id === undefined || id === null ? null : String(id);
}

function stickFigureSampleTimes(duration, settings) {
  if (settings.stickDetectOnsetOnly) {
    const times = (latestAudioAnalysis?.notes || [])
      .map((note) => secondsFromTime(note.startTime))
      .filter((time) => Number.isFinite(time) && time >= 0 && time <= duration);
    return uniqueSortedTimes(times);
  }

  const fps = Math.max(1, Math.min(12, Math.round(settings.stickFps || 5)));
  const step = 1 / fps;
  const times = [];
  for (let t = 0; t <= duration + 0.0001; t += step) {
    times.push(Math.min(duration, t));
  }
  return uniqueSortedTimes(times);
}

function uniqueSortedTimes(times) {
  const sorted = times.slice().sort((a, b) => a - b);
  const unique = [];

  for (const time of sorted) {
    if (!unique.length || Math.abs(unique[unique.length - 1] - time) > 0.001) {
      unique.push(time);
    }
  }

  return unique;
}

async function getStickPoseDetector(maxHumanoids = 1) {
  const key = maxHumanoids > 1 ? "multipose" : "singlepose";
  if (!stickPoseDetectorPromises.has(key)) {
    stickPoseDetectorPromises.set(key, createStickPoseDetector(maxHumanoids));
  }
  return await stickPoseDetectorPromises.get(key);
}

async function createStickPoseDetector(maxHumanoids = 1) {
  await loadExternalScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js");
  await loadExternalScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js");

  if (!window.tf || !window.poseDetection) {
    throw new Error("MoveNet libraries did not load correctly.");
  }

  setStatus("Loading MoveNet", "Initializing lightweight pose detector.");
  try {
    await tf.setBackend("webgl");
  } catch (err) {
    console.warn("TensorFlow WebGL backend failed; using default backend.", err);
  }
  await tf.ready();

  const useMultiPose = maxHumanoids > 1;
  const config = {
    modelType: useMultiPose
      ? poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING
      : poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    enableSmoothing: true,
  };

  if (useMultiPose) {
    config.enableTracking = true;
    if (poseDetection.TrackerType?.BoundingBox) {
      config.trackerType = poseDetection.TrackerType.BoundingBox;
    }
  }

  return await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, config);
}

const externalScriptPromises = new Map();

function loadExternalScript(src) {
  if (externalScriptPromises.has(src)) return externalScriptPromises.get(src);

  const existing = Array.from(document.scripts).find((script) => script.src === src);
  if (existing) return Promise.resolve();

  const promise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });

  externalScriptPromises.set(src, promise);
  return promise;
}

const MOVENET = {
  nose: "nose",
  leftEye: "left_eye",
  rightEye: "right_eye",
  leftEar: "left_ear",
  rightEar: "right_ear",
  leftShoulder: "left_shoulder",
  rightShoulder: "right_shoulder",
  leftElbow: "left_elbow",
  rightElbow: "right_elbow",
  leftWrist: "left_wrist",
  rightWrist: "right_wrist",
  leftHip: "left_hip",
  rightHip: "right_hip",
  leftKnee: "left_knee",
  rightKnee: "right_knee",
  leftAnkle: "left_ankle",
  rightAnkle: "right_ankle",
};

const STICK_SEGMENT_NAMES = [
  "Head",
  "Body",
  "Shoulders",
  "Hips",
  "Left upper arm",
  "Left lower arm",
  "Left hand",
  "Right upper arm",
  "Right lower arm",
  "Right hand",
  "Left upper leg",
  "Left lower leg",
  "Left foot",
  "Right upper leg",
  "Right lower leg",
  "Right foot",
];

function moveNetPoseToStickPose(keypoints, width, height, settings, previousPose = null) {
  const byName = new Map(keypoints.map((kp) => [kp.name || kp.part, kp]));
  const minScore = Math.max(0, Math.min(1, settings.stickJointThreshold ?? 0.1));
  const holdMissing = !!settings.stickHoldMissingJoints;

  const point = (key, name) => {
    const kp = byName.get(name);
    if (!kp || (kp.score ?? 1) < minScore) return holdMissing ? previousPose?.[key] || null : null;
    const x = Math.max(0, Math.min(width - 1, kp.x));
    const y = Math.max(0, Math.min(height - 1, kp.y));
    return frameToChart(x, y, width, height);
  };

  const avg = (key, names) => {
    const points = names.map((name) => pose[name]).filter(Boolean);
    if (!points.length) return holdMissing ? previousPose?.[key] || null : null;
    return {
      x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
      y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
    };
  };

  const pose = {
    nose: point("nose", MOVENET.nose),
    leftEye: point("leftEye", MOVENET.leftEye),
    rightEye: point("rightEye", MOVENET.rightEye),
    leftEar: point("leftEar", MOVENET.leftEar),
    rightEar: point("rightEar", MOVENET.rightEar),
    leftShoulder: point("leftShoulder", MOVENET.leftShoulder),
    rightShoulder: point("rightShoulder", MOVENET.rightShoulder),
    leftElbow: point("leftElbow", MOVENET.leftElbow),
    rightElbow: point("rightElbow", MOVENET.rightElbow),
    leftWrist: point("leftWrist", MOVENET.leftWrist),
    rightWrist: point("rightWrist", MOVENET.rightWrist),
    leftHip: point("leftHip", MOVENET.leftHip),
    rightHip: point("rightHip", MOVENET.rightHip),
    leftKnee: point("leftKnee", MOVENET.leftKnee),
    rightKnee: point("rightKnee", MOVENET.rightKnee),
    leftAnkle: point("leftAnkle", MOVENET.leftAnkle),
    rightAnkle: point("rightAnkle", MOVENET.rightAnkle),
  };

  pose.neck = avg("neck", ["leftShoulder", "rightShoulder"]);
  pose.midHip = avg("midHip", ["leftHip", "rightHip"]);
  pose.headTop = avg("headTop", ["nose", "leftEye", "rightEye", "leftEar", "rightEar"]);

  pose.leftHand = extendJoint(pose.leftElbow, pose.leftWrist, 0.45) || (holdMissing ? previousPose?.leftHand || null : null);
  pose.rightHand = extendJoint(pose.rightElbow, pose.rightWrist, 0.45) || (holdMissing ? previousPose?.rightHand || null : null);
  pose.leftFoot = extendJoint(pose.leftKnee, pose.leftAnkle, 0.38) || (holdMissing ? previousPose?.leftFoot || null : null);
  pose.rightFoot = extendJoint(pose.rightKnee, pose.rightAnkle, 0.38) || (holdMissing ? previousPose?.rightFoot || null : null);

  return pose;
}

function extendJoint(from, to, ratio) {
  if (!from || !to) return null;
  return {
    x: to.x + (to.x - from.x) * ratio,
    y: to.y + (to.y - from.y) * ratio,
  };
}

function stickSegmentsFromPose(pose) {
  return [
    stickSegment("Head", pose.neck, pose.headTop || pose.nose),
    stickSegment("Body", pose.neck, pose.midHip),
    stickSegment("Shoulders", pose.leftShoulder, pose.rightShoulder),
    stickSegment("Hips", pose.leftHip, pose.rightHip),
    stickSegment("Left upper arm", pose.leftShoulder, pose.leftElbow),
    stickSegment("Left lower arm", pose.leftElbow, pose.leftWrist),
    stickSegment("Left hand", pose.leftWrist, pose.leftHand),
    stickSegment("Right upper arm", pose.rightShoulder, pose.rightElbow),
    stickSegment("Right lower arm", pose.rightElbow, pose.rightWrist),
    stickSegment("Right hand", pose.rightWrist, pose.rightHand),
    stickSegment("Left upper leg", pose.leftHip, pose.leftKnee),
    stickSegment("Left lower leg", pose.leftKnee, pose.leftAnkle),
    stickSegment("Left foot", pose.leftAnkle, pose.leftFoot),
    stickSegment("Right upper leg", pose.rightHip, pose.rightKnee),
    stickSegment("Right lower leg", pose.rightKnee, pose.rightAnkle),
    stickSegment("Right foot", pose.rightAnkle, pose.rightFoot),
  ].filter((segment) => segment && segment.length >= 6);
}

function stickSegment(name, start, end) {
  if (!start || !end) return null;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  return {
    name,
    x: start.x,
    y: start.y,
    rotation: (Math.atan2(dy, dx) * 180) / Math.PI,
    length: Math.hypot(dx, dy),
    end,
  };
}

function stickFigureLine(name, samples, lastTime, holdPose = false) {
  if (!samples.length) {
    return judgeLine({ name: `Stick ${name}`, group: 2, notes: [], alpha: 0, lastTime, zOrder: -1 });
  }

  // Export each invisible judge line at the center of the preview segment.
  // Because the fake note is centered on the line, a segment has no visible
  // direction: angle A and A + 180 degrees look identical. If we export raw
  // atan2 angles, a limb crossing the +/-180 or +/-90 boundary can make the
  // game interpolate through a huge spin. Canonicalize to a 180-degree period,
  // then unwrap consecutive samples so each segment takes the shortest rotation
  // path between frames. Finally, negate because the game/chart rotation
  // direction is opposite from the canvas/math atan2() direction.
  const rawEvents = samples.map((sample) => ({
    time: sample.time,
    x: (sample.x + sample.end.x) / 2,
    y: (sample.y + sample.end.y) / 2,
    rotation: -canonicalStickRotation(sample.rotation),
  }));
  const events = unwrapStickRotationEvents(rawEvents);
  const eventSeries = holdPose ? steppedSeries : series;

  const notes = [];
  for (let i = 0; i < samples.length; i++) {
    const start = samples[i].time;
    const end = Math.min(samples[i].visibleUntil ?? samples[i + 1]?.time ?? lastTime, lastTime);
    if (end <= start + 0.001) continue;
    notes.push(fakeStickNote(samples[i].length, start, end));
  }

  return judgeLine({
    name: `Stick ${name}`,
    group: 2,
    notes,
    alpha: 0,
    moveXEvents: eventSeries(events, "x", lastTime),
    moveYEvents: eventSeries(events, "y", lastTime),
    rotateEvents: eventSeries(events, "rotation", lastTime),
    lastTime,
    zOrder: -1,
  });
}

function canonicalStickRotation(rotation) {
  // Stick fake notes are visually symmetric around 180 degrees because they are
  // centered at positionX = 0. Keep the represented angle in [-90, 90) so a
  // nearly vertical limb does not flip between +179 and -179 degrees.
  let angle = ((rotation + 90) % 180 + 180) % 180 - 90;
  if (angle <= -90) angle += 180;
  return angle;
}

function unwrapStickRotationEvents(events) {
  if (!events.length) return events;
  const out = [{ ...events[0] }];

  for (let i = 1; i < events.length; i++) {
    const ev = { ...events[i] };
    const prev = out[out.length - 1].rotation;

    // Since a stick segment is symmetric under 180-degree rotation, adjust by
    // +/-180, not +/-360, to minimize the visible interpolation step.
    while (ev.rotation - prev > 90) ev.rotation -= 180;
    while (ev.rotation - prev < -90) ev.rotation += 180;

    out.push(ev);
  }

  return out;
}

function fakeStickNote(length, startSec, endSec) {
  const safeEnd = Math.max(startSec + 0.001, endSec);
  return {
    above: 1,
    alpha: 255,
    endTime: timeArray(safeEnd * P.pixelPerSec),
    isFake: 1,
    positionX: 0,
    size: Math.max(0.05, length / P.noteWidthAtSizeOne),
    speed: 0,
    startTime: timeArray(safeEnd * P.pixelPerSec),
    type: 4,
    visibleTime: Math.max(0.001, safeEnd - startSec),
    yOffset: 0,
  };
}

function encodeWav(audioBuffer) {
  const channels = Math.min(2, audioBuffer.numberOfChannels);
  const sampleRate = audioBuffer.sampleRate;
  const samples = audioBuffer.length;
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const dataSize = samples * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  let offset = 0;

  writeAscii(view, offset, "RIFF"); offset += 4;
  view.setUint32(offset, 36 + dataSize, true); offset += 4;
  writeAscii(view, offset, "WAVE"); offset += 4;
  writeAscii(view, offset, "fmt "); offset += 4;
  view.setUint32(offset, 16, true); offset += 4;
  view.setUint16(offset, 1, true); offset += 2;
  view.setUint16(offset, channels, true); offset += 2;
  view.setUint32(offset, sampleRate, true); offset += 4;
  view.setUint32(offset, sampleRate * blockAlign, true); offset += 4;
  view.setUint16(offset, blockAlign, true); offset += 2;
  view.setUint16(offset, 16, true); offset += 2;
  writeAscii(view, offset, "data"); offset += 4;
  view.setUint32(offset, dataSize, true); offset += 4;

  const channelData = Array.from({ length: channels }, (_, i) => audioBuffer.getChannelData(i));
  for (let i = 0; i < samples; i++) {
    for (let ch = 0; ch < channels; ch++) {
      const sample = Math.max(-1, Math.min(1, channelData[ch][i] || 0));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: "audio/wav" });
}

function writeAscii(view, offset, text) {
  for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
}

async function makeLineTexture() {
  const canvas = els.targetCanvas;
  canvas.width = 1024;
  canvas.height = 12;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.fillRect(0, 4, canvas.width, 4);
  return await canvasToBlob(canvas, "image/png");
}

async function coverBlobForExport(videoFile) {
  const coverFile = els.coverInput.files?.[0];
  if (!els.useVideoCoverInput.checked && coverFile) return coverFile;
  if (videoFile) return await captureCover(videoFile);
  return await makeCoverPlaceholder();
}

async function makeCoverPlaceholder() {
  const canvas = els.targetCanvas;
  canvas.width = 1024;
  canvas.height = 576;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#101312";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#344039";
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);
  ctx.fillStyle = "#d9ef8f";
  ctx.fillRect(256, 284, 512, 8);
  return await canvasToBlob(canvas, "image/png");
}

function drawPreview(ev, notes = [], frameSource = null, options = {}) {
  if (!previewVisible) return;
  latestPreview = ev;
  const canvas = els.outputCanvas;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (frameSource) {
    ctx.fillStyle = "#060707";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    latestPreviewFrame = cloneCanvas(frameSource, options.frameWidth, options.frameHeight);
    drawPreviewFrame(ctx, canvas, latestPreviewFrame);
  } else if (latestPreviewFrame) {
    drawPreviewFrame(ctx, canvas, latestPreviewFrame);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#060707";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (frameSource) {
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.strokeStyle = "#202a25";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

  const showLine = options.showLine ?? true;
  const showOrigin = options.showOrigin ?? showLine;
  const displayTime = options.currentTime ?? ev.time ?? 0;
  const judgeLines = options.judgeLines || null;
  if (options.pixelEvent?.pixelGrid) drawPixelGrid(ctx, canvas, options.pixelEvent.pixelGrid);

  if (ev.stickSegments?.length) {
    drawStickFigurePreview(ctx, canvas, ev.stickSegments);
  }

  if (judgeLines?.length) {
    drawJudgeLinesPreview(ctx, canvas, judgeLines, displayTime);
  } else if (showLine) {
    const viewport = judgePreviewViewport(canvas);
    const origin = chartToPreviewCanvas(ev.x, ev.y, viewport);
    drawNotes(ctx, origin, ev.rotation, displayTime, notes, viewport);

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    drawClippedLine(ctx, canvas, origin, ev.rotation);

    if (showOrigin) {
      ctx.save();
      ctx.translate(origin.x, origin.y);
      ctx.fillStyle = "#000000";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(10, 0);
      ctx.moveTo(0, -10);
      ctx.lineTo(0, 10);
      ctx.stroke();
      ctx.restore();
    }
  }
}

async function renderPreviewAtTime(time) {
  if (!previewVisible) return;
  // Before visual tracking produces frames, do NOT seek/draw raw video frames.
  // But audio-only preview should still show the default centered judge line
  // and generated notes on a dark background.
  const notes = latestAudioAnalysis?.notes || [];
  const judgeLines = previewJudgeLines();
  drawWaveform(time);

  if (judgeLines?.length || audioStatus === "done" || notes.length) {
    // Prevent old visual frames from staying cached after visual is removed.
    latestPreviewFrame = null;
    drawPreview(
      { x: 0, y: 0, rotation: 0, detected: false, time },
      notes,
      null,
      {
        showLine: true,
        showOrigin: false,
        currentTime: time,
        judgeLines,
      }
    );
    return;
  }

  drawPreVisualPlaceholder("Process audio to preview notes, or process visual to preview video frames.");
}

function drawPreVisualPlaceholder(message) {
  if (!previewVisible) return;
  latestPreview = { x: 0, y: 0, rotation: 0, detected: false, time: currentPreviewTime() };
  latestPreviewFrame = null;

  const canvas = els.outputCanvas;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#060707";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#202a25";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

  ctx.fillStyle = "#aab2aa";
  ctx.font = "20px system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

function drawPixelConversionPreview(ev, judgeLines = null, currentTime = ev.time || 0) {
  if (!previewVisible) return;
  latestPreview = ev;
  latestPreviewFrame = null;

  const canvas = els.outputCanvas;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#060707";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#202a25";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

  const grid = ev.pixelGrid;
  if (!grid?.length) return;

  drawPixelGrid(ctx, canvas, grid);
  if (judgeLines?.length) drawJudgeLinesPreview(ctx, canvas, judgeLines, currentTime);
}

function drawPixelGrid(ctx, canvas, grid) {
  const viewport = judgePreviewViewport(canvas);
  const cellW = Math.max(2, P.videoXStep * viewport.scaleX);
  const cellH = Math.max(2, P.videoYStep * viewport.scaleY);

  for (let row = 0; row < P.videoRows; row++) {
    for (let col = 0; col < P.videoCols; col++) {
      const alpha = grid[row * P.videoCols + col] || 0;
      if (!alpha) continue;
      const center = chartToPreviewCanvas(P.videoX0 + P.videoXStep * col, P.videoY0 - P.videoYStep * row, viewport);
      ctx.fillStyle = `rgba(255, 216, 77, ${Math.max(0.08, alpha / 255)})`;
      ctx.fillRect(center.x - cellW / 2, center.y - cellH / 2, cellW, cellH);
    }
  }
}

function renderPreviewAtSlider() {
  if (!previewVisible) return;
  const notes = latestAudioAnalysis?.notes || [];
  const judgeLines = previewJudgeLines();

  if (!previewEvents.length) {
    renderPreviewAtTime(currentPreviewTime());
    return;
  }

  const index = sliderIndex();
  const event = previewEvents[index];
  const time = event?.time ?? 0;

  if (event.pixelGrid) drawPixelConversionPreview(event, judgeLines, time);
  else {
    // Once visual tracking frames exist, the preview slider is frame-based again.
    // The scrubber now replays lightweight processed states without retaining a
    // canvas for every sampled video frame. The last displayed video frame stays
    // as a background until visual processing provides a newer one.
    drawPreview(event, notes, null, {
      showLine: !event.stickSegments,
      showOrigin: !event.stickSegments,
      currentTime: time,
      judgeLines,
      pixelEvent: nearestPixelPreviewEvent(time),
    });
  }
  drawWaveform(time);
}

function renderCurrentPreview() {
  if (!previewVisible) return;
  if (previewEvents.length) renderPreviewAtSlider();
  else renderPreviewAtTime(currentPreviewTime());
}

function nearestPixelPreviewEvent(time) {
  if (!pixelPreviewEvents.length) return null;
  let lo = 0;
  let hi = pixelPreviewEvents.length - 1;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (pixelPreviewEvents[mid].time <= time) lo = mid;
    else hi = mid - 1;
  }
  return pixelPreviewEvents[lo] || null;
}

function startPreviewPlayback() {
  if (previewControlsLocked()) return;
  if (!previewEvents.length && !latestAudioAnalysis?.duration) return;
  previewDragging = false;
  previewPlaying = true;
  els.play.textContent = "Pause";

  if (previewEvents.length) {
    let index = sliderIndex();
    if (index >= previewEvents.length - 1) {
      index = 0;
      els.previewSlider.value = 0;
    }
    previewStartTime = previewEvents[index]?.time ?? 0;
  } else {
    const duration = Math.max(latestAudioAnalysis?.duration || 0, 0);
    previewStartTime = duration && currentPreviewTime() >= duration ? 0 : currentPreviewTime();
    setPreviewTime(previewStartTime);
  }

  previewStartClock = performance.now() / 1000;
  if (latestAudioBuffer) startPreviewAudio(previewStartTime);
  tickPreviewPlayback();
}

function tickPreviewPlayback() {
  if (!previewPlaying) return;
  const elapsed = performance.now() / 1000 - previewStartClock;
  const t = previewStartTime + elapsed;

  if (previewEvents.length) {
    const index = nearestPreviewIndex(t);
    els.previewSlider.value = index;
    if (previewVisible) renderPreviewAtSlider();
    if (index >= previewEvents.length - 1) {
      stopPreviewPlayback(true);
      return;
    }
  } else {
    const duration = Math.max(latestAudioAnalysis?.duration || 0, 0);
    setPreviewTime(t);
    if (previewVisible) renderPreviewAtTime(t);
    if (duration && t >= duration) {
      stopPreviewPlayback(true);
      return;
    }
  }

  previewRaf = requestAnimationFrame(tickPreviewPlayback);
}

function stopPreviewPlayback(stopAudio) {
  previewPlaying = false;
  cancelAnimationFrame(previewRaf);
  previewRaf = 0;
  els.play.textContent = "Play";
  if (stopAudio) stopPreviewAudio();
}

function nearestPreviewIndex(time) {
  if (!previewEvents.length) return 0;
  let lo = 0;
  let hi = previewEvents.length - 1;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (previewEvents[mid].time <= time) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

function startPreviewAudio(startTime) {
  stopPreviewAudio();
  audioCtx = new AudioContext();
  audioSource = audioCtx.createBufferSource();
  audioSource.buffer = latestAudioBuffer;
  audioSource.connect(audioCtx.destination);
  audioSource.start(0, Math.max(0, Math.min(startTime, latestAudioBuffer.duration)));
}

function stopPreviewAudio() {
  if (audioSource) {
    try {
      audioSource.stop();
    } catch {}
    audioSource.disconnect();
    audioSource = null;
  }
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
}

function drawWaveform(centerTime = latestPreview?.time || 0) {
  if (!previewVisible) return;
  const canvas = els.waveCanvas;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width || canvas.width));
  const height = Math.max(1, Math.round(rect.height || canvas.height));
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#050606";
  ctx.fillRect(0, 0, width, height);

  const midY = height / 2;

  if (!latestAudioAnalysis?.waveform?.length) {
    ctx.strokeStyle = "#26312c";
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.stroke();

    // Even before audio or visual processing, the slider time should still
    // move a visible center cursor in the waveform panel.
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    return;
  }

  const waveform = latestAudioAnalysis.waveform;
  const duration = Math.max(0, latestAudioAnalysis.duration || 0);

  // Keep this tied to panel height so vertical resizing still zooms in/out.
  // Taller panel = fewer seconds visible = more zoomed in.
  const secondsVisible = Math.max(1, 14 * (160 / height));

  // IMPORTANT:
  // Do NOT clamp startTime/endTime to the audio duration.
  // Let the visible window extend before 0 and after duration.
  // Those out-of-audio areas become visual padding instead of forcing scale/freeze.
  const safeCenterTime = Math.max(0, Math.min(duration, Number(centerTime) || 0));
  const startTime = safeCenterTime - secondsVisible / 2;
  const endTime = safeCenterTime + secondsVisible / 2;
  const visibleDuration = Math.max(0.001, endTime - startTime);

  const amp = Math.max(12, height * 0.46);

  // Center baseline.
  ctx.strokeStyle = "#26312c";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, midY);
  ctx.lineTo(width, midY);
  ctx.stroke();

  // Draw a per-pixel peak envelope instead of sampling only one waveform
  // value per x. This prevents the visible local maxima from flickering while
  // the playback window scrolls by sub-pixel amounts.
  ctx.strokeStyle = "#7cddd0";
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let x = 0; x < width; x++) {
    const t0 = startTime + (x / width) * visibleDuration;
    const t1 = startTime + ((x + 1) / width) * visibleDuration;

    if (t1 < 0 || t0 > duration) continue;

    const i0 = Math.max(0, Math.floor(Math.max(0, t0) * P.pixelPerSec));
    const i1 = Math.min(waveform.length - 1, Math.ceil(Math.min(duration, t1) * P.pixelPerSec));
    let peak = 0;
    for (let i = i0; i <= i1; i++) peak = Math.max(peak, waveform[i] || 0);

    const yTop = midY - peak * amp;
    const yBottom = midY + peak * amp;
    ctx.moveTo(x + 0.5, yTop);
    ctx.lineTo(x + 0.5, yBottom);
  }
  ctx.stroke();

  // Draw note detection blocks using the same unclamped time window.
  // Clamp the visible rectangle edges to the canvas, not the time window.
  for (const d of latestAudioAnalysis.detections) {
    if (d.end < startTime || d.start > endTime) continue;

    const x0 = ((d.start - startTime) / visibleDuration) * width;
    const x1 = ((d.end - startTime) / visibleDuration) * width;
    const drawX0 = Math.max(0, Math.min(width, x0));
    const drawX1 = Math.max(0, Math.min(width, x1));

    ctx.fillStyle = d.long ? "rgba(69, 167, 255, 0.3)" : "rgba(255, 216, 77, 0.34)";
    ctx.fillRect(drawX0, 0, Math.max(2, drawX1 - drawX0), height);

    ctx.strokeStyle = d.long ? "#45a7ff" : "#ffd84d";
    ctx.beginPath();

    if (x0 >= 0 && x0 <= width) {
      ctx.moveTo(x0, 0);
      ctx.lineTo(x0, height);
    }

    if (x1 >= 0 && x1 <= width) {
      ctx.moveTo(x1, 0);
      ctx.lineTo(x1, height);
    }

    ctx.stroke();
  }

  // Fixed center cursor: always represents preview slider time.
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.stroke();
}

function previewJudgeLines() {
  if (audioStatus !== "done" && visualStatus !== "done") return null;
  const settings = readSettings();
  const notes = audioStatus === "done" ? latestAudioAnalysis?.notes || [] : [];
  const visualEvents = visualStatus === "done" && latestVisualTracking?.chartEvents?.length
    ? latestVisualTracking.chartEvents
    : [{ time: 0, x: 0, y: 0, rotation: 0, detected: false }];
  const duration = Math.max(
    latestAudioAnalysis?.duration || 0,
    latestVisualTracking?.duration || 0,
    previewVideoDuration || 0,
    visualEvents.at(-1)?.time || 0
  );
  const key = JSON.stringify({
    audioStatus,
    visualStatus,
    settings,
    notes: notes.length,
    detections: latestAudioAnalysis?.detections?.length || 0,
    visualEvents: visualEvents.length,
    duration: Math.round(duration * 1000),
  });

  if (key === latestPreviewJudgeLinesKey) return latestPreviewJudgeLines;

  latestPreviewJudgeLinesKey = key;
  latestPreviewJudgeLines = buildJudgeLinesForTemplate({
    template: settings.judgeTemplate,
    notes,
    audioAnalysis: latestAudioAnalysis,
    trackingEvents: visualEvents,
    lastTime: Math.max(duration, 0.01),
    settings,
  });
  return latestPreviewJudgeLines;
}

function drawJudgeLinesPreview(ctx, canvas, judgeLines, currentTime) {
  const lines = [...judgeLines].sort((a, b) => (a.zOrder || 0) - (b.zOrder || 0));
  const viewport = judgePreviewViewport(canvas);
  for (const line of lines) {
    const state = judgeLineStateAt(line, currentTime);
    const origin = chartToPreviewCanvas(state.x, state.y, viewport);
    drawNotes(ctx, origin, state.rotation, currentTime, line.notes || [], viewport);

    const alpha = state.alpha / 255;
    const hasUpcomingNotes = lineHasUpcomingNotes(line, currentTime);
    if (alpha <= 0 && !hasUpcomingNotes) continue;

    ctx.save();
    ctx.globalAlpha = Math.max(alpha, hasUpcomingNotes ? 0.28 : 0);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    drawClippedLine(ctx, canvas, origin, state.rotation);
    ctx.restore();
  }
}

function drawPreviewFrame(ctx, canvas, frame) {
  const viewport = judgePreviewViewport(canvas);
  const width = P.chartWidth * viewport.scaleX;
  const height = P.chartHeight * viewport.scaleY;
  ctx.drawImage(frame, viewport.margin, viewport.margin, width, height);
}

function judgePreviewViewport(canvas) {
  const margin = Math.min(P.previewMargin, Math.floor(Math.min(canvas.width, canvas.height) / 4));
  const innerWidth = Math.max(1, canvas.width - margin * 2);
  const innerHeight = Math.max(1, canvas.height - margin * 2);
  return {
    canvas,
    margin,
    scaleX: innerWidth / P.chartWidth,
    scaleY: innerHeight / P.chartHeight,
  };
}

function chartToPreviewCanvas(x, y, viewport) {
  return {
    x: viewport.margin + ((x - P.videoX0) * viewport.scaleX),
    y: viewport.margin + ((P.videoY0 - y) * viewport.scaleY),
  };
}

function judgeLineStateAt(line, time) {
  const layer = line.eventLayers?.[0] || {};
  return {
    x: valueAtEvents(layer.moveXEvents, time, 0),
    y: valueAtEvents(layer.moveYEvents, time, 0),
    rotation: valueAtEvents(layer.rotateEvents, time, 0),
    alpha: valueAtEvents(layer.alphaEvents, time, 255),
  };
}

function valueAtEvents(events, time, fallback) {
  if (!events?.length) return fallback;
  for (const ev of events) {
    const start = secondsFromTime(ev.startTime);
    const end = secondsFromTime(ev.endTime);
    if (time < start) return ev.start ?? fallback;
    if (time <= end) {
      const span = Math.max(0.001, end - start);
      const p = Math.max(0, Math.min(1, (time - start) / span));
      return (ev.start ?? fallback) + ((ev.end ?? ev.start ?? fallback) - (ev.start ?? fallback)) * p;
    }
  }
  return events.at(-1)?.end ?? events.at(-1)?.start ?? fallback;
}

function lineHasUpcomingNotes(line, currentTime) {
  return (line.notes || []).some((note) => {
    const hit = secondsFromTime(note.startTime);
    return hit > currentTime && hit <= currentTime + P.previewLead;
  });
}

function drawNotes(ctx, origin, rotation, currentTime, notes, viewport = null) {
  if (!notes?.length) return;
  ctx.save();
  ctx.translate(origin.x, origin.y);
  ctx.rotate((rotation * Math.PI) / 180);

  for (const n of notes) {
    // Preview timing should represent the hit/onset moment. For hold notes,
    // startTime is the onset and endTime is the release/end of the note. The
    // hold stays visible until release; other note types disappear at onset.
    const hit = secondsFromTime(n.startTime);
    const end = secondsFromTime(n.endTime);
    const visibleUntil = n.type === 2 ? end : hit;
    if (visibleUntil <= currentTime || hit > currentTime + P.previewLead) continue;

    ctx.strokeStyle = noteColor(n.type);
    ctx.fillStyle = noteColor(n.type);
    ctx.lineWidth = 5;
    ctx.lineCap = "round";

    const fallPxPerSec = previewFallPxPerSecForNote(n);
    const y = hit <= currentTime ? 0 : -(hit - currentTime) * fallPxPerSec;
    const x = (Number(n.positionX) || 0) * (viewport?.scaleX || 1);
    const halfWidth = Math.max(12, P.previewNoteWidth / 2);

    if (n.type === 2) {
      const remainingDuration = Math.max(0, end - Math.max(currentTime, hit));
      const height = Math.max(1, remainingDuration * fallPxPerSec);
      ctx.fillRect(x - halfWidth, y - height, halfWidth * 2, height);
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.strokeRect(x - halfWidth, y - height, halfWidth * 2, height);
    } else {
      ctx.beginPath();
      ctx.moveTo(x - halfWidth, y);
      ctx.lineTo(x + halfWidth, y);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function previewFallPxPerSecForNote(note) {
  const speed = Number(note?.speed);
  if (!Number.isFinite(speed) || speed <= 0) return P.previewFallPxPerSec;
  return P.previewFallPxPerSec * (speed / P.previewDefaultFallSpeed);
}

function noteColor(type) {
  if (type === 3) return "#ff4a55";
  if (type === 4) return "#ffd84d";
  return "#45a7ff";
}

function drawStickFigurePreview(ctx, canvas, segments) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#ffd84d";
  ctx.fillStyle = "#060707";
  ctx.lineWidth = 5;

  const joints = [];
  const viewport = judgePreviewViewport(canvas);
  for (const segment of segments) {
    const start = chartToPreviewCanvas(segment.x, segment.y, viewport);
    const end = chartToPreviewCanvas(segment.end.x, segment.end.y, viewport);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    joints.push(start, end);
  }

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  for (const point of joints) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawClippedLine(ctx, canvas, origin, rotation) {
  const dx = Math.cos((rotation * Math.PI) / 180);
  const dy = Math.sin((rotation * Math.PI) / 180);
  const hits = [];

  if (Math.abs(dx) > 0.0001) {
    for (const x of [0, canvas.width]) {
      const t = (x - origin.x) / dx;
      const y = origin.y + t * dy;
      if (y >= 0 && y <= canvas.height) hits.push({ x, y });
    }
  }

  if (Math.abs(dy) > 0.0001) {
    for (const y of [0, canvas.height]) {
      const t = (y - origin.y) / dy;
      const x = origin.x + t * dx;
      if (x >= 0 && x <= canvas.width) hits.push({ x, y });
    }
  }

  if (hits.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(hits[0].x, hits[0].y);
  ctx.lineTo(hits[1].x, hits[1].y);
  ctx.stroke();
}

function cloneCanvas(source, width = null, height = null) {
  const canvas = document.createElement("canvas");
  const sourceWidth = source?.videoWidth || source?.naturalWidth || source?.width || 1;
  const sourceHeight = source?.videoHeight || source?.naturalHeight || source?.height || 1;
  canvas.width = Math.max(1, Math.round(width ?? sourceWidth));
  canvas.height = Math.max(1, Math.round(height ?? sourceHeight));
  canvas.getContext("2d").drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function secondsFromTime(time) {
  return time[0] + time[1] / time[2];
}

function frameToChart(x, y, width, height) {
  return {
    x: P.videoX0 + (x / Math.max(1, width - 1)) * (P.videoXStep * (P.videoCols - 1)),
    y: P.videoY0 - (y / Math.max(1, height - 1)) * (P.videoYStep * (P.videoRows - 1)),
  };
}

function setStatus(title, text) {
  els.statusTitle.textContent = title;
  els.statusText.textContent = text;
}

function updateProgress(value) {
  els.progress.value = Math.max(0, Math.min(1, value));
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function once(target, eventName) {
  return new Promise((resolve, reject) => {
    const done = () => {
      target.removeEventListener(eventName, done);
      target.removeEventListener("error", fail);
      resolve();
    };
    const fail = () => reject(new Error(`Media ${eventName} failed.`));
    target.addEventListener(eventName, done, { once: true });
    target.addEventListener("error", fail, { once: true });
  });
}

async function seekVideo(video, time) {
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    await once(video, "loadeddata").catch(() => {});
  }
  if (Math.abs(video.currentTime - time) < 0.03) return;
  video.currentTime = time;
  await once(video, "seeked");
}

function waitFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

function canvasToBlob(canvas, type) {
  return new Promise((resolve) => canvas.toBlob(resolve, type));
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function safeName(name) {
  return name.replace(/[^\w.-]+/g, "_").replace(/^_+|_+$/g, "") || "PhiGen";
}

window.addEventListener("resize", () => {
  if (!latestPreview) return;
  renderCurrentPreview();
});

drawPreview({ x: 0, y: 0, rotation: 0, detected: false }, [], null, { showLine: false, currentTime: 0 });
updateInputPanels();
updateSettingsVisibility();
updateProcessButtons();
