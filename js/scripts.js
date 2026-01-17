// Navbar toggle
const hamburger = document.querySelector(".hamburger");
const navBar = document.querySelector(".nav-bar");

function toggleMenu() {
  if (!navBar) return;
  navBar.classList.toggle("active");
}

if (hamburger && navBar) {
  hamburger.addEventListener("click", toggleMenu);

  // keyboard support (Enter / Space)
  hamburger.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleMenu();
    }
  });

  // close menu when clicking a nav link (mobile)
  document.querySelectorAll(".nav-bar a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 900) navBar.classList.remove("active");
    });
  });
}

// Smooth scroll (only if exists)
const contactLink = document.querySelector(".contact-link");
const contactSection = document.getElementById("contact");
if (contactLink && contactSection) {
  contactLink.addEventListener("click", (e) => {
    e.preventDefault();
    contactSection.scrollIntoView({ behavior: "smooth" });
    if (window.innerWidth <= 900 && navBar) navBar.classList.remove("active");
  });
}

// Carousel
const images = document.querySelectorAll(".carousel img");
let currentIndex = 0;
let carouselTimer = null;

function setActive(index) {
  images.forEach((img) => img.classList.remove("active"));
  images[index].classList.add("active");
}

function showNextImage() {
  if (images.length <= 1) return;
  currentIndex = (currentIndex + 1) % images.length;
  setActive(currentIndex);
}

function showPrevImage() {
  if (images.length <= 1) return;
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  setActive(currentIndex);
}

function startCarousel() {
  if (images.length <= 1) return;
  stopCarousel();
  carouselTimer = setInterval(showNextImage, 3500);
}

function stopCarousel() {
  if (carouselTimer) clearInterval(carouselTimer);
  carouselTimer = null;
}

if (images.length > 0) {
  // Ensure something is active
  setActive(currentIndex);
  startCarousel();

  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      showPrevImage();
      startCarousel(); // reset timer on manual click
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      showNextImage();
      startCarousel(); // reset timer on manual click
    });
  }

  // pause on hover (nice touch)
  const carousel = document.querySelector(".carousel");
  if (carousel) {
    carousel.addEventListener("mouseenter", stopCarousel);
    carousel.addEventListener("mouseleave", startCarousel);
  }
}
