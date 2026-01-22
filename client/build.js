let rotation = 0;

export function handleBuildInput(scene, player) {
  window.onkeydown = e => {
    if (e.key === "r") rotation += Math.PI / 2;
    if (e.key === "b") placeWall(scene, player.position);
  };
}

export function placeWall(scene, pos) {
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 1),
    new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
  );
  wall.position.set(
    Math.round(pos.x / 5) * 5,
    5,
    Math.round(pos.z / 5) * 5
  );
  wall.rotation.y = rotation;
  scene.add(wall);
}
