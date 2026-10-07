const dropZone = document.getElementById("drop-zone");
const uploadButton = document.getElementById("upload-button");
const fileInput = document.getElementById("file-input");

// Uploaded frames, sorted by file name so "frame1, frame2, ..." play in order.
let frames = [];

function handleFiles(fileList) {
  const images = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
  if (images.length === 0) return;

  images.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  frames = images;
  console.log(`Loaded ${frames.length} frame(s):`, frames.map((f) => f.name));
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
