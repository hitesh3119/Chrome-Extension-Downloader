// Chrome Extension Downloader Frontend Logic (v2.2)
// Architect & Developer: Hitesh Khambhoo (hiteshkhambhoo.com)

const inputEl = document.getElementById("extension-input");
const btnClear = document.getElementById("btn-clear");
const btnPaste = document.getElementById("btn-paste");
const idBadge = document.getElementById("id-badge");
const detectionBox = document.getElementById("detection-box");
const detectedIdEl = document.getElementById("detected-id");
const detectedSlugEl = document.getElementById("detected-slug");
const btnCopyId = document.getElementById("btn-copy-id");
const copyText = document.getElementById("copy-text");

const btnDownloadZip = document.getElementById("btn-download-zip");
const btnDownloadCrx = document.getElementById("btn-download-crx");
const statusBox = document.getElementById("status-box");
const statusIcon = document.getElementById("status-icon");
const statusMessage = document.getElementById("status-message");

// Example Pills
const exampleSortlens = document.getElementById("example-sortlens");
const exampleAsksteve = document.getElementById("example-asksteve");
const exampleUblock = document.getElementById("example-ublock");
const exampleDarkreader = document.getElementById("example-darkreader");
const exampleReact = document.getElementById("example-react");

// Helper: Extract 32-char ID and formatted slug from input (supports query params & partial URLs)
function parseInput(val) {
  const text = (val || "").trim();

  // Extract 32-character ID (letters a-p only)
  const idMatch = text.match(/([a-p]{32})/i);
  const id = idMatch ? idMatch[1].toLowerCase() : null;

  let rawSlug = "";
  let cleanName = "Chrome Extension";

  const isStoreUrl =
    text.includes("chromewebstore.google.com/detail/") ||
    text.includes("chrome.google.com/webstore/detail/");

  if (isStoreUrl) {
    const detailIndex = text.indexOf("/detail/");
    if (detailIndex !== -1) {
      const afterDetail = text.substring(detailIndex + 8);
      const cleanPath = afterDetail.split("?")[0].split("#")[0];
      const segments = cleanPath.split("/").filter(Boolean);

      if (segments.length > 0) {
        if (segments[0] !== id) {
          rawSlug = segments[0];
        } else if (segments.length > 1 && segments[1] !== id) {
          rawSlug = segments[1];
        }

        if (rawSlug) {
          cleanName = rawSlug
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
        }
      }
    }
  }

  return { id, slug: rawSlug, cleanName, isStoreUrl, rawText: text };
}

// Update UI on input change
function updateUI() {
  const val = inputEl.value;
  btnClear.style.display = val ? "flex" : "none";

  const { id, cleanName, isStoreUrl } = parseInput(val);

  if (id) {
    idBadge.style.display = "inline-flex";
    detectionBox.style.display = "block";
    detectedIdEl.textContent = id;
    detectedSlugEl.textContent = cleanName;
    hideStatus();
  } else if (isStoreUrl) {
    idBadge.style.display = "inline-flex";
    detectionBox.style.display = "block";
    detectedIdEl.textContent = "Resolving ID from store...";
    detectedSlugEl.textContent = cleanName;
    hideStatus();
  } else {
    idBadge.style.display = "none";
    detectionBox.style.display = "none";
  }
}

inputEl.addEventListener("input", updateUI);

// Trigger download when user presses Enter
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleDownload("zip");
  }
});

btnClear.addEventListener("click", () => {
  inputEl.value = "";
  updateUI();
  inputEl.focus();
  hideStatus();
});

btnPaste.addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      inputEl.value = text;
      updateUI();
      hideStatus();
    }
  } catch (err) {
    showStatus("Please allow clipboard permission or paste manually.", "error");
  }
});

// Copy ID Button
if (btnCopyId) {
  btnCopyId.addEventListener("click", async () => {
    const id = detectedIdEl.textContent;
    if (id && id.length === 32) {
      try {
        await navigator.clipboard.writeText(id);
        copyText.textContent = "Copied!";
        btnCopyId.style.color = "#10b981";
        setTimeout(() => {
          copyText.textContent = "Copy";
          btnCopyId.style.color = "";
        }, 1500);
      } catch (e) {
        copyText.textContent = "Copied!";
        setTimeout(() => (copyText.textContent = "Copy"), 1500);
      }
    }
  });
}

