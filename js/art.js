(() => {
  const lightbox = document.getElementById("artLightbox");
  const lightboxImg = document.getElementById("lightboxImage");
  const closeBtn = document.querySelector(".lightboxClose");

  const images = document.querySelectorAll(".artImage");

  images.forEach(img => {
    img.addEventListener("click", () => {
      lightbox.style.display = "flex";
      lightboxImg.src = img.src;
    });
  });

  closeBtn.addEventListener("click", () => {
    lightbox.style.display = "none";
  });

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      lightbox.style.display = "none";
    }
  });
})();
