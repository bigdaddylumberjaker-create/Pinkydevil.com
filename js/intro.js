const { Engine, Render, Runner, Bodies, Composite, Body } = Matter;

const enterButton = document.getElementById("enterButton");

enterButton.addEventListener("click", () => {

  document.getElementById("logoIntro").style.opacity = "0";
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

  const ground = Bodies.rectangle(
    window.innerWidth / 2,
    window.innerHeight + 40,
    window.innerWidth,
    80,
    { isStatic: true }
  );

  Composite.add(world, ground);

  let logos = [];

  for (let i = 0; i < 50; i++) {
    let logo = Bodies.rectangle(
      Math.random() * window.innerWidth,
      -200,
      60,
      60,
      {
        render: {
          sprite: {
            texture: "images/logo.png",
            xScale: 0.3,
            yScale: 0.3
          }
        }
      }
    );

    logos.push(logo);
    Composite.add(world, logo);
  }

  Render.run(render);
  Runner.run(Runner.create(), engine);

  setTimeout(() => {
    logos.forEach((logo, i) => {
      Body.applyForce(logo, logo.position, {
        x: i % 2 === 0 ? -0.05 : 0.05,
        y: -0.02
      });
    });
  }, 4000);

  setTimeout(() => {
    document.getElementById("loader").style.display = "none";
    document.querySelector(".hero").classList.add("visible");
  }, 5500);
});
