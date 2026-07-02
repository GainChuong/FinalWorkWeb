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

  // Registration Submission
  if (window.location.pathname.toLowerCase().includes("register.html")) {
    const regForm = document.querySelector("form");
    if (regForm) {
      regForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("regUsername").value.trim();
        const email = document.getElementById("regEmail").value.trim();
        const password = document.getElementById("regPassword").value;
        const confirm = document.getElementById("regConfirmPassword").value;
        const phone = document.getElementById("regPhone").value.trim();

        if (!username || !email || !password) {
          alert("Vui lòng điền đầy đủ thông tin!");
          return;
        }
        if (password !== confirm) {
          alert("Mật khẩu xác nhận không khớp!");
          return;
        }
        if (password.length < 6) {
          alert("Mật khẩu phải có ít nhất 6 ký tự!");
          return;
        }

        var users = RefashionAuth._getUsers();
        for (var i = 0; i < users.length; i++) {
          if (users[i].email.toLowerCase() === email.toLowerCase()) {
            alert("Email này đã được đăng ký!");
            return;
          }
        }
        users.push({
          username: username,
          email: email,
          password: password,
          phone: phone,
          joinDate: new Date().toLocaleDateString('vi-VN'),
          greenCoin: 100
        });
        RefashionAuth._saveUsers(users);
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
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
        const email = document.getElementById("email").value;
        const otp = document.getElementById("otp").value;
        const newPass = document.getElementById("newPassword").value;
        const confirmPass = document.getElementById("confirmNewPassword").value;

        if (!email || !otp || !newPass || !confirmPass) {
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

        var users = RefashionAuth._getUsers();
        var found = false;
        for (var i = 0; i < users.length; i++) {
          if (users[i].email.toLowerCase() === email.toLowerCase()) {
            users[i].password = newPass;
            found = true;
            break;
          }
        }
        if (!found) {
          alert("Email không tồn tại trong hệ thống!");
          return;
        }
        RefashionAuth._saveUsers(users);
        alert("Khôi phục mật khẩu thành công!\nChuyển sang trang đăng nhập...");
        window.location.href = "login.html";
      });
    }
  }
});
