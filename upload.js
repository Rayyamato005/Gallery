const imageUploadBtnEl = document.getElementById("uploadBtn");
const statusTextEl = document.getElementById("status");

const WORKER_API = "https://withered-snow-a90b.tmprpg.workers.dev/";


imageUploadBtnEl.addEventListener("click", async () => {
    try {

        const files = window.selectedFiles || [];

        if (files.length === 0) {
            statusTextEl.style.color = "#ff4d4f";
            statusTextEl.textContent = "Vui lòng chọn ảnh.";
            return;
        }

        if (files.length > 20) {
            statusTextEl.style.color = "#ff4d4f";
            statusTextEl.textContent = "Chỉ được chọn tối đa 20 ảnh.";
            return;
        }

        statusTextEl.style.color = "#ffffff";
        statusTextEl.textContent = `Đang tải ${files.length} ảnh lên...`;

        let successCount = 0;
        let failCount = 0;

        for (const file of files) {
            try {
                const base64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();

                    reader.onload = function () {
                        resolve(reader.result.split(",")[1]);
                    };

                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

                const fileName =
                    `image/${Date.now()}_` +
                    `${Math.random().toString(36).slice(2)}_${file.name}`;

                // 🔥 gọi Worker
                const response = await fetch(WORKER_API, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: fileName,
                        content: base64
                    })
                });

                const result = await response.json();

                console.log("UPLOAD RESULT:", result);

                console.log("worker status:", response.status);
                console.log("worker result:", result);

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
            statusTextEl.style.color = "#4ade80";
            statusTextEl.textContent =
                `Tải thành công ${successCount} ảnh` +
                (failCount > 0 ? `, lỗi ${failCount} ảnh.` : "!");

            window.selectedFiles.length = 0;

            if (window.syncInputFiles) {
                window.syncInputFiles();
            }

            if (window.renderFileList) {
                window.renderFileList();
            }
        } else {
            statusTextEl.style.color = "#ff4d4f";
            statusTextEl.textContent =
                "Không thể tải ảnh lên. Vui lòng thử lại.";
        }

    } catch (error) {
        console.error(error);
        statusTextEl.style.color = "#ff4d4f";
        statusTextEl.textContent =
            "Không thể khởi tạo hệ thống lúc này.";
    }
});