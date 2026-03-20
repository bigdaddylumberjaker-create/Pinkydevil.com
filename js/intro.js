(() => {
  const cloudMount = document.getElementById("cloudIntro");
  const physicsCanvas = document.getElementById("physicsCanvas");

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function createAmbientParticles(canvas) {
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const particles = [];
    const count = 28;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 1 + Math.random() * 2.4,
        vx: -0.05 + Math.random() * 0.1,
        vy: -0.12 + Math.random() * 0.16,
        alpha: 0.14 + Math.random() * 0.22,
        pulse: Math.random() * Math.PI * 2
      };
    }

    resize();
    for (let i = 0; i < count; i++) particles.push(createParticle());

    window.addEventListener("resize", resize);

    let t = 0;
    let raf = 0;

    function draw() {
      raf = requestAnimationFrame(draw);
      t += 0.018;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < -20 || p.x < -20 || p.x > canvas.width + 20) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + 20;
        }

        const alpha = clamp(p.alpha + Math.sin(t + p.pulse) * 0.06, 0.04, 0.55);

        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 220, 240, ${alpha})`;
        ctx.shadowBlur = 14;
        ctx.shadowColor = "rgba(255, 140, 195, 0.42)";
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
    }

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
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

    for (let i = 0; i < 22; i++) {
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

      grad.addColorStop(0, "rgba(255,255,255,0.98)");
      grad.addColorStop(0.42, "rgba(255,230,244,0.58)");
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

    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
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

  function initMaxQualityScene(container) {
    if (!container || typeof THREE === "undefined") return null;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x1a0d16, 0.045);

    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 100);
    camera.position.set(0, 0.35, 17);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.pointerEvents = "none";
    container.appendChild(renderer.domElement);

    const cloudTexture = createCloudTexture(512);
    const mistTexture = createMistTexture(256);

    const cloudGroup = new THREE.Group();
    scene.add(cloudGroup);

    const clouds = [];
    const palette = [
      new THREE.Color("#ffd1ea"),
      new THREE.Color("#ffb3db"),
      new THREE.Color("#ffc7ef"),
      new THREE.Color("#f6d7ff"),
      new THREE.Color("#fff0fa")
    ];

    for (let i = 0; i < 52; i++) {
      const color = palette[i % palette.length].clone();
      color.offsetHSL((Math.random() - 0.5) * 0.03, 0, (Math.random() - 0.5) * 0.08);

      const material = new THREE.SpriteMaterial({
        map: cloudTexture,
        color,
        transparent: true,
        opacity: 0.16 + Math.random() * 0.22,
        depthWrite: false
      });

      const sprite = new THREE.Sprite(material);
      sprite.position.set(
        (Math.random() - 0.5) * 32,
        (Math.random() - 0.5) * 12,
        -10 + Math.random() * 18
      );

      const scale = 4 + Math.random() * 8.5;
      sprite.scale.set(scale * 1.55, scale, 1);
      sprite.material.rotation = (Math.random() - 0.5) * 0.5;

      cloudGroup.add(sprite);

      clouds.push({
        sprite,
        speedX: 0.002 + Math.random() * 0.008,
        speedY: (Math.random() - 0.5) * 0.002,
        pulse: Math.random() * Math.PI * 2,
        baseOpacity: sprite.material.opacity
      });
    }

    const mistGroup = new THREE.Group();
    scene.add(mistGroup);

    const mists = [];

    for (let i = 0; i < 24; i++) {
      const material = new THREE.SpriteMaterial({
        map: mistTexture,
        color: new THREE.Color(i % 2 === 0 ? "#ffd6ec" : "#ffe9f6"),
        transparent: true,
        opacity: 0.05 + Math.random() * 0.11,
        depthWrite: false
      });

      const sprite = new THREE.Sprite(material);
      sprite.position.set(
        (Math.random() - 0.5) * 24,
        (Math.random() - 0.5) * 10,
        -6 + Math.random() * 9
      );

      const scale = 5 + Math.random() * 9;
      sprite.scale.set(scale * 1.35, scale, 1);
      mistGroup.add(sprite);

      mists.push({
        sprite,
        speedX: 0.001 + Math.random() * 0.004,
        baseOpacity: sprite.material.opacity,
        pulse: Math.random() * Math.PI * 2
      });
    }

    const sparkleTexture = createMistTexture(96);
    const sparkleCount = 180;
    const sparkleGeometry = new THREE.BufferGeometry();
    const sparklePositions = new Float32Array(sparkleCount * 3);

    for (let i = 0; i < sparkleCount; i++) {
      sparklePositions[i * 3 + 0] = (Math.random() - 0.5) * 30;
      sparklePositions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      sparklePositions[i * 3 + 2] = -12 + Math.random() * 16;
    }

    sparkleGeometry.setAttribute("position", new THREE.BufferAttribute(sparklePositions, 3));

    const sparkleMaterial = new THREE.PointsMaterial({
      map: sparkleTexture,
      transparent: true,
      opacity: 0.14,
      size: 0.48,
      color: new THREE.Color("#ffd9ee"),
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const sparkles = new THREE.Points(sparkleGeometry, sparkleMaterial);
    sparkles.material.depthTest = false;
    scene.add(sparkles);

    const targetMouse = new THREE.Vector2(0, 0);
    const smoothMouse = new THREE.Vector2(0, 0);

    function onPointerMove(event) {
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      targetMouse.set(x, -y);
    }

    function onResize() {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    }

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    onResize();

    const clock = new THREE.Clock();
    let raf = 0;

    function animate() {
      raf = requestAnimationFrame(animate);

      const t = clock.getElapsedTime();

      smoothMouse.lerp(targetMouse, 0.03);
      camera.position.x = smoothMouse.x * 0.7 + Math.sin(t * 0.15) * 0.22;
      camera.position.y = 0.3 + smoothMouse.y * 0.35 + Math.cos(t * 0.22) * 0.10;
      camera.lookAt(0, 0, 0);

      cloudGroup.rotation.z = Math.sin(t * 0.08) * 0.025;
      mistGroup.rotation.z = -Math.sin(t * 0.06) * 0.018;

      clouds.forEach((cloud, i) => {
        cloud.sprite.position.x += cloud.speedX;
        cloud.sprite.position.y += cloud.speedY * Math.sin(t * 0.8 + i);

        if (cloud.sprite.position.x > 16) {
          cloud.sprite.position.x = -16;
        }

        cloud.sprite.material.opacity =
          cloud.baseOpacity + Math.sin(t * 0.8 + cloud.pulse) * 0.03;
      });

      mists.forEach((mist, i) => {
        mist.sprite.position.x += mist.speedX;

        if (mist.sprite.position.x > 13) {
          mist.sprite.position.x = -13;
        }

        mist.sprite.material.opacity =
          mist.baseOpacity + Math.sin(t * 0.6 + mist.pulse) * 0.018;
      });

      sparkles.rotation.z = t * 0.01;
      sparkles.rotation.y = Math.sin(t * 0.08) * 0.06;

      renderer.render(scene, camera);
    }

    animate();

    return {
      destroy() {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("pointermove", onPointerMove);

        clouds.forEach((cloud) => cloud.sprite.material.dispose());
        mists.forEach((mist) => mist.sprite.material.dispose());

        sparkleGeometry.dispose();
        sparkleMaterial.dispose();

        if (cloudTexture) cloudTexture.dispose();
        if (mistTexture) mistTexture.dispose();
        if (sparkleTexture) sparkleTexture.dispose();

        renderer.dispose();

        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };
  }

  try {
    createAmbientParticles(physicsCanvas);
    initMaxQualityScene(cloudMount);
  } catch (error) {
    console.error("Intro VFX failed:", error);
  }
})();
