const gallery = document.getElementById("gallery");
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImg");
const closeBtn = document.getElementById("closeBtn");

const IMAGE_API = "https://api.github.com/repos/rayyamato005/my-gallery/contents/image";

// ===== STATE =====
let images = [];
let currentPage = parseInt(localStorage.getItem("galleryPage")) || 1;
let currentIndex = -1;

// 👉 1 hàng = 5 ảnh, 4 hàng = 20 ảnh / trang
const perPage = 20;

// ===== SAVE PAGE =====
function saveCurrentPage() {
    localStorage.setItem("galleryPage", currentPage);
}

// chặn chuột phải
window.addEventListener("contextmenu", (e) => {
    if (
        e.target.tagName === "IMG" ||
        e.target.closest("#gallery") ||
        e.target.closest("#imageModal")
    ) {
        e.preventDefault();
    }
});

// chặn kéo ảnh
window.addEventListener("dragstart", (e) => {
    if (e.target.tagName === "IMG") {
        e.preventDefault();
    }
});

// chặn bôi chọn
document.addEventListener("selectstart", (e) => {
    if (
        e.target.tagName === "IMG" ||
        e.target.closest("#gallery") ||
        e.target.closest("#imageModal")
    ) {
        e.preventDefault();
    }
});

// ===== NAV BUTTONS (MODAL) =====
const prevBtn = document.createElement("button");
const nextBtn = document.createElement("button");

prevBtn.textContent = "‹";
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

modal.appendChild(prevBtn);
modal.appendChild(nextBtn);

// ===== UPDATE NAV =====
function updateNavButtons() {
    const show = images.length > 1;
    prevBtn.style.display = show ? "block" : "none";
    nextBtn.style.display = show ? "block" : "none";
}

// ===== OPEN IMAGE =====
function openImage(index) {
    if (index < 0) index = images.length - 1;
    if (index >= images.length) index = 0;

    currentIndex = index;

    modal.style.display = "flex";
    modalImg.src = images[currentIndex].download_url;

    updateNavButtons();
}

// ===== CLICK NAV =====
prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openImage(currentIndex - 1);
});

nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openImage(currentIndex + 1);
});

// ===== PAGINATION UI =====
const pagination = document.createElement("div");
pagination.style.display = "flex";
pagination.style.justifyContent = "center";
pagination.style.gap = "8px";
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

function renderPagination() {
    const totalPages = Math.ceil(images.length / perPage);
    pagination.innerHTML = "";

    if (totalPages <= 1) return;

    const maxVisible = 10;
    let startPage = Math.max(1, currentPage - 4);
    let endPage = startPage + maxVisible - 1;

    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // nút quay lại
    if (currentPage > 1) {
        const prev = document.createElement("button");
        prev.textContent = "‹";
        stylePageBtn(prev, false);

        prev.addEventListener("click", () => {
            currentPage--;
            saveCurrentPage();
            renderGallery();
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
            renderGallery();
        });

        pagination.appendChild(first);

        const dots = document.createElement("span");
        dots.textContent = "...";
        dots.style.padding = "6px";
        pagination.appendChild(dots);
    }

    // các trang hiển thị
    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;

        stylePageBtn(btn, i === currentPage);

        btn.addEventListener("click", () => {
            currentPage = i;
            saveCurrentPage();
            renderGallery();
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
            renderGallery();
        });

        pagination.appendChild(last);
    }

    // nút tiếp
    if (currentPage < totalPages) {
        const next = document.createElement("button");
        next.textContent = "›";
        stylePageBtn(next, false);

        next.addEventListener("click", () => {
            currentPage++;
            saveCurrentPage();
            renderGallery();
        });

        pagination.appendChild(next);
    }
}

// ===== RENDER GALLERY =====
function renderGallery() {
    gallery.innerHTML = "";

    const totalPages = Math.ceil(images.length / perPage);

    if (currentPage > totalPages) {
        currentPage = 1;
        saveCurrentPage();
    }

    const start = (currentPage - 1) * perPage;
    const end = start + perPage;

    const pageItems = images.slice(start, end);

    pageItems.forEach((file, idx) => {
        const realIndex = start + idx;

        const img = document.createElement("img");
        img.src = file.download_url;
        img.alt = file.name;
        img.loading = "lazy";
        img.draggable = false;

        img.addEventListener("click", () => {
            openImage(realIndex);
        });

        gallery.appendChild(img);
    });

    renderPagination();
}

// ===== LOAD IMAGES =====
async function loadImages() {
    try {
        const response = await fetch(IMAGE_API, { cache: "no-store" });

        const files = await response.json();

        images = files
            .filter((file) =>
                file.type === "file" &&
                /\.(jpg|jpeg|png|gif|webp|bmp|svg|avif)$/i.test(file.name)
            )
            .sort((a, b) => {
                return b.name.localeCompare(a.name);
            });

        renderGallery();

    } catch (error) {
        console.error("Lỗi tải ảnh:", error);
        gallery.innerHTML = "<p>Không tải được ảnh.</p>";
    }
}

// ===== CLOSE MODAL =====
closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
    modalImg.src = "";
});

modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
        modalImg.src = "";
    }
});

modalImg.draggable = false;

loadImages();