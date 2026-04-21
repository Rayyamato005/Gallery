const videoGallery = document.getElementById("videoGallery");

let videoFiles = [];

// ===== PAGINATION =====
let currentPage = parseInt(localStorage.getItem("videoGalleryPage")) || 1;
const videosPerPage = 12;

// ===== SAVE PAGE =====
function saveCurrentPage() {
    localStorage.setItem("videoGalleryPage", currentPage);
}

// ===== CHẶN THAO TÁC =====
window.addEventListener("contextmenu", (e) => {
    if (
        e.target.tagName === "VIDEO" ||
        e.target.closest("#videoGallery")
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
        e.target.closest("#videoGallery")
    ) {
        e.preventDefault();
    }
});

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

// ===== RENDER PAGINATION =====
function renderPagination() {
    const totalPages = Math.ceil(videoFiles.length / videosPerPage);
    pagination.innerHTML = "";

    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
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
}

// ===== RENDER VIDEO =====
function renderVideos() {
    videoGallery.innerHTML = "";

    const start = (currentPage - 1) * videosPerPage;
    const end = start + videosPerPage;

    const pageItems = videoFiles.slice(start, end);

    pageItems.forEach((file) => {

        const card = document.createElement("div");

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

        // ✅ CLICK → VIEW PAGE
        video.addEventListener("click", () => {
            window.location.href = "view.html?video=" + encodeURIComponent(file.download_url);
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
            .sort((a, b) => b.name.localeCompare(a.name));

        renderVideos();

    } catch (error) {
        console.error(error);
        videoGallery.innerHTML = "<p>Lỗi tải video</p>";
    }
}

// ===== INIT =====
loadVideos();
