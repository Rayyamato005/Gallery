const videoUploadBtn = document.getElementById("videoUploadBtn");
const videoStatus = document.getElementById("videoStatus");

const WORKER_API = "https://withered-snow-a90b.tmprpg.workers.dev/";

// ❌ bỏ toàn bộ loadHelperScripts + g1 + cfg + token cũ

videoUploadBtn.addEventListener("click", async () => {
    try {

        const files = window.selectedFiles || [];

        if (files.length === 0) {
            videoStatus.style.color = "#ff4d4f";
            videoStatus.textContent = "Vui lòng chọn video";
            return;
        }

        if (files.length > 10) {
            videoStatus.style.color = "#ff4d4f";
            videoStatus.textContent =
                "Chỉ được chọn tối đa 10 video.";
            return;
        }

        videoStatus.style.color = "#ffffff";
        videoStatus.textContent =
            `Đang tải ${files.length} video lên...`;

        let successCount = 0;
        let failCount = 0;

        for (const file of files) {
            try {
                const base64Content = await new Promise((resolve, reject) => {
                    const reader = new FileReader();

                    reader.onload = function () {
                        resolve(reader.result.split(",")[1]);
                    };

                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

                const filePath =
                    `video/${Date.now()}_` +
                    `${Math.random().toString(36).slice(2)}_${file.name}`;

                // 🔥 gọi Worker thay vì GitHub trực tiếp
                const response = await fetch(WORKER_API, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: filePath,
                        content: base64Content
                    })
                });

                const result = await response.json();

                console.log("UPLOAD RESULT:", result);
                console.log("worker status:", response.status);

                if (response.ok) {
                    successCount++;
                } else {
                    failCount++;
                }

            } catch (error) {
                console.error(error);
                failCount++;
            }
        }

        if (successCount > 0) {
            videoStatus.style.color = "#4ade80";
            videoStatus.textContent =
                `Tải thành công ${successCount} video` +
                (failCount > 0 ? `, lỗi ${failCount} video.` : "!");

            window.selectedFiles.length = 0;

            if (window.syncInputFiles) {
                window.syncInputFiles();
            }

            if (window.renderFileList) {
                window.renderFileList();
            }
        } else {
            videoStatus.style.color = "#ff4d4f";
            videoStatus.textContent =
                "Không thể tải video lên. Vui lòng thử lại.";
        }

    } catch (error) {
        console.error(error);
        videoStatus.style.color = "#ff4d4f";
        videoStatus.textContent =
            "Không thể khởi tạo hệ thống lúc này.";
    }
});