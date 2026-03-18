window.addEventListener("load", () => {
  const reveals = document.querySelectorAll(".reveal");

  reveals.forEach((item, index) => {
    setTimeout(() => {
      item.classList.add("show");
    }, 120 + index * 120);
  });
});
