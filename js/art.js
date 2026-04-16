(() => {
  const lightbox = document.getElementById("artLightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const closeButton = document.getElementById("lightboxClose");
  const zoomableImages = document.querySelectorAll(".artZoomable");

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImage) return;
    lightboxImage.src = src;
    lightboxImage.alt = alt || "Expanded artwork preview";
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox || !lightboxImage) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.src = "";
    lightboxImage.alt = "Expanded artwork preview";
    document.body.style.overflow = "";
  }

  if (zoomableImages.length) {
    zoomableImages.forEach((image) => {
      image.addEventListener("click", () => {
        openLightbox(image.src, image.alt);
      });
    });
  }

  if (closeButton) {
    closeButton.addEventListener("click", closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });
  }

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox && lightbox.classList.contains("open")) {
      closeLightbox();
    }
  });

  const slides = document.querySelectorAll(".showcaseSlide");
  const dots = document.querySelectorAll(".showcaseDot");
  const showcaseSlider = document.getElementById("showcaseSlider");

  let currentSlide = 0;
  let sliderInterval = null;

  function showSlide(index) {
    if (!slides.length) return;

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === currentSlide);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === currentSlide);
    });
  }

  function stopSlider() {
    if (sliderInterval) {
      clearInterval(sliderInterval);
      sliderInterval = null;
    }
  }

  function startSlider() {
    if (!slides.length) return;
    stopSlider();
    sliderInterval = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 4200);
  }

  if (dots.length) {
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        showSlide(index);
        startSlider();
      });
    });
  }

  if (showcaseSlider) {
    showcaseSlider.addEventListener("mouseenter", stopSlider);
    showcaseSlider.addEventListener("mouseleave", startSlider);
  }

  if (slides.length) {
    showSlide(0);
    startSlider();
  }
})();
