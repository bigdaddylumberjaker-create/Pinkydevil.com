(() => {
  const container = document.getElementById("cloudIntro");
  const enterButton = document.getElementById("enterButton");
  const loader = document.getElementById("loader");

  let scene, camera, renderer, composer;
  let uniforms;

  function init() {
    scene = new THREE.Scene();

    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
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

        float noise(vec3 p){
          return fract(sin(dot(p,vec3(12.9898,78.233,45.164)))*43758.5453);
        }

        float fbm(vec3 p){
          float v = 0.0;
          float a = 0.5;
          for(int i=0;i<5;i++){
            v += a * noise(p);
            p *= 2.0;
            a *= 0.5;
          }
          return v;
        }

        void main(){
          vec2 uv = vUv * 2.0 - 1.0;

          vec3 ro = vec3(0.0,0.0,-4.0);
          vec3 rd = normalize(vec3(uv,1.5));

          float t = 0.0;
          vec3 col = vec3(0.0);

          for(int i=0;i<40;i++){
            vec3 p = ro + rd * t;

            float d = fbm(p + uTime*0.2);

            float density = smoothstep(0.5,0.7,d);

            vec3 pink = vec3(1.0,0.6,0.8);
            vec3 light = vec3(1.0,0.9,1.0);

            vec3 c = mix(pink, light, d);

            col += c * density * 0.04;

            t += 0.08;
          }

          gl_FragColor = vec4(col,1.0);
        }
      `
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    // 🌟 POST PROCESSING
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));

    const bloom = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.4,   // strength
      0.8,   // radius
      0.2    // threshold
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
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.style.display = "none";
    }, 1000);
  }

  enterButton.addEventListener("click", exitIntro);

  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  });

  init();
})();
