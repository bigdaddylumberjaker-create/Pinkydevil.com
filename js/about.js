window.addEventListener("load", () => {
  document.querySelector(".about-container").style.opacity = "1";
});
window.addEventListener("load", () => {
  const reveals = document.querySelectorAll(".reveal");

  reveals.forEach((item, index) => {
    setTimeout(() => {
      item.classList.add("show");
    }, 120 + index * 120);
  });
});
