(() => {
  const loader = document.getElementById("loader");
  const hero = document.querySelector(".hero");
  const enterButton = document.getElementById("enterButton");
  const logoIntro = document.getElementById("logoIntro");
  const cloudMount = document.getElementById("cloudIntro");
  const physicsCanvas = document.getElementById("physicsCanvas");

  let introDismissed = false;
  let sceneBundle = null;
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
    const count = prefersReduced ? 16 : 38;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 1 + Math.random() * 2.5,
        vx: -0.06 + Math.random() * 0.12,
        vy: -0.16 + Math.random() * 0.2,
        alpha: 0.14 + Math.random() * 0.25,
        pulse: Math.random() * Math.PI * 2
      };
    }

    resize();
    for (let i = 0; i < count; i++) {
      particles.push(createParticle());
    }

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
        ctx.shadowColor = "rgba(255, 140, 195, 0.48)";
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

  function createVolumetricIntro(container) {
    if (!container || typeof THREE === "undefined") return null;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, prefersReduced ? 1.25 : 2));
    renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight, false);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      48,
      (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight),
      0.1,
      100
    );
    camera.position.set(0, 0, 8.5);

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uIntensity: { value: prefersReduced ? 0.72 : 1.0 }
    };

    const cloudMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms,
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPos;
        void main() {
          vUv = uv;
          vec4 world = modelMatrix * vec4(position, 1.0);
          vWorldPos = world.xyz;
          gl_Position = projectionMatrix * viewMatrix * world;
        }
      `,
      fragmentShader: `
        precision highp float;

        varying vec2 vUv;
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec2 uMouse;
        uniform float uIntensity;

        float hash(vec3 p) {
          p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
          p *= 17.0;
          return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }

        float noise(vec3 x) {
          vec3 i = floor(x);
          vec3 f = fract(x);
          f = f * f * (3.0 - 2.0 * f);

          float n000 = hash(i + vec3(0.0,0.0,0.0));
          float n100 = hash(i + vec3(1.0,0.0,0.0));
          float n010 = hash(i + vec3(0.0,1.0,0.0));
          float n110 = hash(i + vec3(1.0,1.0,0.0));
          float n001 = hash(i + vec3(0.0,0.0,1.0));
          float n101 = hash(i + vec3(1.0,0.0,1.0));
          float n011 = hash(i + vec3(0.0,1.0,1.0));
          float n111 = hash(i + vec3(1.0,1.0,1.0));

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
            p *= 2.03;
            amp *= 0.5;
          }
          return value;
        }

        vec3 rotateY(vec3 p, float a) {
          float s = sin(a);
          float c = cos(a);
          return vec3(c*p.x + s*p.z, p.y, -s*p.x + c*p.z);
        }

        float cloudField(vec3 p) {
          p = rotateY(p, 0.22 + uMouse.x * 0.12);
          p.x += uTime * 0.16;
          p.z += uTime * 0.05;

          float base = fbm(p * 0.45);
          float detail = fbm(p * 1.15 + vec3(0.0, uTime * 0.04, 0.0)) * 0.38;
          float shape = base + detail - 0.52;
          float vertical = smoothstep(2.6, 0.2, abs(p.y));
          return clamp(shape * vertical * 1.55, 0.0, 1.0);
        }

        float sampleLight(vec3 p, vec3 lightDir) {
          float accum = 0.0;
          float stepLen = 0.35;
          vec3 pos = p;
          for (int i = 0; i < 8; i++) {
            pos += lightDir * stepLen;
            accum += cloudField(pos) * 0.12;
          }
          return clamp(1.0 - accum, 0.0, 1.0);
        }

        vec3 cloudColor(float density, float light) {
          vec3 c1 = vec3(1.00, 0.74, 0.87);
          vec3 c2 = vec3(1.00, 0.54, 0.77);
          vec3 c3 = vec3(1.00, 0.93, 0.98);
          vec3 col = mix(c1, c2, density * 0.75);
          col = mix(col, c3, light * 0.42);
          return col;
        }

        void main() {
          vec2 uv = vUv * 2.0 - 1.0;
          uv.x *= uResolution.x / uResolution.y;

          vec3 ro = vec3(uMouse.x * 0.8, uMouse.y * 0.4, -7.5);
          vec3 rd = normalize(vec3(uv.x, uv.y * 0.96, 1.65));

          vec3 lightDir = normalize(vec3(-0.4, 0.65, -0.35));

          vec3 accum = vec3(0.0);
          float transmittance = 1.0;
          float t = 0.0;

          for (int i = 0; i < 58; i++) {
            if (t > 18.0 || transmittance < 0.01) break;

            vec3 p = ro + rd * t;
            float density = cloudField(p);

            if (density > 0.01) {
              float light = sampleLight(p, lightDir);
              float alpha = density * 0.095 * uIntensity;
              vec3 col = cloudColor(density, light);
              accum += col * alpha * transmittance;
              transmittance *= (1.0 - alpha);
            }

            t += 0.22 + t * 0.018;
          }

          float centerGlow = exp(-4.6 * length(uv));
          vec3 bgA = vec3(0.05, 0.01, 0.03);
          vec3 bgB = vec3(0.18, 0.04, 0.09);
          vec3 bg = mix(bgA, bgB, centerGlow * 0.6);

          vec3 col = accum + bg * transmittance;
          col += vec3(1.0, 0.58, 0.80) * centerGlow * 0.12;

          gl_FragColor = vec4(col, 0.98);
        }
      `
    });

    const cloudPlane = new THREE.Mesh(new THREE.PlaneGeometry(18, 10), cloudMaterial);
    cloudPlane.position.z = -1.5;
    scene.add(cloudPlane);

    const fogTexture = (() => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(0.35, "rgba(255,225,240,0.45)");
      grad.addColorStop(0.75, "rgba(255,170,210,0.10)");
      grad.addColorStop(1, "rgba(255,170,210,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);
      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      return tex;
    })();

    const fogGroup = new THREE.Group();
    scene.add(fogGroup);

    const fogSprites = [];
    const fogCount = prefersReduced ? 10 : 22;

    for (let i = 0; i < fogCount; i++) {
      const mat = new THREE.SpriteMaterial({
        map: fogTexture,
        transparent: true,
        opacity: 0.06 + Math.random() * 0.12,
        depthWrite: false,
        color: new THREE.Color(i % 2 === 0 ? "#ffd1ea" : "#ffe9f6")
      });

      const sprite = new THREE.Sprite(mat);
      sprite.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 4.5,
        -2.8 + Math.random() * 3.6
      );

      const scale = 2.5 + Math.random() * 5.5;
      sprite.scale.set(scale * 1.5, scale, 1);
      fogGroup.add(sprite);

      fogSprites.push({
        sprite,
        speedX: 0.002 + Math.random() * 0.006,
        drift: (Math.random() - 0.5) * 0.2,
        baseOpacity: sprite.material.opacity,
        pulse: Math.random() * Math.PI * 2
      });
    }

    const godRayMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: uniforms.uTime,
        uMouse: uniforms.uMouse,
        uResolution: uniforms.uResolution
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        varying vec2 vUv;
        uniform float uTime;
        uniform vec2 uMouse;

        void main() {
          vec2 uv = vUv * 2.0 - 1.0;
          vec2 source = vec2(0.0 + uMouse.x * 0.12, 0.3 + uMouse.y * 0.08);

          float angle = atan(uv.y - source.y, uv.x - source.x);
          float radius = length(uv - source);

          float beams = sin(angle * 14.0 + uTime * 0.8) * 0.5 + 0.5;
          beams += sin(angle * 28.0 - uTime * 0.45) * 0.25 + 0.25;
          beams *= smoothstep(1.2, 0.0, radius);
          beams *= smoothstep(-0.9, 0.25, uv.y);

          vec3 color = vec3(1.0, 0.62, 0.83) * beams * 0.12;
          gl_FragColor = vec4(color, beams * 0.24);
        }
      `
    });

    const godRayPlane = new THREE.Mesh(new THREE.PlaneGeometry(18, 10), godRayMaterial);
    godRayPlane.position.set(0, 0, -0.6);
    scene.add(godRayPlane);

    const sparkleCount = prefersReduced ? 120 : 280;
    const sparklePositions = new Float32Array(sparkleCount * 3);
    const sparkleSizes = new Float32Array(sparkleCount);

    for (let i = 0; i < sparkleCount; i++) {
      sparklePositions[i * 3 + 0] = (Math.random() - 0.5) * 13;
      sparklePositions[i * 3 + 1] = (Math.random() - 0.5) * 7.5;
      sparklePositions[i * 3 + 2] = -2.5 + Math.random() * 4.2;
      sparkleSizes[i] = 1 + Math.random() * 2.6;
    }

    const sparkleGeometry = new THREE.BufferGeometry();
    sparkleGeometry.setAttribute("position", new THREE.BufferAttribute(sparklePositions, 3));
    sparkleGeometry.setAttribute("aSize", new THREE.BufferAttribute(sparkleSizes, 1));

    const sparkleMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: uniforms.uTime
      },
      vertexShader: `
        attribute float aSize;
        uniform float uTime;
        varying float vAlpha;
        void main() {
          vec3 pos = position;
          pos.y += sin(uTime * 0.5 + position.x * 1.3 + position.z * 2.0) * 0.05;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = aSize * (280.0 / -mvPosition.z);
          vAlpha = 0.45 + 0.55 * sin(uTime * 1.6 + position.x * 2.0 + position.y * 1.4);
        }
      `,
      fragmentShader: `
        precision highp float;
        varying float vAlpha;
        void main() {
          vec2 uv = gl_PointCoord * 2.0 - 1.0;
          float d = dot(uv, uv);
          float alpha = smoothstep(1.0, 0.0, d);
          vec3 col = mix(vec3(1.0, 0.85, 0.95), vec3(1.0, 0.65, 0.85), 0.45);
          gl_FragColor = vec4(col, alpha * vAlpha * 0.42);
        }
      `
    });

    const sparkles = new THREE.Points(sparkleGeometry, sparkleMaterial);
    scene.add(sparkles);

    const composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));

    const bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight),
      prefersReduced ? 0.85 : 1.25,
      0.95,
      0.12
    );
    composer.addPass(bloomPass);

    const colorGradeShader = {
      uniforms: {
        tDiffuse: { value: null },
        uTint: { value: new THREE.Vector3(1.05, 0.95, 1.05) },
        uVignette: { value: 0.26 },
        uContrast: { value: 1.08 },
        uSaturation: { value: 1.14 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform sampler2D tDiffuse;
        uniform vec3 uTint;
        uniform float uVignette;
        uniform float uContrast;
        uniform float uSaturation;
        varying vec2 vUv;

        vec3 saturateColor(vec3 color, float sat) {
          float l = dot(color, vec3(0.2126, 0.7152, 0.0722));
          return mix(vec3(l), color, sat);
        }

        void main() {
          vec4 tex = texture2D(tDiffuse, vUv);
          vec3 color = tex.rgb;

          color *= uTint;
          color = saturateColor(color, uSaturation);
          color = (color - 0.5) * uContrast + 0.5;

          float dist = distance(vUv, vec2(0.5));
          color *= 1.0 - dist * uVignette;

          gl_FragColor = vec4(color, tex.a);
        }
      `
    };

    const colorPass = new THREE.ShaderPass(colorGradeShader);
    composer.addPass(colorPass);

    const filmPass = new THREE.FilmPass(
      0.13,
      0.025,
      648,
      false
    );
    composer.addPass(filmPass);

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

      renderer.setSize(width, height, false);
      composer.setSize(width, height);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      uniforms.uResolution.value.set(width, height);
    }

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    onResize();

    const clock = new THREE.Clock();
    let raf = 0;

    function animate() {
      raf = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();
      uniforms.uTime.value = time;

      smoothMouse.lerp(targetMouse, 0.04);
      uniforms.uMouse.value.copy(smoothMouse);

      camera.position.x = smoothMouse.x * 0.18;
      camera.position.y = smoothMouse.y * 0.10;

      fogSprites.forEach((fog, i) => {
        fog.sprite.position.x += fog.speedX;
        fog.sprite.position.y += Math.sin(time * 0.45 + i) * 0.0015;

        if (fog.sprite.position.x > 6.8) {
          fog.sprite.position.x = -6.8;
        }

        fog.sprite.material.opacity =
          fog.baseOpacity + Math.sin(time * 0.6 + fog.pulse) * 0.02;
      });

      sparkles.rotation.z = time * 0.02;
      sparkles.rotation.y = Math.sin(time * 0.08) * 0.06;

      composer.render();
    }

    animate();

    return {
      destroy() {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("pointermove", onPointerMove);

        fogTexture.dispose();
        sparkleGeometry.dispose();
        sparkleMaterial.dispose();
        cloudMaterial.dispose();
        godRayMaterial.dispose();

        composer.renderTarget1.dispose();
        composer.renderTarget2.dispose();
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
      if (sceneBundle) {
        sceneBundle.destroy();
        sceneBundle = null;
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
    sceneBundle = createVolumetricIntro(cloudMount);
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
