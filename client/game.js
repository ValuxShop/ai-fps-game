import { Storm } from "./storm.js";
import { placeWall, handleBuildInput } from "./build.js";
import { initMultiplayer, updateServer } from "./multiplayer.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(2000, 2000),
  new THREE.MeshStandardMaterial({ color: 0x7cfc00 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Sky & Lighting
scene.background = new THREE.Color(0x1a2a4a);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(100, 300, 100);
scene.add(sun);

// Fog for depth
scene.fog = new THREE.Fog(0x1a2a4a, 10, 1000);

// Player
const player = {
  mesh: new THREE.Mesh(
    new THREE.BoxGeometry(2, 5, 2),
    new THREE.MeshStandardMaterial({ color: 0x0000ff })
  ),
  health: 100,
  speed: 0.5,
  velocity: new THREE.Vector3(),
  yaw: 0,
  pitch: 0,
  name: "ProGame Guild"
};
player.mesh.position.y = 2.5;
scene.add(player.mesh);

// Camera Setup
const cameraHolder = new THREE.Group();
cameraHolder.add(camera);
player.mesh.add(cameraHolder);
camera.position.set(0, 5, 10);
camera.lookAt(0, 2, -10);

// Menu Camera Position
const menuCameraPos = new THREE.Vector3(0, 5, 15);
const menuCameraLookAt = new THREE.Vector3(0, 5, 0);
camera.position.copy(menuCameraPos);
camera.lookAt(menuCameraLookAt);

// Input Handling
let keybinds = {
  forward: 'KeyW',
  backward: 'KeyS',
  left: 'KeyA',
  right: 'KeyD',
  build: 'KeyB',
  rotate: 'KeyR'
};
const keys = {};
window.addEventListener("keydown", e => { keys[e.code] = true; });
window.addEventListener("keyup", e => { keys[e.code] = false; });

// Settings & UI Elements
const menu = document.getElementById("menu");
const playBtn = document.getElementById("playBtn");
const settingsBtn = document.getElementById("settingsBtn");
const settingsOverlay = document.getElementById("settingsOverlay");
const closeSettings = document.getElementById("closeSettings");
const keybindsList = document.getElementById("keybindsList");
const usernameInput = document.getElementById("usernameInput");
const modeBtn = document.getElementById("modeBtn");
const currentModeDisplay = document.getElementById("currentModeDisplay");

let gameStarted = false;
let currentMode = "1v1";
const modes = ["1v1", "Free For All", "Team Deathmatch"];

// Mode Switcher
modeBtn.onclick = () => {
  const nextIdx = (modes.indexOf(currentMode) + 1) % modes.length;
  currentMode = modes[nextIdx];
  currentModeDisplay.innerText = currentMode;
};

// Settings Logic
settingsBtn.onclick = () => {
  settingsOverlay.style.display = "flex";
  renderKeybinds();
};

closeSettings.onclick = () => {
  settingsOverlay.style.display = "none";
};

function renderKeybinds() {
  keybindsList.innerHTML = "";
  for (let action in keybinds) {
    const row = document.createElement("div");
    row.className = "keybind-row";
    row.innerHTML = `
      <span>${action.toUpperCase()}</span>
      <div class="key-btn" id="bind-${action}">${keybinds[action]}</div>
    `;
    keybindsList.appendChild(row);
    
    const btn = document.getElementById(`bind-${action}`);
    btn.onclick = (e) => {
      e.stopPropagation();
      // Clear any other waiting buttons
      document.querySelectorAll('.key-btn.waiting').forEach(b => {
        const act = b.id.replace('bind-', '');
        b.innerText = keybinds[act];
        b.classList.remove('waiting');
      });

      btn.innerText = "...";
      btn.classList.add("waiting");
      
      const handler = (event) => {
        event.preventDefault();
        keybinds[action] = event.code;
        btn.innerText = event.code;
        btn.classList.remove("waiting");
        window.removeEventListener("keydown", handler, true);
      };
      // Use capture phase to intercept before game's general listener
      window.addEventListener("keydown", handler, true);
    };
  }
}

usernameInput.oninput = () => {
  player.name = usernameInput.value;
};

playBtn.onclick = () => {
  renderer.domElement.requestPointerLock();
};

// HUD Elements
const hud = document.getElementById("hud");
const fpsDisplay = document.getElementById("fpsDisplay");
const timerDisplay = document.getElementById("timerDisplay");
const userDisplay = document.getElementById("userDisplay");
const healthFill = document.getElementById("healthFill");

let frameCount = 0;
let lastFpsUpdate = 0;
let gameStartTime = 0;

function updateHUD(time) {
  if (!gameStarted) {
    hud.style.display = "none";
    return;
  }
  hud.style.display = "block";
  
  // FPS
  frameCount++;
  if (time - lastFpsUpdate > 1000) {
    fpsDisplay.innerText = `${frameCount} FPS`;
    frameCount = 0;
    lastFpsUpdate = time;
  }

  // Timer
  const elapsed = Math.floor((time - gameStartTime) / 1000);
  const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const secs = (elapsed % 60).toString().padStart(2, '0');
  timerDisplay.innerText = `${mins}:${secs}`;

  // User
  userDisplay.innerText = player.name || "(Guest)";

  // Health
  healthFill.style.width = `${player.health}%`;
}

document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement === renderer.domElement) {
    menu.style.display = "none";
    gameStarted = true;
    gameStartTime = performance.now();
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 2, -10);
  } else {
    menu.style.display = "flex";
    gameStarted = false;
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 5, 0);
  }
});

document.addEventListener("mousemove", (e) => {
  if (!gameStarted) return;
  player.yaw -= e.movementX * 0.002;
  player.pitch -= e.movementY * 0.002;
  player.pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, player.pitch));
  
  player.mesh.rotation.y = player.yaw;
  cameraHolder.rotation.x = player.pitch;
});

// Trees
for (let i = 0; i < 50; i++) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 8),
    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
  );
  trunk.position.set(
    (Math.random() - 0.5) * 800,
    4,
    (Math.random() - 0.5) * 800
  );
  scene.add(trunk);
}

// Storm
const storm = new Storm(scene);

// Multiplayer
initMultiplayer(scene, player.mesh);

let last = performance.now();
function animate(time) {
  const delta = (time - last) / 1000;
  last = time;

  if (gameStarted) {
    const move = new THREE.Vector3();
    if (keys[keybinds.forward]) move.z -= 1;
    if (keys[keybinds.backward]) move.z += 1;
    if (keys[keybinds.left]) move.x -= 1;
    if (keys[keybinds.right]) move.x += 1;
    
    move.normalize().multiplyScalar(player.speed);
    move.applyQuaternion(player.mesh.quaternion);
    player.mesh.position.x += move.x;
    player.mesh.position.z += move.z;

    storm.update(delta, player);
    handleBuildInput(scene, player.mesh);
    updateServer(player.mesh, player.health, player.name);
  }

  updateHUD(time);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
