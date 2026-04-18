const videoGallery = document.getElementById("videoGallery");
const videoModal = document.getElementById("videoModal");
const modalVideo = document.getElementById("modalVideo");
const videoCloseBtn = document.getElementById("videoCloseBtn");

let videoFiles = [];
let currentVideoIndex = -1;

// ===== PAGINATION =====
let currentPage = parseInt(localStorage.getItem("videoGalleryPage")) || 1;
const videosPerPage = 12;

// ===== SAVE PAGE =====
function saveCurrentPage() {
    localStorage.setItem("videoGalleryPage", currentPage);
}

// chặn thao tác thừa
window.addEventListener("contextmenu", (e) => {
    if (
        e.target.tagName === "VIDEO" ||
        e.target.closest("#videoGallery") ||
        e.target.closest("#videoModal")
    ) {
        e.preventDefault();
    }
});

window.addEventListener("dragstart", (e) => {
    if (e.target.tagName === "VIDEO") {
        e.preventDefault();
    }
});

document.addEventListener("selectstart", (e) => {
    if (
        e.target.tagName === "VIDEO" ||
        e.target.closest("#videoGallery") ||
        e.target.closest("#videoModal")
    ) {
        e.preventDefault();
    }
});

// ===== NAV BUTTONS VIDEO MODAL =====
const prevBtn = document.createElement("button");
prevBtn.textContent = "‹";

const nextBtn = document.createElement("button");
nextBtn.textContent = "›";

[prevBtn, nextBtn].forEach((btn) => {
    btn.style.position = "absolute";
    btn.style.top = "50%";
    btn.style.transform = "translateY(-50%)";
    btn.style.zIndex = "9999";
    btn.style.width = "48px";
    btn.style.height = "48px";
    btn.style.border = "none";
    btn.style.borderRadius = "999px";
    btn.style.background = "rgba(0,0,0,0.6)";
    btn.style.color = "#fff";
    btn.style.fontSize = "28px";
    btn.style.cursor = "pointer";
    btn.style.userSelect = "none";
    btn.style.display = "none";
});

prevBtn.style.left = "16px";
nextBtn.style.right = "16px";

videoModal.appendChild(prevBtn);
videoModal.appendChild(nextBtn);

// ===== PAGINATION UI =====
const pagination = document.createElement("div");
pagination.style.display = "flex";
pagination.style.justifyContent = "center";
pagination.style.gap = "10px";
pagination.style.margin = "20px 0";
pagination.style.flexWrap = "wrap";

document.body.appendChild(pagination);

function stylePageBtn(btn, active) {
    btn.style.padding = "6px 12px";
    btn.style.border = "none";
    btn.style.borderRadius = "8px";
    btn.style.cursor = "pointer";
    btn.style.background = active ? "#333" : "#eee";
    btn.style.color = active ? "#fff" : "#000";
}

// ===== RENDER PAGE BUTTONS =====
function renderPagination() {
    const totalPages = Math.ceil(videoFiles.length / videosPerPage);
    pagination.innerHTML = "";

    if (totalPages <= 1) return;

    const maxVisible = 10;
    let startPage = Math.max(1, currentPage - 4);
    let endPage = startPage + maxVisible - 1;

    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // nút lùi
    if (currentPage > 1) {
        const prev = document.createElement("button");
        prev.textContent = "‹";
        stylePageBtn(prev, false);

        prev.addEventListener("click", () => {
            currentPage--;
            saveCurrentPage();
            renderVideos();
        });

        pagination.appendChild(prev);
    }

    // trang đầu
    if (startPage > 1) {
        const first = document.createElement("button");
        first.textContent = "1";
        stylePageBtn(first, currentPage === 1);

        first.addEventListener("click", () => {
            currentPage = 1;
            saveCurrentPage();
            renderVideos();
        });

        pagination.appendChild(first);

        const dots = document.createElement("span");
        dots.textContent = "...";
        dots.style.padding = "6px";
        pagination.appendChild(dots);
    }

    // các trang giữa
    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;

        stylePageBtn(btn, i === currentPage);

        btn.addEventListener("click", () => {
            currentPage = i;
            saveCurrentPage();
            renderVideos();
        });

        pagination.appendChild(btn);
    }

    // trang cuối
    if (endPage < totalPages) {
        const dots = document.createElement("span");
        dots.textContent = "...";
        dots.style.padding = "6px";
        pagination.appendChild(dots);

        const last = document.createElement("button");
        last.textContent = totalPages;
        stylePageBtn(last, currentPage === totalPages);

        last.addEventListener("click", () => {
            currentPage = totalPages;
            saveCurrentPage();
            renderVideos();
        });

        pagination.appendChild(last);
    }

    // nút tiến
    if (currentPage < totalPages) {
        const next = document.createElement("button");
        next.textContent = "›";
        stylePageBtn(next, false);

        next.addEventListener("click", () => {
            currentPage++;
            saveCurrentPage();
            renderVideos();
        });

        pagination.appendChild(next);
    }
}

