
(function () {
  'use strict';

  /* ── DOM ── */
  const canvas = document.getElementById('dream-canvas');
  const overlay = document.getElementById('overlay');
  const enterBtn = document.getElementById('enter-btn');
  const hud = document.getElementById('hud');
  const depthVal = document.getElementById('depth-val');
  const roomVal = document.getElementById('room-val');

  /* ── THREE SETUP ── */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 1.7, 0);

  /* ── FOG ── */
  scene.fog = new THREE.FogExp2(0x02010a, 0.045);

  /* ── ROOM THEMES ── */
  const THEMES = [
    { name: 'OBSIDIAN CORRIDOR', wall: 0x0a0a1a, emissive: 0x0033ff, floor: 0x050510, accent: 0x003fff, fog: 0x020215 },
    { name: 'CORAL ARCHIVE', wall: 0x1a0a0a, emissive: 0xff2060, floor: 0x100505, accent: 0xff1040, fog: 0x150202 },
    { name: 'JADE SANCTUM', wall: 0x001a0f, emissive: 0x00ff88, floor: 0x000d06, accent: 0x00ff66, fog: 0x000d06 },
    { name: 'AMBER VAULT', wall: 0x1a0e00, emissive: 0xffa000, floor: 0x0d0700, accent: 0xff8800, fog: 0x0d0500 },
    { name: 'VOID GALLERY', wall: 0x080808, emissive: 0xffffff, floor: 0x030303, accent: 0xcccccc, fog: 0x030303 },
    { name: 'ULTRAVIOLET HALL', wall: 0x0d0020, emissive: 0xcc00ff, floor: 0x070010, accent: 0xaa00ff, fog: 0x070010 },
  ];

  /* ── CONSTANTS ── */
  const SEG_LENGTH = 20;   // z-depth per segment
  const SEG_WIDTH = 6;
  const SEG_HEIGHT = 4;
  const POOL_SIZE = 8;    // active segments visible
  const SPAWN_AHEAD = 5;    // generate when < N segments ahead
  const MOVE_SPEED = 0.12;
  const STRAFE_SPEED = 0.08;

  /* ── STATE ── */
  let started = false;
  let depth = 0;       // how many segments passed
  let playerZ = 0;       // negative = forward
  let mouseX = 0, mouseY = 0;
  let yaw = 0, pitch = 0;
  let keys = {};
  let segments = [];      // active segment objects
  let nextSegZ = 0;       // z-position of next segment to spawn (negative)
  let themeIndex = 0;
  let currentTheme = THEMES[0];
  let frameId;

  /* ── MATERIALS CACHE ── */
  const matCache = {};
  function getWallMat(theme) {
    const k = 'wall_' + theme.name;
    if (!matCache[k]) {
      matCache[k] = new THREE.MeshStandardMaterial({
        color: theme.wall,
        roughness: 0.8,
        metalness: 0.3,
        emissive: new THREE.Color(theme.emissive).multiplyScalar(0.04),
      });
    }
    return matCache[k];
  }
  function getFloorMat(theme) {
    const k = 'floor_' + theme.name;
    if (!matCache[k]) {
      matCache[k] = new THREE.MeshStandardMaterial({
        color: theme.floor,
        roughness: 0.3,
        metalness: 0.7,
        emissive: new THREE.Color(theme.emissive).multiplyScalar(0.015),
      });
    }
    return matCache[k];
  }

  /* ── GEOMETRY CACHE ── */
  const geoWallSide = new THREE.BoxGeometry(0.2, SEG_HEIGHT, SEG_LENGTH);
  const geoWallTop = new THREE.BoxGeometry(SEG_WIDTH + 0.4, 0.2, SEG_LENGTH);
  const geoFloor = new THREE.BoxGeometry(SEG_WIDTH, 0.2, SEG_LENGTH);
  const geoTrim = new THREE.BoxGeometry(0.08, SEG_HEIGHT, SEG_LENGTH);
  const geoOrb = new THREE.SphereGeometry(0.12, 10, 10);
  const geoArch = new THREE.TorusGeometry(SEG_WIDTH * 0.5 - 0.2, 0.12, 8, 30, Math.PI);
  const geoColumn = new THREE.CylinderGeometry(0.12, 0.16, SEG_HEIGHT, 8);
  const geoCube = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const geoTetra = new THREE.TetrahedronGeometry(0.35);

  /* ── FLOATING OBJECTS ── */
  const floaters = []; // { mesh, speed, axis, phase }

  function spawnFloater(theme, z) {
    const r = Math.random();
    let geo, emColor;
    if (r < 0.33) { geo = geoCube; }
    else if (r < 0.66) { geo = geoTetra; }
    else { geo = geoOrb; }

    emColor = new THREE.Color(theme.accent);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      emissive: emColor,
      emissiveIntensity: 1.5,
      roughness: 0.2,
      metalness: 0.8,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * (SEG_WIDTH - 1),
      0.6 + Math.random() * 2.4,
      z - Math.random() * SEG_LENGTH
    );
    scene.add(mesh);
    floaters.push({ mesh, speed: 0.003 + Math.random() * 0.005, phase: Math.random() * Math.PI * 2, baseY: mesh.position.y });
    return mesh;
  }

  /* ── SEGMENT CREATION ── */
  function pickTheme() {
    // change theme every 3 rooms roughly
    if (Math.random() < 0.35) {
      themeIndex = (themeIndex + 1) % THEMES.length;
    }
    return THEMES[themeIndex];
  }

  function createSegment(zCenter) {
    const theme = pickTheme();
    const group = new THREE.Group();
    group.userData.theme = theme;
    group.userData.zCenter = zCenter;

    const wm = getWallMat(theme);
    const fm = getFloorMat(theme);

    /* Floor */
    const floor = new THREE.Mesh(geoFloor, fm);
    floor.position.set(0, 0, zCenter);
    floor.receiveShadow = true;
    group.add(floor);

    /* Ceiling */
    const ceil = new THREE.Mesh(geoFloor, wm);
    ceil.position.set(0, SEG_HEIGHT, zCenter);
    group.add(ceil);

    /* Left wall */
    const leftWall = new THREE.Mesh(geoWallSide, wm);
    leftWall.position.set(-SEG_WIDTH * 0.5, SEG_HEIGHT * 0.5, zCenter);
    leftWall.receiveShadow = true;
    group.add(leftWall);

    /* Right wall */
    const rightWall = new THREE.Mesh(geoWallSide, wm);
    rightWall.position.set(SEG_WIDTH * 0.5, SEG_HEIGHT * 0.5, zCenter);
    rightWall.receiveShadow = true;
    group.add(rightWall);

    /* Top cap */
    const top = new THREE.Mesh(geoWallTop, wm);
    top.position.set(0, SEG_HEIGHT, zCenter);
    group.add(top);

    /* Glowing trim strips */
    const trimMat = new THREE.MeshStandardMaterial({
      color: theme.accent,
      emissive: new THREE.Color(theme.accent),
      emissiveIntensity: 2,
      roughness: 0.1,
    });
    const trimL = new THREE.Mesh(geoTrim, trimMat);
    trimL.position.set(-SEG_WIDTH * 0.5 + 0.05, SEG_HEIGHT * 0.5, zCenter);
    group.add(trimL);
    const trimR = new THREE.Mesh(geoTrim, trimMat);
    trimR.position.set(SEG_WIDTH * 0.5 - 0.05, SEG_HEIGHT * 0.5, zCenter);
    group.add(trimR);

    /* Floor edge trim */
    const trimFL = new THREE.Mesh(geoTrim, trimMat);
    trimFL.position.set(-SEG_WIDTH * 0.5 + 0.05, 0.1, zCenter);
    group.add(trimFL);
    const trimFR = new THREE.Mesh(geoTrim, trimMat);
    trimFR.position.set(SEG_WIDTH * 0.5 - 0.05, 0.1, zCenter);
    group.add(trimFR);

    /* Arch at segment boundary */
    const archMat = new THREE.MeshStandardMaterial({
      color: theme.accent,
      emissive: new THREE.Color(theme.accent),
      emissiveIntensity: 1.5,
      roughness: 0.2,
    });
    const arch = new THREE.Mesh(geoArch, archMat);
    arch.rotation.z = Math.PI; // arc opens downward
    arch.position.set(0, SEG_HEIGHT, zCenter - SEG_LENGTH * 0.5);
    group.add(arch);

    /* Columns */
    const colMat = new THREE.MeshStandardMaterial({ color: theme.wall, roughness: 0.6, metalness: 0.5 });
    [-SEG_WIDTH * 0.5 + 0.3, SEG_WIDTH * 0.5 - 0.3].forEach(x => {
      const col = new THREE.Mesh(geoColumn, colMat);
      col.position.set(x, SEG_HEIGHT * 0.5, zCenter - SEG_LENGTH * 0.5);
      col.castShadow = true;
      group.add(col);
    });

    /* Point light */
    const lightColor = new THREE.Color(theme.accent);
    const light = new THREE.PointLight(lightColor, 2.5, 22);
    light.position.set(0, SEG_HEIGHT - 0.5, zCenter);
    light.castShadow = false;
    group.add(light);
    group.userData.light = light;

    /* Ambient floaters  */
    const nFloaters = 2 + Math.floor(Math.random() * 3);
    const segFloaters = [];
    for (let i = 0; i < nFloaters; i++) {
      const f = spawnFloater(theme, zCenter);
      segFloaters.push(f);
    }
    group.userData.floaters = segFloaters;

    scene.add(group);
    segments.push(group);
    return group;
  }

  /* ── INIT WORLD ── */
  function initWorld() {
    scene.background = new THREE.Color(0x02010a);

    /* Ambient */
    const ambient = new THREE.AmbientLight(0x111122, 0.5);
    scene.add(ambient);

    /* Spawn initial segments */
    for (let i = 0; i < POOL_SIZE; i++) {
      nextSegZ -= SEG_LENGTH;
      createSegment(nextSegZ + SEG_LENGTH * 0.5);
    }
  }

  /* ── POOL MANAGEMENT ── */
  function cullOldSegments() {
    // Remove segments that are behind the player
    for (let i = segments.length - 1; i >= 0; i--) {
      const seg = segments[i];
      const segFront = seg.userData.zCenter + SEG_LENGTH * 0.5;
      if (segFront > playerZ + SEG_LENGTH * 1.5) {
        // Remove floaters
        seg.userData.floaters.forEach(f => {
          scene.remove(f);
          const idx = floaters.findIndex(fl => fl.mesh === f);
          if (idx !== -1) floaters.splice(idx, 1);
        });
        scene.remove(seg);
        segments.splice(i, 1);
      }
    }
  }

  function ensureSegmentsAhead() {
    // count segments ahead of player
    const ahead = segments.filter(s => s.userData.zCenter < playerZ).length;
    if (ahead < SPAWN_AHEAD) {
      nextSegZ -= SEG_LENGTH;
      createSegment(nextSegZ + SEG_LENGTH * 0.5);
    }
  }

  /* ── INPUT ── */
  window.addEventListener('keydown', e => { keys[e.code] = true; });
  window.addEventListener('keyup', e => { keys[e.code] = false; });

  window.addEventListener('mousemove', e => {
    if (!started) return;
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  /* Pointer lock for immersive look */
  let pointerLocked = false;
  canvas.addEventListener('click', () => {
    if (started) canvas.requestPointerLock();
  });
  document.addEventListener('pointerlockchange', () => {
    pointerLocked = document.pointerLockElement === canvas;
  });
  document.addEventListener('mousemove', e => {
    if (!pointerLocked || !started) return;
    yaw -= e.movementX * 0.002;
    pitch -= e.movementY * 0.002;
    pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitch));
  });

  /* ── HUD UPDATE ── */
  function updateHUD() {
    const d = Math.floor(-playerZ / SEG_LENGTH);
    if (d !== depth) {
      depth = d;
      depthVal.textContent = depth.toString().padStart(4, '0');
    }
    roomVal.textContent = currentTheme.name;
  }

  /* ── UPDATE FOG/BG per zone ── */
  function updateAtmosphere() {
    // find the segment the player is inside
    const seg = segments.find(s =>
      playerZ >= s.userData.zCenter - SEG_LENGTH * 0.5 &&
      playerZ < s.userData.zCenter + SEG_LENGTH * 0.5
    );
    if (seg && seg.userData.theme !== currentTheme) {
      currentTheme = seg.userData.theme;
      const fc = new THREE.Color(currentTheme.fog);
      scene.fog.color.lerp(fc, 0.05);
      scene.background = scene.fog.color.clone();
    }
  }

  /* ── ANIMATE FLOATERS ── */
  function animateFloaters(t) {
    floaters.forEach(fl => {
      fl.mesh.rotation.x += fl.speed;
      fl.mesh.rotation.y += fl.speed * 1.3;
      fl.mesh.position.y = fl.baseY + Math.sin(t * 0.001 + fl.phase) * 0.25;
    });
  }

  /* ── ANIMATE LIGHTS ── */
  function animateLights(t) {
    segments.forEach(seg => {
      const light = seg.userData.light;
      if (light) {
        light.intensity = 2.0 + Math.sin(t * 0.002 + seg.userData.zCenter * 0.1) * 0.6;
      }
    });
  }

  /* ── MAIN LOOP ── */
  let lastTime = 0;
  function loop(timestamp) {
    frameId = requestAnimationFrame(loop);
    const dt = Math.min(timestamp - lastTime, 50);
    lastTime = timestamp;

    if (!started) return;

    /* Movement */
    let forward = 0, strafe = 0;
    if (keys['KeyW'] || keys['ArrowUp']) forward -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) forward += 0.4; // slow reverse
    if (keys['KeyA'] || keys['ArrowLeft']) strafe += 1;
    if (keys['KeyD'] || keys['ArrowRight']) strafe -= 1;

    // Auto-drift forward if no key pressed
    if (forward === 0) forward = -0.4;

    const sinY = Math.sin(yaw);
    const cosY = Math.cos(yaw);

    playerZ += (forward * cosY - strafe * sinY) * MOVE_SPEED;
    const px = camera.position.x + (forward * sinY + strafe * cosY) * STRAFE_SPEED;

    // Clamp x
    camera.position.x = Math.max(-SEG_WIDTH * 0.5 + 0.4, Math.min(SEG_WIDTH * 0.5 - 0.4, px));
    camera.position.z = playerZ;

    /* Look */
    if (!pointerLocked) {
      yaw = -mouseX * 0.6;
      pitch = -mouseY * 0.3;
    }
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;

    /* Head bob */
    camera.position.y = 1.7 + Math.sin(timestamp * 0.003) * 0.03;

    /* Scene management */
    cullOldSegments();
    ensureSegmentsAhead();
    updateAtmosphere();
    animateFloaters(timestamp);
    animateLights(timestamp);
    updateHUD();

    renderer.render(scene, camera);
  }

  /* ── ENTRY ── */
  enterBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
    hud.classList.add('visible');
    started = true;
    canvas.requestPointerLock();
  });

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

  initWorld();
  requestAnimationFrame(loop);

})();
