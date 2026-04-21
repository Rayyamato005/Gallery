const params = new URLSearchParams(window.location.search);

const img = params.get("img");
const video = params.get("video");

const viewImg = document.getElementById("viewImg");
const viewVideo = document.getElementById("viewVideo");
const related = document.getElementById("related");

// ===== CHẶN TOÀN CỤC =====
window.addEventListener("contextmenu", e => e.preventDefault());
window.addEventListener("dragstart", e => e.preventDefault());
document.addEventListener("selectstart", e => e.preventDefault());

// ===== LOAD RANDOM =====
async function loadRelated(type) {
    try {
        const url = type === "img"
            ? "https://api.github.com/repos/rayyamato005/my-gallery/contents/image"
            : "https://api.github.com/repos/rayyamato005/my-gallery/contents/video";

        const res = await fetch(url, { cache: "no-store" });
        const files = await res.json();

        let list = files.filter(f =>
            f.type === "file" &&
            (type === "img"
                ? /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(f.name)
                : /\.(mp4|webm|ogg|mov|m4v)$/i.test(f.name))
        );

        // random 10
        list = list.sort(() => Math.random() - 0.5).slice(0, 10);

        related.innerHTML = "";

        list.forEach(file => {

            const wrapper = document.createElement("div");
            wrapper.className = "item";

            if (type === "img") {

                const el = document.createElement("img");
                el.src = file.download_url;
                el.draggable = false;

                // chặn thao tác
                el.addEventListener("contextmenu", e => e.preventDefault());
                el.addEventListener("dragstart", e => e.preventDefault());

                wrapper.onclick = () => {
                    window.location.href =
                        "view.html?img=" + encodeURIComponent(file.download_url);
                };

                wrapper.appendChild(el);

            } else {

                const el = document.createElement("video");
                el.src = file.download_url;

                // tắt toàn bộ tương tác
                el.controls = false;
                el.muted = true;
                el.loop = true;
                el.preload = "metadata";
                el.playsInline = true;
                el.disablePictureInPicture = true;

                el.style.pointerEvents = "none";

                // overlay click
                const overlay = document.createElement("div");
                overlay.style.position = "absolute";
                overlay.style.inset = "0";
                overlay.style.zIndex = "2";

                overlay.onclick = () => {
                    window.location.href =
                        "view.html?video=" + encodeURIComponent(file.download_url);
                };

                wrapper.appendChild(el);
                wrapper.appendChild(overlay);
            }

            related.appendChild(wrapper);
        });

    } catch (e) {
        console.error("Lỗi load related:", e);
    }
}

// ===== HIỂN THỊ =====
if (img) {
    viewImg.src = decodeURIComponent(img);
    viewImg.style.display = "block";
    viewVideo.style.display = "none";

    loadRelated("img");
}
else if (video) {
    viewVideo.src = decodeURIComponent(video);

    viewVideo.style.display = "block";
    viewImg.style.display = "none";

    viewVideo.play().catch(() => { });
    viewVideo.disablePictureInPicture = true;

    loadRelated("video");
}
else {
    // ❌ KHÔNG có dữ liệu → quay về trang chủ
    window.location.href = "index.html";
}