// Example Click Handlers
function loadExample(url) {
  inputEl.value = url;
  updateUI();
  hideStatus();
}

if (exampleSortlens) {
  exampleSortlens.addEventListener("click", () =>
    loadExample("https://chromewebstore.google.com/detail/sortlens-sort-instagram-t/lankjdlpcafockikacbnbdngppglhjim")
  );
}

if (exampleAsksteve) {
  exampleAsksteve.addEventListener("click", () =>
    loadExample("https://chromewebstore.google.com/detail/ask-steve-time-saving-ai/gldebcpkoojijledacjeboaehblhfbjg?hl=en-US&utm_source=ext_sidebar")
  );
}

if (exampleUblock) {
  exampleUblock.addEventListener("click", () =>
    loadExample("https://chromewebstore.google.com/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm")
  );
}

if (exampleDarkreader) {
  exampleDarkreader.addEventListener("click", () =>
    loadExample("https://chromewebstore.google.com/detail/dark-reader/eimadpbcbfnmbkopoojfekhnkhdbieeh")
  );
}

if (exampleReact) {
  exampleReact.addEventListener("click", () =>
    loadExample("https://chromewebstore.google.com/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi")
  );
}

// Status Box Helpers
function showStatus(htmlOrText, type = "error") {
  statusBox.className = `status-panel ${type}`;
  statusBox.style.display = "flex";
  statusIcon.innerHTML =
    type === "error"
      ? `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
      : `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
  statusMessage.innerHTML = htmlOrText;
}

function hideStatus() {
  statusBox.style.display = "none";
}

// Convert CRX binary array buffer to clean ZIP array buffer directly in browser
function extractZipFromCrx(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);

  // Check if it's already a standard ZIP file (starts with PK\x03\x04)
  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
    return bytes;
  }

  // Check CRX magic: "Cr24" (0x43, 0x72, 0x32, 0x34)
  const isCrx =
    bytes.length >= 16 &&
    bytes[0] === 0x43 &&
    bytes[1] === 0x72 &&
    bytes[2] === 0x32 &&
    bytes[3] === 0x34;

  if (!isCrx) {
    return bytes;
  }

  const view = new DataView(arrayBuffer);
  const version = view.getUint32(4, true);
  let zipOffset = -1;

  if (version === 3) {
    const headerLength = view.getUint32(8, true);
    const calculatedOffset = 12 + headerLength;
    if (
      calculatedOffset + 3 < bytes.length &&
      bytes[calculatedOffset] === 0x50 &&
      bytes[calculatedOffset + 1] === 0x4b &&
      bytes[calculatedOffset + 2] === 0x03 &&
      bytes[calculatedOffset + 3] === 0x04
    ) {
      zipOffset = calculatedOffset;
    }
  }

  // Fallback scan: Search for PK\x03\x04
  if (zipOffset === -1) {
    const limit = Math.min(bytes.length - 4, 32768);
    for (let i = 0; i < limit; i++) {
      if (bytes[i] === 0x50 && bytes[i + 1] === 0x4b && bytes[i + 2] === 0x03 && bytes[i + 3] === 0x04) {
        zipOffset = i;
        break;
      }
    }
  }

  if (zipOffset > 0) {
    return bytes.slice(zipOffset);
  }

  return bytes;
}

// Trigger safe browser download without 0-byte premature revocation
function triggerDownload(blob, filename) {
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  // Keep anchor in DOM briefly, do NOT revoke immediately (prevents Chrome 0-byte bug)
  setTimeout(() => {
    a.remove();
    setTimeout(() => {
      window.URL.revokeObjectURL(downloadUrl);
    }, 60000);
  }, 1000);

  return downloadUrl;
}

