import { Storm } from "./storm.js";
import { placeWall, handleBuildInput } from "./build.js";
import { initMultiplayer, updateServer } from "./multiplayer.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(100, 200, 100);
scene.add(sun);

// Ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(1000, 1000),
  new THREE.MeshStandardMaterial({ color: 0x2e8b57 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Player
const player = {
  mesh: new THREE.Mesh(
    new THREE.BoxGeometry(2, 5, 2),
    new THREE.MeshStandardMaterial({ color: 0x0000ff })
  ),
  health: 100
};
player.mesh.position.y = 2.5;
scene.add(player.mesh);

camera.position.set(0, 10, 20);
camera.lookAt(player.mesh.position);

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

  storm.update(delta, player);

  handleBuildInput(scene, player.mesh);
  updateServer(player.mesh, player.health);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
