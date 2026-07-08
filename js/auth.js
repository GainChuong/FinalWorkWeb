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

});
