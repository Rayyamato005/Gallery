const gallery = document.getElementById("gallery");

const IMAGE_API = "https://api.github.com/repos/rayyamato005/my-gallery/contents/image";

// ===== STATE =====
let images = [];
let currentPage = parseInt(localStorage.getItem("galleryPage")) || 1;

// 👉 1 hàng = 5 ảnh, 4 hàng = 20 ảnh / trang
const perPage = 20;

// ===== SAVE PAGE =====
function saveCurrentPage() {
    localStorage.setItem("galleryPage", currentPage);
}

// ===== CHẶN COPY ẢNH =====
window.addEventListener("contextmenu", (e) => {
    if (
        e.target.tagName === "IMG" ||
        e.target.closest("#gallery")
    ) {
        e.preventDefault();
    }
});

window.addEventListener("dragstart", (e) => {
    if (e.target.tagName === "IMG") {
        e.preventDefault();
    }
});

document.addEventListener("selectstart", (e) => {
    if (
        e.target.tagName === "IMG" ||
        e.target.closest("#gallery")
    ) {
        e.preventDefault();
    }
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

    pageItems.forEach((file) => {

        const img = document.createElement("img");
        img.src = file.download_url;
        img.alt = file.name;
        img.loading = "lazy";
        img.draggable = false;

        // 👉 CLICK → CHUYỂN SANG VIEW
        img.addEventListener("click", () => {
            saveCurrentPage();

            const url = encodeURIComponent(file.download_url);
            window.location.href = `view.html?img=${url}`;
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

loadImages();