// Perform Download via Netlify Function + Client Unpack
async function handleDownload(format) {
  const { id, slug, isStoreUrl, rawText } = parseInput(inputEl.value);

  if (!id && !isStoreUrl) {
    showStatus(
      "Please enter a valid Chrome Web Store URL or 32-character Extension ID.<br><small style='opacity:0.8;'>Example: <code>https://chromewebstore.google.com/detail/ask-steve-time-saving-ai/gldebcpkoojijledacjeboaehblhfbjg</code></small>",
      "error"
    );
    inputEl.focus();
    return;
  }

  const activeBtn = format === "zip" ? btnDownloadZip : btnDownloadCrx;
  const originalTitle = activeBtn.querySelector(".btn-main-title").textContent;
  const originalSubtitle = activeBtn.querySelector(".btn-sub-title")?.textContent;
  const spinner = activeBtn.querySelector(".spinner");

  // Loading state
  btnDownloadZip.disabled = true;
  btnDownloadCrx.disabled = true;
  if (spinner) spinner.style.display = "block";
  activeBtn.querySelector(".btn-main-title").textContent =
    format === "zip" ? "Fetching & Unpacking ZIP..." : "Downloading CRX...";
  if (activeBtn.querySelector(".btn-sub-title")) {
    activeBtn.querySelector(".btn-sub-title").textContent = "Connecting to Google Store servers...";
  }

  const targetLabel = id ? `ID: <code>${id}</code>` : (slug || "Extension");
  showStatus(`Connecting to Google Chrome Web Store for ${targetLabel}...`, "success");

  try {
    const filename = slug || id || "extension";
    const apiUrl = id
      ? `/api/download?id=${encodeURIComponent(id)}&format=${format}&name=${encodeURIComponent(filename)}`
      : `/api/download?url=${encodeURIComponent(rawText)}&format=${format}&name=${encodeURIComponent(filename)}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      let errMsg = "Failed to download extension.";
      try {
        const errJson = await response.json();
        if (errJson && errJson.error) errMsg = errJson.error;
      } catch (e) {
        errMsg = `Server returned HTTP ${response.status} ${response.statusText}`;
      }
      throw new Error(errMsg);
    }

    const arrayBuffer = await response.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error("Received empty 0-byte response from server. Please verify the Extension ID.");
    }

    let finalData;
    let finalExt;
    let mimeType;

    if (format === "zip") {
      finalData = extractZipFromCrx(arrayBuffer);
      finalExt = "zip";
      mimeType = "application/zip";
    } else {
      finalData = new Uint8Array(arrayBuffer);
      finalExt = "crx";
      mimeType = "application/x-chrome-extension";
    }

    const finalBlob = new Blob([finalData], { type: mimeType });
    const fileSizeKB = (finalBlob.size / 1024).toFixed(1);
    const finalFilename = `${filename}.${finalExt}`;

    const downloadUrl = triggerDownload(finalBlob, finalFilename);

    showStatus(
      `🎉 <strong>${finalFilename}</strong> (${fileSizeKB} KB) downloaded successfully!<br>` +
      `<small style="opacity: 0.85;">Agar download automatically shuru nahi hua to <a href="${downloadUrl}" download="${finalFilename}" style="color: #93c5fd; text-decoration: underline;">yahan click karke direct save karein</a>.</small>`,
      "success"
    );
  } catch (err) {
    showStatus(err.message || "An unexpected error occurred.", "error");
  } finally {
    btnDownloadZip.disabled = false;
    btnDownloadCrx.disabled = false;
    if (spinner) spinner.style.display = "none";
    activeBtn.querySelector(".btn-main-title").textContent = originalTitle;
    if (activeBtn.querySelector(".btn-sub-title")) {
      activeBtn.querySelector(".btn-sub-title").textContent = originalSubtitle;
    }
  }
}

btnDownloadZip.addEventListener("click", () => handleDownload("zip"));
btnDownloadCrx.addEventListener("click", () => handleDownload("crx"));

// Force input to be completely BLANK on initial load, reload, and page restore
function forceBlankInput() {
  if (inputEl) {
    inputEl.value = "";
    updateUI();
  }
}

forceBlankInput();
window.addEventListener("DOMContentLoaded", forceBlankInput);
window.addEventListener("pageshow", forceBlankInput);