// ===== OPEN VIDEO =====
function openVideoByIndex(index) {
    if (!videoFiles.length) return;

    if (index < 0) index = videoFiles.length - 1;
    if (index >= videoFiles.length) index = 0;

    currentVideoIndex = index;
    const file = videoFiles[currentVideoIndex];

    videoModal.style.display = "flex";
    modalVideo.pause();
    modalVideo.src = file.download_url;
    modalVideo.currentTime = 0;

    modalVideo.loop = true;
    modalVideo.controls = true;
    modalVideo.setAttribute(
        "controlsList",
        "nodownload noplaybackrate noremoteplayback nofullscreen"
    );
    modalVideo.disablePictureInPicture = true;

    modalVideo.load();
    modalVideo.play().catch(() => {});

    updateNavButtons();
}

// ===== NAV MODAL =====
function updateNavButtons() {
    prevBtn.style.display = videoFiles.length > 1 ? "block" : "none";
    nextBtn.style.display = videoFiles.length > 1 ? "block" : "none";
}

prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openVideoByIndex(currentVideoIndex - 1);
});

nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openVideoByIndex(currentVideoIndex + 1);
});

// ===== RENDER VIDEO =====
function renderVideos() {
    videoGallery.innerHTML = "";

    const totalPages = Math.ceil(videoFiles.length / videosPerPage);

    if (currentPage > totalPages) {
        currentPage = 1;
        saveCurrentPage();
    }

    const start = (currentPage - 1) * videosPerPage;
    const end = start + videosPerPage;

    const pageItems = videoFiles.slice(start, end);

    pageItems.forEach((file, index) => {
        const realIndex = start + index;

        const card = document.createElement("div");
        card.className = "card";

        const video = document.createElement("video");
        video.src = file.download_url;
        video.muted = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.controls = false;
        video.draggable = false;
        video.loop = true;

        video.style.width = "100%";
        video.style.height = "220px";
        video.style.objectFit = "cover";
        video.style.borderRadius = "12px";
        video.style.cursor = "pointer";

        video.addEventListener("click", () => {
            openVideoByIndex(realIndex);
        });

        card.appendChild(video);
        videoGallery.appendChild(card);
    });

    renderPagination();
}

// ===== LOAD VIDEO =====
async function loadVideos() {
    try {
        const response = await fetch(
            "https://api.github.com/repos/rayyamato005/my-gallery/contents/video",
            { cache: "no-store" }
        );

        const files = await response.json();

        videoFiles = files
            .filter(
                (f) =>
                    f.type === "file" &&
                    /\.(mp4|webm|ogg|mov|m4v)$/i.test(f.name)
            )
            .sort((a, b) => {
                return b.name.localeCompare(a.name);
            });

        renderVideos();
        updateNavButtons();

    } catch (error) {
        console.error(error);
        videoGallery.innerHTML = "<p>Lỗi tải video</p>";
    }
}

// ===== CLOSE MODAL =====
videoCloseBtn.addEventListener("click", () => {
    videoModal.style.display = "none";
    modalVideo.pause();
    modalVideo.src = "";
});

videoModal.addEventListener("click", (e) => {
    if (e.target === videoModal) {
        videoModal.style.display = "none";
        modalVideo.pause();
        modalVideo.src = "";
    }
});

// ===== INIT =====
loadVideos();