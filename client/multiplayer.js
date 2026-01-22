const socket = io();
let others = {};

export function initMultiplayer(scene, playerMesh) {
  socket.on("init", players => {
    for (let id in players) {
      if (id === socket.id) continue;
      spawn(scene, players[id]);
    }
  });

  socket.on("playerJoined", p => spawn(scene, p));
  socket.on("playerLeft", id => {
    scene.remove(others[id]);
    delete others[id];
  });

  socket.on("updatePlayer", p => {
    if (!others[p.id]) return;
    others[p.id].position.set(p.x, p.y, p.z);
  });
}

export function updateServer(mesh, health, name) {
  socket.emit("update", {
    x: mesh.position.x,
    y: mesh.position.y,
    z: mesh.position.z,
    health,
    name
  });
}

function spawn(scene, p) {
  // We identify the local player by their socket.id
  // This prevents spawning a duplicate mesh for ourselves
  if (p.id === socket.id) return;
  
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(2, 5, 2),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
  );
  m.position.set(p.x, p.y, p.z);
  scene.add(m);
  others[p.id] = m;
}
