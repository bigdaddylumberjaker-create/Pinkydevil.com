(() => {
  const loader = document.getElementById("loader");
  const hero = document.querySelector(".hero");
  const enterButton = document.getElementById("enterButton");
  const logoIntro = document.getElementById("logoIntro");
  const cloudMount = document.getElementById("cloudIntro");
  const physicsCanvas = document.getElementById("physicsCanvas");

  let introCloudScene = null;
  let ambientParticlesCleanup = null;
  let introDismissed = false;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function createCloudTexture(size = 512) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;

    for (let i = 0; i < 18; i++) {
      const radius = size * (0.12 + Math.random() * 0.18);
      const offsetX = (Math.random() - 0.5) * size * 0.35;
      const offsetY = (Math.random() - 0.5) * size * 0.18;

      const grad = ctx.createRadialGradient(
        centerX + offsetX,
        centerY + offsetY,
        radius * 0.05,
        centerX + offsetX,
        centerY + offsetY,
        radius
      );

      grad.addColorStop(0, "rgba(255,255,255,0.95)");
      grad.addColorStop(0.45, "rgba(255,230,244,0.55)");
      grad.addColorStop(0.8, "rgba(255,182,224,0.14)");
      grad.addColorStop(1, "rgba(255,182,224,0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX + offsetX, centerY + offsetY, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  function createMistTexture(size = 256) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, size, size);

    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );

    grad.addColorStop(0, "rgba(255,255,255,0.95)");
    grad.addColorStop(0.28, "rgba(255,220,240,0.45)");
    grad.addColorStop(0.62, "rgba(255,182,224,0.12)");
    grad.addColorStop(1, "rgba(255,182,224,0)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  function createIntroCloudScene(container) {
    if (!container || typeof THREE === "undefined") return null;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x1a0d16, 0.055);

    const camera = new THREE.PerspectiveCamera(54, 1, 0.1, 100);
    camera.position.set(0, 0.5, 18);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const cloudTexture = createCloudTexture(512);
    const mistTexture = createMistTexture(256);

    const cloudGroup = new THREE.Group();
    scene.add(cloudGroup);

    const cloudCount = prefersReducedMotion ? 24 : 58;
    const clouds = [];
    const palette = [
      new THREE.Color("#ffd1ea"),
      new THREE.Color("#ffb3db"),
      new THREE.Color("#ffc7ef"),
      new THREE.Color("#f6d7ff"),
      new THREE.Color("#fff0fa")
    ];

    for (let i = 0; i < cloudCount; i++) {
      const color = palette[i % palette.length].clone();
      color.offsetHSL((Math.random() - 0.5) * 0.03, 0, (Math.random() - 0.5) * 0.08);

      const material = new THREE.SpriteMaterial({
        map: cloudTexture,
        color,
        transparent: true,
        opacity: 0.18 + Math.random() * 0.22,
        depthWrite: false,
        blending: THREE.NormalBlending
      });

      const sprite = new THREE.Sprite(material);

      sprite.position.set(
        (Math.random() - 0.5) * 34,
        (Math.random() - 0.5) * 14,
        -10 + Math.random() * 18
      );

      const scale = 4.5 + Math.random() * 8.5;
      sprite.scale.set(scale * 1.55, scale, 1);

      sprite.material.rotation = (Math.random() - 0.5) * 0.6;
      cloudGroup.add(sprite);

      clouds.push({
        sprite,
        speedX: 0.002 + Math.random() * 0.008,
        speedY: (Math.random() - 0.5) * 0.0025,
        pulse: Math.random() * Math.PI * 2,
        baseOpacity: sprite.material.opacity
      });
    }

    const mistGroup = new THREE.Group();
    scene.add(mistGroup);

    const mistCount = prefersReducedMotion ? 18 : 40;
    const mists = [];

    for (let i = 0; i < mistCount; i++) {
      const material = new THREE.SpriteMaterial({
        map: mistTexture,
        color: new THREE.Color(i % 2 === 0 ? "#ffd6ec" : "#ffe9f6"),
        transparent: true,
        opacity: 0.05 + Math.random() * 0.12,
        depthWrite: false
      });

      const sprite = new THREE.Sprite(material);

      sprite.position.set(
        (Math.random() - 0.5) * 26,
        (Math.random() - 0.5) * 11,
        -6 + Math.random() * 10
      );

      const scale = 5 + Math.random() * 10;
      sprite.scale.set(scale * 1.35, scale, 1);

      mistGroup.add(sprite);

      mists.push({
        sprite,
        speedX: 0.001 + Math.random() * 0.004,
        speedY: 0.0005 + Math.random() * 0.0015,
        pulse: Math.random() * Math.PI * 2,
        baseOpacity: sprite.material.opacity
      });
    }

    const particleTexture = createMistTexture(96);
    const particleCount = prefersReducedMotion ? 90 : 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 34;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      particlePositions[i * 3 + 2] = -12 + Math.random() * 18;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      map: particleTexture,
      transparent: true,
      opacity: 0.16,
      size: prefersReducedMotion ? 0.35 : 0.5,
      color: new THREE.Color("#ffd9ee"),
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    function onPointerMove(event) {
      const rect = container.getBoundingClientRect();
      target.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      target.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    }

    function onResize() {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    }

    let rafId = 0;
    const clock = new THREE.Clock();

    function animate() {
      rafId = requestAnimationFrame(animate);

      const t = clock.getElapsedTime();

      mouse.x += (target.x - mouse.x) * 0.03;
      mouse.y += (target.y - mouse.y) * 0.03;

      camera.position.x = mouse.x * 0.9 + Math.sin(t * 0.15) * 0.35;
      camera.position.y = 0.4 + (-mouse.y * 0.6) + Math.cos(t * 0.22) * 0.18;
      camera.lookAt(0, 0, 0);

      cloudGroup.rotation.z = Math.sin(t * 0.08) * 0.03;
      mistGroup.rotation.z = -Math.sin(t * 0.06) * 0.02;

      clouds.forEach((cloud, i) => {
        cloud.sprite.position.x += cloud.speedX;
        cloud.sprite.position.y += cloud.speedY * Math.sin(t * 0.8 + i);

        if (cloud.sprite.position.x > 18) {
          cloud.sprite.position.x = -18;
        }

        cloud.sprite.material.opacity =
          cloud.baseOpacity + Math.sin(t * 0.8 + cloud.pulse) * 0.03;
      });

      mists.forEach((mist, i) => {
        mist.sprite.position.x += mist.speedX;
        mist.sprite.position.y += Math.sin(t * 0.55 + i) * mist.speedY;

        if (mist.sprite.position.x > 14) {
          mist.sprite.position.x = -14;
        }

        mist.sprite.material.opacity =
          mist.baseOpacity + Math.sin(t * 0.65 + mist.pulse) * 0.025;
      });

      particles.rotation.z = t * 0.01;
      particles.rotation.y = Math.sin(t * 0.08) * 0.08;

      renderer.render(scene, camera);
    }

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    onResize();
    animate();

    return {
      destroy() {
        cancelAnimationFrame(rafId);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("pointermove", onPointerMove);

        particleGeo.dispose();
        particleMat.dispose();

        clouds.forEach((cloud) => {
          cloud.sprite.material.dispose();
        });

        mists.forEach((mist) => {
          mist.sprite.material.dispose();
        });

        if (cloudTexture) cloudTexture.dispose();
        if (mistTexture) mistTexture.dispose();
        if (particleTexture) particleTexture.dispose();

        renderer.dispose();

        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };
  }

  function createAmbientIntroParticles(canvas) {
    if (!canvas) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const particles = [];
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const particleCount = prefersReducedMotion ? 18 : 46;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function makeParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 1 + Math.random() * 3,
        vx: -0.08 + Math.random() * 0.16,
        vy: -0.12 + Math.random() * 0.22,
        alpha: 0.15 + Math.random() * 0.35,
        pulse: Math.random() * Math.PI * 2
      };
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(makeParticle());
    }

    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    let rafId = 0;

    function draw() {
      rafId = requestAnimationFrame(draw);
      frame += 0.015;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < -20 || p.x < -20 || p.x > canvas.width + 20) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + 20;
        }

        const a = p.alpha + Math.sin(frame + p.pulse) * 0.08;
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 214, 236, ${clamp(a, 0.05, 0.6)})`;
        ctx.shadowBlur = 14;
        ctx.shadowColor = "rgba(255, 140, 195, 0.45)";
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
    }

    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }

  function showHome() {
    if (introDismissed) return;
    introDismissed = true;

    if (logoIntro) {
      logoIntro.style.transition = "transform 0.7s ease, opacity 0.7s ease";
      logoIntro.style.transform = "translateY(-12px) scale(0.96)";
      logoIntro.style.opacity = "0.25";
    }

    if (enterButton) {
      enterButton.disabled = true;
      enterButton.style.transform = "scale(0.96)";
      enterButton.style.opacity = "0.5";
    }

    if (loader) {
      loader.style.opacity = "0";
      loader.style.pointerEvents = "none";
    }

    if (hero) {
      setTimeout(() => {
        hero.classList.add("visible");
      }, 180);
    }

    setTimeout(() => {
      if (introCloudScene) {
        introCloudScene.destroy();
        introCloudScene = null;
      }

      if (ambientParticlesCleanup) {
        ambientParticlesCleanup();
        ambientParticlesCleanup = null;
      }

      if (loader) {
        loader.style.display = "none";
      }
    }, 1100);
  }

  function setupIntro() {
    if (cloudMount) {
      introCloudScene = createIntroCloudScene(cloudMount);
    }

    ambientParticlesCleanup = createAmbientIntroParticles(physicsCanvas);

    if (enterButton) {
      enterButton.addEventListener("click", showHome);
      enterButton.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          showHome();
        }
      });

      setTimeout(() => {
        enterButton.focus({ preventScroll: true });
      }, 300);
    }

    window.addEventListener("keydown", (event) => {
      if (!loader || loader.style.display === "none") return;
      if (event.key === "Enter" && document.activeElement !== enterButton) {
        showHome();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupIntro);
  } else {
    setupIntro();
  }
})();
