(() => {
  const loader = document.getElementById("loader");
  const hero = document.querySelector(".hero");
  const enterButton = document.getElementById("enterButton");
  const logoIntro = document.getElementById("logoIntro");
  const cloudMount = document.getElementById("cloudIntro");
  const physicsCanvas = document.getElementById("physicsCanvas");

  let introDismissed = false;
  let cloudScene = null;
  let ambientCleanup = null;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function createAmbientParticles(canvas) {
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const particles = [];
    const count = prefersReduced ? 14 : 34;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function makeParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 1 + Math.random() * 2.6,
        vx: -0.05 + Math.random() * 0.1,
        vy: -0.14 + Math.random() * 0.18,
        a: 0.18 + Math.random() * 0.22,
        p: Math.random() * Math.PI * 2
      };
    }

    resize();
    for (let i = 0; i < count; i++) particles.push(makeParticle());

    window.addEventListener("resize", resize);

    let t = 0;
    let raf = 0;

    function draw() {
      raf = requestAnimationFrame(draw);
      t += 0.015;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < -20 || p.x < -20 || p.x > canvas.width + 20) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + 20;
        }

        const alpha = clamp(p.a + Math.sin(t + p.p) * 0.07, 0.05, 0.6);

        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 220, 240, ${alpha})`;
        ctx.shadowBlur = 14;
        ctx.shadowColor = "rgba(255, 140, 195, 0.45)";
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

  function createVolumetricCloudIntro(container) {
    if (!container || typeof THREE === "undefined") return null;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, prefersReduced ? 1.25 : 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uIntensity: { value: prefersReduced ? 0.78 : 1.0 }
    };

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;

      varying vec2 vUv;

      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform float uIntensity;

      #define MAX_STEPS 56
      #define MAX_DIST 22.0
      #define SURF_DIST 0.002

      mat2 rot(float a) {
        float s = sin(a);
        float c = cos(a);
        return mat2(c, -s, s, c);
      }

      float hash(vec3 p) {
        p = fract(p * 0.3183099 + .1);
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }

      float noise(vec3 x) {
        vec3 i = floor(x);
        vec3 f = fract(x);

        f = f * f * (3.0 - 2.0 * f);

        float n000 = hash(i + vec3(0.0, 0.0, 0.0));
        float n100 = hash(i + vec3(1.0, 0.0, 0.0));
        float n010 = hash(i + vec3(0.0, 1.0, 0.0));
        float n110 = hash(i + vec3(1.0, 1.0, 0.0));
        float n001 = hash(i + vec3(0.0, 0.0, 1.0));
        float n101 = hash(i + vec3(1.0, 0.0, 1.0));
        float n011 = hash(i + vec3(0.0, 1.0, 1.0));
        float n111 = hash(i + vec3(1.0, 1.0, 1.0));

        float nx00 = mix(n000, n100, f.x);
        float nx10 = mix(n010, n110, f.x);
        float nx01 = mix(n001, n101, f.x);
        float nx11 = mix(n011, n111, f.x);

        float nxy0 = mix(nx00, nx10, f.y);
        float nxy1 = mix(nx01, nx11, f.y);

        return mix(nxy0, nxy1, f.z);
      }

      float fbm(vec3 p) {
        float value = 0.0;
        float amp = 0.5;
        for (int i = 0; i < 6; i++) {
          value += amp * noise(p);
          p *= 2.02;
          amp *= 0.5;
        }
        return value;
      }

      float cloudDensity(vec3 p) {
        vec3 q = p;
        q.xy *= rot(0.18);
        q.x += uTime * 0.18;
        q.z += uTime * 0.08;

        float base = fbm(q * 0.42);
        float detail = fbm(q * 1.05 + vec3(0.0, uTime * 0.07, 0.0)) * 0.42;
        float heightFalloff = smoothstep(3.8, 0.3, abs(p.y));
        float field = base + detail - 0.50;

        return clamp(field * heightFalloff * 1.65, 0.0, 1.0);
      }

      vec3 cloudColor(float density, float light) {
        vec3 pinkA = vec3(1.00, 0.76, 0.88);
        vec3 pinkB = vec3(1.00, 0.58, 0.78);
        vec3 whiteGlow = vec3(1.00, 0.96, 0.99);

        vec3 col = mix(pinkA, pinkB, density * 0.75);
        col = mix(col, whiteGlow, light * 0.45);
        return col;
      }

      float sampleLight(vec3 p, vec3 lightDir) {
        float acc = 0.0;
        float stepLen = 0.35;
        vec3 pos = p;

        for (int i = 0; i < 8; i++) {
          pos += lightDir * stepLen;
          acc += cloudDensity(pos) * 0.12;
        }

        return clamp(1.0 - acc, 0.0, 1.0);
      }

      vec3 render(vec3 ro, vec3 rd) {
        vec3 accum = vec3(0.0);
        float transmittance = 1.0;
        float t = 0.0;

        vec3 lightDir = normalize(vec3(-0.45, 0.65, -0.35));

        for (int i = 0; i < MAX_STEPS; i++) {
          if (t > MAX_DIST || transmittance < 0.01) break;

          vec3 p = ro + rd * t;
          float d = cloudDensity(p);

          if (d > 0.01) {
            float light = sampleLight(p, lightDir);
            float alpha = d * 0.10 * uIntensity;
            vec3 col = cloudColor(d, light);

            accum += col * alpha * transmittance;
            transmittance *= (1.0 - alpha);
          }

          t += 0.22 + t * 0.018;
        }

        vec3 bgA = vec3(0.04, 0.01, 0.03);
        vec3 bgB = vec3(0.14, 0.04, 0.09);
        vec3 bgC = vec3(0.26, 0.08, 0.18);

        float vertical = smoothstep(-0.9, 0.9, rd.y);
        float centerGlow = exp(-5.0 * length(vUv - 0.5));

        vec3 bg = mix(bgA, bgB, vertical);
        bg = mix(bg, bgC, centerGlow * 0.55);

        vec3 finalCol = accum + bg * transmittance;

        float bloom = centerGlow * 0.18;
        finalCol += vec3(1.0, 0.62, 0.82) * bloom;

        return finalCol;
      }

      void main() {
        vec2 uv = vUv * 2.0 - 1.0;
        uv.x *= uResolution.x / uResolution.y;

        vec2 mouse = uMouse * 0.35;

        vec3 ro = vec3(0.0 + mouse.x * 0.9, 0.0 + mouse.y * 0.5, -7.0);
        vec3 rd = normalize(vec3(uv.x, uv.y * 0.95, 1.65));

        rd.xy *= rot(mouse.x * 0.18);

        vec3 col = render(ro, rd);

        col = pow(col, vec3(0.92));
        gl_FragColor = vec4(col, 0.98);
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    const targetMouse = new THREE.Vector2(0, 0);
    const smoothMouse = new THREE.Vector2(0, 0);

    function onPointerMove(event) {
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      targetMouse.set(x, -y);
    }

    function onResize() {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      uniforms.uResolution.value.set(width, height);
      renderer.setSize(width, height, false);
    }

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    onResize();

    const clock = new THREE.Clock();
    let raf = 0;

    function animate() {
      raf = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();
      smoothMouse.lerp(targetMouse, 0.045);

      uniforms.uTime.value = time;
      uniforms.uMouse.value.copy(smoothMouse);

      renderer.render(scene, camera);
    }

    animate();

    return {
      destroy() {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("pointermove", onPointerMove);
        mesh.geometry.dispose();
        material.dispose();
        renderer.dispose();

        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };
  }

  function dismissIntro() {
    if (introDismissed) return;
    introDismissed = true;

    if (logoIntro) {
      logoIntro.style.transition = "transform 0.7s ease, opacity 0.7s ease";
      logoIntro.style.transform = "translateY(-14px) scale(0.95)";
      logoIntro.style.opacity = "0.22";
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
      if (cloudScene) {
        cloudScene.destroy();
        cloudScene = null;
      }

      if (ambientCleanup) {
        ambientCleanup();
        ambientCleanup = null;
      }

      if (loader) {
        loader.style.display = "none";
      }
    }, 1100);
  }

  function setupIntro() {
    cloudScene = createVolumetricCloudIntro(cloudMount);
    ambientCleanup = createAmbientParticles(physicsCanvas);

    if (enterButton) {
      enterButton.addEventListener("click", dismissIntro);

      enterButton.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          dismissIntro();
        }
      });

      setTimeout(() => {
        enterButton.focus({ preventScroll: true });
      }, 300);
    }

    window.addEventListener("keydown", (event) => {
      if (!loader || loader.style.display === "none") return;
      if (event.key === "Enter" && document.activeElement !== enterButton) {
        dismissIntro();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupIntro);
  } else {
    setupIntro();
  }
})();
