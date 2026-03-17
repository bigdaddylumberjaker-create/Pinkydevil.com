const { Engine, Render, Runner, Bodies, Composite, Body } = Matter;

const enterButton = document.getElementById("enterButton");

enterButton.addEventListener("click", () => {

  const logo = document.getElementById("logoIntro");

  logo.style.opacity = "0";
  enterButton.style.opacity = "0";

  const engine = Engine.create();
  const world = engine.world;

  const render = Render.create({
    canvas: document.getElementById("physicsCanvas"),
    engine: engine,
    options: {
      width: window.innerWidth,
      height: window.innerHeight,
      wireframes: false,
      background: "transparent"
    }
  });

  /* GROUND */
  const ground = Bodies.rectangle(
    window.innerWidth / 2,
    window.innerHeight + 40,
    window.innerWidth,
    80,
    { isStatic: true }
  );

  Composite.add(world, ground);

  /* FALLING LOGOS */
  let logos = [];

  for (let i = 0; i < 70; i++) {
    let logoBody = Bodies.rectangle(
      Math.random() * window.innerWidth,
      -200 - Math.random() * 400,
      60,
      60,
      {
        restitution: 0.4,
        render: {
          sprite: {
            texture: "images/logo.png",
            xScale: 0.3,
            yScale: 0.3
          }
        }
      }
    );

    logos.push(logoBody);
    Composite.add(world, logoBody);
  }

  Render.run(render);
  Runner.run(Runner.create(), engine);

  /* SPREAD EFFECT */
  setTimeout(() => {
    logos.forEach((l, i) => {
      Body.applyForce(l, l.position, {
        x: i % 2 === 0 ? -0.05 : 0.05,
        y: -0.02
      });
    });
  }, 3500);

  /* FADE OUT LOADER */
  setTimeout(() => {
    document.getElementById("loader").style.opacity = "0";

    setTimeout(() => {
      document.getElementById("loader").style.display = "none";
      document.querySelector(".hero").classList.add("visible");
    }, 1000);

  }, 5000);

});
