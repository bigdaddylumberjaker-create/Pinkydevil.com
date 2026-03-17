const bg = document.querySelector(".checkerBackground");

document.addEventListener("mousemove", (e) => {
  let x = (e.clientX / window.innerWidth - 0.5) * 20;
  let y = (e.clientY / window.innerHeight - 0.5) * 20;

  bg.style.transform = `rotateX(${10 - y}deg) rotateY(${x}deg)`;
});
