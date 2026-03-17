window.addEventListener("DOMContentLoaded", () => {
  const enterButton = document.getElementById("enterButton");
  const logo = document.getElementById("logoIntro");
  const loader = document.getElementById("loader");
  const hero = document.querySelector(".hero");
  const canvas = document.getElementById("physicsCanvas");

  if (!enterButton) {
    console.error("enterButton not found");
    return;
  }

  if (!logo) {
    console.error("logoIntro not found");
    return;
  }

  if (!loader) {
    console.error("loader not found");
    return;
  }

  if (!canvas) {
    console.error("physicsCanvas not found");
    return;
  }

  enterButton.addEventListener("click", () => {
    console.log("Enter button clicked");

    logo.style.opacity = "0";
    enterButton.style.opacity = "0";
    enterButton.style.pointerEvents = "none";

    if (typeof Matter === "undefined") {
      console.error("Matter.js did not load");
      setTimeout(() => {
        loader.style.opacity = "0";
        setTimeout(() => {
          loader.style.display = "none";
          if (hero) hero.classList.add("visible");
        }, 1000);
      }, 800);
      return;
    }

    const { Engine, Render, Runner, Bodies, Composite, Body } = Matter;

    const engine = Engine.create();
    const world = engine.world;

    const render = Render.create({
      canvas: canvas,
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

    const logos = [];

    for (let i = 0; i < 70; i++) {
      const logoBody = Bodies.rectangle(
        Math.random() * window.innerWidth,
        -200 - Math.random() * 400,
        60,
        60,
        {
          restitution: 0.4,
          friction: 0.1,
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
    const runner = Runner.create();
    Runner.run(runner, engine);

    setTimeout(() => {
      logos.forEach((item, i) => {
        Body.applyForce(item, item.position, {
          x: i % 2 === 0 ? -0.05 : 0.05,
          y: -0.02
        });
      });
    }, 3500);

    setTimeout(() => {
      loader.style.opacity = "0";

      setTimeout(() => {
        loader.style.display = "none";
        if (hero) hero.classList.add("visible");
      }, 1000);
    }, 5000);
  });
});
