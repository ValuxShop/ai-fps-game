export class Storm {
  constructor(scene) {
    this.radius = 500;
    this.center = new THREE.Vector3(0, 0, 0);
    this.damage = 10;

    this.mesh = new THREE.Mesh(
      new THREE.RingGeometry(this.radius - 5, this.radius, 64),
      new THREE.MeshBasicMaterial({ color: 0x7a00ff, side: THREE.DoubleSide })
    );
    this.mesh.rotation.x = -Math.PI / 2;
    scene.add(this.mesh);
  }

  update(dt, player) {
    this.radius -= dt * 5;
    this.mesh.geometry.dispose();
    this.mesh.geometry = new THREE.RingGeometry(this.radius - 5, this.radius, 64);

    if (player.mesh.position.distanceTo(this.center) > this.radius) {
      player.health -= this.damage * dt;
    }
  }
}
