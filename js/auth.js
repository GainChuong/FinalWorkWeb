const slides = [
  {
    image: "../images/slide1.png",
    title: "Give Clothes A Second Life",
    desc: "Donate, exchange and transform unused clothing into valuable fashion resources.",
  },
  {
    image: "../images/slide2.png",
    title: "Earn GreenCoin Rewards",
    desc: "Every sustainable action helps the planet and earns you GreenCoin points.",
  },
];

let currentSlide = 0;
const image = document.getElementById("sliderImage");
const title = document.getElementById("sliderTitle");
const desc = document.getElementById("sliderDesc");

function changeSlide() {
  if (!image || !title || !desc) return;
  currentSlide++;
  if (currentSlide >= slides.length) {
    currentSlide = 0;
  }

  image.style.opacity = 0;
  setTimeout(() => {
    image.src = slides[currentSlide].image;
    title.textContent = slides[currentSlide].title;
    desc.textContent = slides[currentSlide].desc;
    image.style.opacity = 1;
  }, 300);
}

if (image && title && desc) {
  setInterval(changeSlide, 5000);
}

// Form Handlers
document.addEventListener("DOMContentLoaded", () => {
  // Login Form Submission
  const loginForm = document.querySelector("form");
  if (loginForm && window.location.pathname.toLowerCase().includes("login.html")) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailInput = loginForm.querySelector('input[type="email"]');
      const passwordInput = loginForm.querySelector('input[type="password"]');
      
      if (emailInput && passwordInput) {
        window.loginUser(emailInput.value, passwordInput.value);
      }
    });
  }

  // Password Visibility Toggle
  const toggleBtn = document.querySelector(".toggle-password");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const targetId = toggleBtn.getAttribute("data-target");
      const targetInput = document.getElementById(targetId);
      if (targetInput) {
        if (targetInput.type === "password") {
          targetInput.type = "text";
          toggleBtn.classList.replace("fa-eye", "fa-eye-slash");
        } else {
          targetInput.type = "password";
          toggleBtn.classList.replace("fa-eye-slash", "fa-eye");
        }
      }
    });
  }

  // Mock Registration Submission
  if (window.location.pathname.toLowerCase().includes("register.html")) {
    const regForm = document.querySelector("form");
    if (regForm) {
      regForm.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Đăng ký thành công!\nBạn đã tạo tài khoản với vai trò Người Mua (Buyer).\nChuyển sang trang đăng nhập...");
        window.location.href = "login.html";
      });
    }
  }

  // Mock Forgot Password Submission
  if (window.location.pathname.toLowerCase().includes("forgot.html")) {
    const sendOtpBtn = document.getElementById("sendOtpBtn");
    const resetBtn = document.getElementById("resetBtn");

    if (sendOtpBtn) {
      sendOtpBtn.addEventListener("click", () => {
        const email = document.getElementById("email").value;
        if (!email) {
          alert("Vui lòng nhập Email!");
          return;
        }
        alert(`OTP đã được gửi đến: ${email}\nOTP Demo: 123456`);
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        const otp = document.getElementById("otp").value;
        const newPass = document.getElementById("newPassword").value;
        const confirmPass = document.getElementById("confirmNewPassword").value;

        if (!otp || !newPass || !confirmPass) {
          alert("Vui lòng điền đầy đủ thông tin!");
          return;
        }

        if (otp !== "123456") {
          alert("Mã OTP không đúng!");
          return;
        }

        if (newPass !== confirmPass) {
          alert("Mật khẩu xác nhận không khớp!");
          return;
        }

        alert("Khôi phục mật khẩu thành công!\nChuyển sang trang đăng nhập...");
        window.location.href = "login.html";
      });
    }
  }
});
