(() => {
  const images = document.querySelectorAll(".zoomableArt");

  images.forEach(img => {
    img.addEventListener("click", () => {
      const viewer = document.createElement("div");
      viewer.style = `
        position:fixed;
        inset:0;
        background:rgba(0,0,0,0.85);
        display:flex;
        align-items:center;
        justify-content:center;
        z-index:9999;
      `;

      const image = document.createElement("img");
      image.src = img.src;
      image.style = "max-width:90%; max-height:90%; border-radius:18px;";

      viewer.appendChild(image);

      viewer.onclick = () => viewer.remove();

      document.body.appendChild(viewer);
    });
  });
})();
