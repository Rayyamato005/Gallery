async function login() {
    const user = document.getElementById("user").value;
    const password = document.getElementById("password").value;
    const msg = document.getElementById("msg");

    msg.style.color = "#aaa";
    msg.innerText = "Đang đăng nhập...";

    try {
        const res = await fetch("https://auth-worker.tmprpg.workers.dev/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ user, password })
        });

        const data = await res.json();

        if (data.ok) {
            msg.style.color = "#4ade80";
            msg.innerText = "Đăng nhập thành công ✨";

            localStorage.setItem("token", data.token);

            setTimeout(() => {
                window.location.href = "https://gallery-x.pages.dev/";
            }, 800);

        } else {
            msg.style.color = "#f87171";
            msg.innerText = data.error || "Sai tài khoản hoặc mật khẩu";
        }

    } catch (e) {
        msg.style.color = "#f87171";
        msg.innerText = "Lỗi kết nối server";
    }
}