(() => {
  const lightbox = document.getElementById("artLightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const closeButton = document.getElementById("lightboxClose");

  // ONLY put extra slider art here.
  // Do not add featured/art1/art2/art3/art4/art5/art6 here.
  const SHOWCASE_ART = [
    {
      src: "../images/arts/extra1.jpg",
      alt: "Extra showcase artwork one",
      artist: "unknown artist 💗"
    },
    {
      src: "../images/arts/extra2.png",
      alt: "Extra showcase artwork two",
      artist: "unknown artist 💗"
    }
  ];

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

  function bindZoomableImages() {
    const zoomableImages = document.querySelectorAll(".artZoomable");
    zoomableImages.forEach((image) => {
      if (image.dataset.zoomBound === "true") return;
      image.dataset.zoomBound = "true";
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

  const track = document.getElementById("showcaseTrack");
  const dotsWrap = document.getElementById("showcaseDots");
  const showcaseSlider = document.getElementById("showcaseSlider");

  let slides = [];
  let dots = [];
  let currentSlide = 0;
  let sliderInterval = null;

  function buildShowcaseSlides() {
    if (!track || !dotsWrap) return;

    track.innerHTML = "";
    dotsWrap.innerHTML = "";

    SHOWCASE_ART.forEach((art, index) => {
      const slide = document.createElement("article");
      slide.className = "showcaseSlide" + (index === 0 ? " active" : "");
      slide.innerHTML = `
        <div class="showcaseImageWrap artCreditWrap" tabindex="0">
          <img src="${art.src}" alt="${art.alt}" class="showcaseImage artZoomable">
          <div class="artCreditLabel">art by: ${art.artist}</div>
        </div>
      `;
      track.appendChild(slide);

      const dot = document.createElement("button");
      dot.className = "showcaseDot" + (index === 0 ? " active" : "");
      dot.type = "button";
      dot.setAttribute("aria-label", "Show slide " + (index + 1));
      dotsWrap.appendChild(dot);
    });

    slides = Array.from(document.querySelectorAll(".showcaseSlide"));
    dots = Array.from(document.querySelectorAll(".showcaseDot"));

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        showSlide(index);
        startSlider();
      });
    });

    bindZoomableImages();
  }

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

  if (showcaseSlider) {
    showcaseSlider.addEventListener("mouseenter", stopSlider);
    showcaseSlider.addEventListener("mouseleave", startSlider);
  }

  buildShowcaseSlides();
  bindZoomableImages();
  showSlide(0);
  startSlider();
})();
