const dropZone = document.getElementById("drop-zone");
const uploadButton = document.getElementById("upload-button");
const fileInput = document.getElementById("file-input");

const player = document.getElementById("player");
const frameImage = document.getElementById("frame");
const playButton = document.getElementById("play-button");
const playIcon = playButton.querySelector(".icon-play");
const pauseIcon = playButton.querySelector(".icon-pause");
const fpsSlider = document.getElementById("fps-slider");
const fpsValue = document.getElementById("fps-value");

// ---------- Upload page ----------

async function handleFiles(fileList) {
  const images = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
  if (images.length === 0) return;

  // Sort by file name so "frame1, frame2, ..., frame10" play in order.
  images.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  await loadFrames(images);
}

uploadButton.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", () => {
  handleFiles(fileInput.files);
  fileInput.value = "";
});

// Prevent the browser from opening a dropped file when it misses the drop zone.
["dragover", "drop"].forEach((type) => {
  window.addEventListener(type, (event) => event.preventDefault());
});

let dragDepth = 0;

dropZone.addEventListener("dragenter", () => {
  dragDepth++;
  dropZone.classList.add("dragging");
});

dropZone.addEventListener("dragleave", () => {
  dragDepth--;
  if (dragDepth === 0) dropZone.classList.remove("dragging");
});

dropZone.addEventListener("drop", (event) => {
  dragDepth = 0;
  dropZone.classList.remove("dragging");
  handleFiles(event.dataTransfer.files);
});

// ---------- Animation page ----------

// Loaded frames, kept in memory so switching between them never flickers.
let frames = [];
let currentFrame = 0;

let playing = false;
let timerId = 0;

async function loadFrames(files) {
  const loaded = await Promise.all(
    files.map(
      (file) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null); // skip files the browser can't open
          img.src = URL.createObjectURL(file);
        })
    )
  );
  frames = loaded.filter(Boolean);
  if (frames.length === 0) return;

  showFrame(0);
  dropZone.hidden = true;
  player.hidden = false;
  playButton.focus();
}

function showFrame(index) {
  currentFrame = index;
  frameImage.src = frames[index].src;
}

function frameDuration() {
  return 1000 / Number(fpsSlider.value);
}

// Show the next frame (looping back to the first) and schedule the one after it.
function scheduleNextFrame() {
  timerId = setTimeout(() => {
    showFrame((currentFrame + 1) % frames.length);
    scheduleNextFrame();
  }, frameDuration());
}

function setPlaying(value) {
  playing = value;
  playButton.setAttribute("aria-label", playing ? "Pause" : "Play");
  // SVG elements have no .hidden property, so toggle the attribute itself.
  playIcon.toggleAttribute("hidden", playing);
  pauseIcon.toggleAttribute("hidden", !playing);
  fpsSlider.disabled = !playing;
}

function play() {
  setPlaying(true);
  scheduleNextFrame();
}

function pause() {
  setPlaying(false);
  clearTimeout(timerId);
}

playButton.addEventListener("click", () => (playing ? pause() : play()));

// Apply a new FPS right away instead of waiting out the old frame duration.
fpsSlider.addEventListener("input", () => {
  fpsValue.textContent = `${fpsSlider.value} FPS`;
  if (playing) {
    clearTimeout(timerId);
    scheduleNextFrame();
  }
});
