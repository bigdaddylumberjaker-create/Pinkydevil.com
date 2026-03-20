(() => {
  const loader = document.getElementById("loader");
  const enterButton = document.getElementById("enterButton");
  const logo = document.getElementById("logoIntro");
  const cloudMount = document.getElementById("cloudIntro");

  let scene, camera, renderer, composer;
  let uniforms;

  function initVFX() {
    scene = new THREE.Scene();

    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    cloudMount.appendChild(renderer.domElement);

    uniforms = {
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight)
      }
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      vertexShader: `
        varying vec2 vUv;
        void main(){
          vUv = uv;
          gl_Position = vec4(position,1.0);
        }
      `,
      fragmentShader: `
        precision highp float;

        varying vec2 vUv;
        uniform float uTime;

        // noise
        float hash(vec3 p){
          return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);
        }

        float noise(vec3 p){
          vec3 i = floor(p);
          vec3 f = fract(p);
          f = f*f*(3.0-2.0*f);

          return mix(
            mix(mix(hash(i+vec3(0,0,0)), hash(i+vec3(1,0,0)), f.x),
                mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
            mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
                mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y),
            f.z
          );
        }

        float fbm(vec3 p){
          float v = 0.0;
          float a = 0.5;
          for(int i=0;i<6;i++){
            v += a * noise(p);
            p *= 2.0;
            a *= 0.5;
          }
          return v;
        }

        void main(){
          vec2 uv = vUv * 2.0 - 1.0;

          vec3 ro = vec3(0.0,0.0,-4.0);
          vec3 rd = normalize(vec3(uv,1.4));

          float t = 0.0;
          vec3 col = vec3(0.0);

          for(int i=0;i<60;i++){
            vec3 p = ro + rd * t;

            float d = fbm(p + uTime * 0.2);

            float density = smoothstep(0.45,0.75,d);

            vec3 pink = vec3(1.0,0.55,0.85);
            vec3 glow = vec3(1.0,0.9,1.0);

            vec3 c = mix(pink, glow, d);

            col += c * density * 0.035;

            t += 0.07;
          }

          // film-style contrast
          col = pow(col, vec3(0.85));

          gl_FragColor = vec4(col,1.0);
        }
      `
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    // BLOOM
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));

    const bloom = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.6,
      0.9,
      0.15
    );

    composer.addPass(bloom);

    animate();
  }

  function animate() {
    requestAnimationFrame(animate);
    uniforms.uTime.value += 0.01;
    composer.render();
  }

  function exitIntro() {
    // FORCE WORK ALWAYS
    if (!loader) return;

    loader.style.opacity = "0";
    loader.style.pointerEvents = "none";

    if (logo) {
      logo.style.transform = "scale(0.9)";
      logo.style.opacity = "0.3";
    }

    if (enterButton) {
      enterButton.disabled = true;
    }

    setTimeout(() => {
      loader.style.display = "none";
    }, 900);
  }

  function fixButton() {
    // ensure button is ALWAYS clickable
    if (!enterButton) return;

    enterButton.style.zIndex = "9999";
    enterButton.style.position = "relative";

    // multiple triggers = bulletproof
    enterButton.addEventListener("click", exitIntro);
    enterButton.addEventListener("pointerdown", exitIntro);
    enterButton.addEventListener("touchstart", exitIntro);

    window.addEventListener("keydown", (e) => {
      if (e.key === "Enter") exitIntro();
    });
  }

  function fixCanvasBlocking() {
    // VERY IMPORTANT: prevent canvas from blocking clicks
    const canvases = document.querySelectorAll("canvas");
    canvases.forEach(c => {
      c.style.pointerEvents = "none";
    });
  }

  function init() {
    try {
      initVFX();
    } catch (e) {
      console.error("VFX failed but intro still usable", e);
    }

    fixButton();
    fixCanvasBlocking();
  }

  init();
})();
