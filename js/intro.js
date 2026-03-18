window.addEventListener("DOMContentLoaded", () => {
  const enterButton = document.getElementById("enterButton");
  const logo = document.getElementById("logoIntro");
  const loader = document.getElementById("loader");
  const hero = document.querySelector(".hero");
  const canvas = document.getElementById("physicsCanvas");

  if (!enterButton || !logo || !loader || !hero || !canvas) {
    console.error("Intro setup is missing required elements.");
    return;
  }

  let introStarted = false;

  enterButton.addEventListener("click", () => {
    if (introStarted) return;
    introStarted = true;

    enterButton.style.pointerEvents = "none";

    logo.style.transition = "opacity 0.8s ease, transform 0.8s ease";
    enterButton.style.transition = "opacity 0.6s ease, transform 0.6s ease";

    logo.style.opacity = "0";
    logo.style.transform = "translateY(-20px) scale(0.96)";

    enterButton.style.opacity = "0";
    enterButton.style.transform = "translateY(10px) scale(0.96)";

    if (typeof Matter === "undefined") {
      console.error("Matter.js did not load.");
      revealSite();
      return;
    }

    const { Engine, Render, Runner, Bodies, Composite, Body } = Matter;

    const engine = Engine.create();
    const world = engine.world;

    engine.gravity.y = 1.05;

    const render = Render.create({
      canvas: canvas,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: "transparent",
        pixelRatio: window.devicePixelRatio || 1
      }
    });

    const floor = Bodies.rectangle(
      window.innerWidth / 2,
      window.innerHeight + 40,
      window.innerWidth + 200,
      80,
      {
        isStatic: true,
        render: { visible: false }
      }
    );

    const leftWall = Bodies.rectangle(
      -40,
      window.innerHeight / 2,
      80,
      window.innerHeight * 2,
      {
        isStatic: true,
        render: { visible: false }
      }
    );

    const rightWall = Bodies.rectangle(
      window.innerWidth + 40,
      window.innerHeight / 2,
      80,
      window.innerHeight * 2,
      {
        isStatic: true,
        render: { visible: false }
      }
    );

    Composite.add(world, [floor, leftWall, rightWall]);

    const logos = [];
    const totalLogos = 70;

    for (let i = 0; i < totalLogos; i++) {
      const size = 60 + Math.random() * 16;

      const logoBody = Bodies.rectangle(
        Math.random() * window.innerWidth,
        -200 - Math.random() * 700,
        size,
        size,
        {
          restitution: 0.45,
          friction: 0.08,
          frictionAir: 0.01,
          density: 0.0012,
          angle: (Math.random() - 0.5) * 0.8,
          render: {
            sprite: {
              texture: "images/logo.png",
              xScale: size / 200,
              yScale: size / 200
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

    const handleResize = () => {
      render.canvas.width = window.innerWidth;
      render.canvas.height = window.innerHeight;
      render.options.width = window.innerWidth;
      render.options.height = window.innerHeight;

      Matter.Body.setPosition(floor, {
        x: window.innerWidth / 2,
        y: window.innerHeight + 40
      });

      Matter.Body.setPosition(leftWall, {
        x: -40,
        y: window.innerHeight / 2
      });

      Matter.Body.setPosition(rightWall, {
        x: window.innerWidth + 40,
        y: window.innerHeight / 2
      });
    };

    window.addEventListener("resize", handleResize);

    setTimeout(() => {
      logos.forEach((item, index) => {
        const horizontalForce = index % 2 === 0 ? -0.05 : 0.05;

        Body.applyForce(item, item.position, {
          x: horizontalForce,
          y: -0.02
        });
      });
    }, 3400);

    setTimeout(() => {
      loader.style.opacity = "0";

      setTimeout(() => {
        loader.style.display = "none";
        hero.classList.add("visible");

        window.removeEventListener("resize", handleResize);

        Render.stop(render);
        Runner.stop(runner);

        if (render.canvas) {
          const ctx = render.canvas.getContext("2d");
          ctx.clearRect(0, 0, render.canvas.width, render.canvas.height);
        }

        if (render.textures) {
          render.textures = {};
        }
      }, 1000);
    }, 5000);
  });

  function revealSite() {
    loader.style.opacity = "0";

    setTimeout(() => {
      loader.style.display = "none";
      hero.classList.add("visible");
    }, 1000);
  }
});
