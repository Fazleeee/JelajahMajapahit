// 2D Spatial Hash Grid untuk Akselerasi Kolisi & Deteksi Objek Terdekat O(1)

export class SpatialHashGrid {
  constructor(cellSize = 20) {
    this.cellSize = cellSize;
    this.cells = new Map();
  }

  _getKey(cellX, cellZ) {
    return `${cellX}_${cellZ}`;
  }

  _getCell(cellX, cellZ) {
    const key = this._getKey(cellX, cellZ);
    let cell = this.cells.get(key);
    if (!cell) {
      cell = { colliders: [], landmarks: [], npcs: [] };
      this.cells.set(key, cell);
    }
    return cell;
  }

  clear() {
    this.cells.clear();
  }

  // Masukkan Box Collider ke semua cell yang dilewatinya
  insertCollider(collider) {
    let minX, maxX, minZ, maxZ;
    if (collider.type === 'circle') {
      minX = collider.x - collider.radius;
      maxX = collider.x + collider.radius;
      minZ = collider.z - collider.radius;
      maxZ = collider.z + collider.radius;
    } else {
      minX = collider.xMin;
      maxX = collider.xMax;
      minZ = collider.zMin;
      maxZ = collider.zMax;
    }

    const startCX = Math.floor(minX / this.cellSize);
    const endCX = Math.floor(maxX / this.cellSize);
    const startCZ = Math.floor(minZ / this.cellSize);
    const endCZ = Math.floor(maxZ / this.cellSize);

    for (let cx = startCX; cx <= endCX; cx++) {
      for (let cz = startCZ; cz <= endCZ; cz++) {
        this._getCell(cx, cz).colliders.push(collider);
      }
    }
  }

  insertLandmark(landmark) {
    const minX = landmark.position.x - landmark.radius;
    const maxX = landmark.position.x + landmark.radius;
    const minZ = landmark.position.z - landmark.radius;
    const maxZ = landmark.position.z + landmark.radius;

    const startCX = Math.floor(minX / this.cellSize);
    const endCX = Math.floor(maxX / this.cellSize);
    const startCZ = Math.floor(minZ / this.cellSize);
    const endCZ = Math.floor(maxZ / this.cellSize);

    for (let cx = startCX; cx <= endCX; cx++) {
      for (let cz = startCZ; cz <= endCZ; cz++) {
        this._getCell(cx, cz).landmarks.push(landmark);
      }
    }
  }

  insertNPC(npc) {
    const cx = Math.floor(npc.coords.x / this.cellSize);
    const cz = Math.floor(npc.coords.z / this.cellSize);
    this._getCell(cx, cz).npcs.push(npc);
  }

  populate(colliders = [], landmarks = [], npcs = []) {
    this.clear();
    for (const c of colliders) this.insertCollider(c);
    for (const lm of landmarks) this.insertLandmark(lm);
    for (const n of npcs) this.insertNPC(n);
  }

  // Dapatkan collider di area sekitar pemain (O(1) look-up)
  queryColliders(x, z, radius = 2) {
    const startCX = Math.floor((x - radius) / this.cellSize);
    const endCX = Math.floor((x + radius) / this.cellSize);
    const startCZ = Math.floor((z - radius) / this.cellSize);
    const endCZ = Math.floor((z + radius) / this.cellSize);

    const result = [];
    const seen = new Set();

    for (let cx = startCX; cx <= endCX; cx++) {
      for (let cz = startCZ; cz <= endCZ; cz++) {
        const key = this._getKey(cx, cz);
        const cell = this.cells.get(key);
        if (cell && cell.colliders.length > 0) {
          for (let i = 0; i < cell.colliders.length; i++) {
            const col = cell.colliders[i];
            if (!seen.has(col)) {
              seen.add(col);
              result.push(col);
            }
          }
        }
      }
    }
    return result;
  }

  // Dapatkan landmark terdekat
  queryLandmarks(x, z, radius = 24) {
    const startCX = Math.floor((x - radius) / this.cellSize);
    const endCX = Math.floor((x + radius) / this.cellSize);
    const startCZ = Math.floor((z - radius) / this.cellSize);
    const endCZ = Math.floor((z + radius) / this.cellSize);

    const result = [];
    const seen = new Set();

    for (let cx = startCX; cx <= endCX; cx++) {
      for (let cz = startCZ; cz <= endCZ; cz++) {
        const key = this._getKey(cx, cz);
        const cell = this.cells.get(key);
        if (cell && cell.landmarks.length > 0) {
          for (let i = 0; i < cell.landmarks.length; i++) {
            const lm = cell.landmarks[i];
            if (!seen.has(lm)) {
              seen.add(lm);
              result.push(lm);
            }
          }
        }
      }
    }
    return result;
  }
}

export const spatialGrid = new SpatialHashGrid(20);
