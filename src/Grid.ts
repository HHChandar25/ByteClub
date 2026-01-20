export interface Tile {
  x: number;
  y: number;
  type: string;
}

export class Grid {
  private tileSize: number;
  private width: number;
  private height: number;
  private tiles: Tile[][];

  public constructor(width: number, height: number, tileSize: number) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
    this.tiles = [];

    for (let y: number = 0; y < height; y++) {
      this.tiles[y] = [];
      for (let x: number = 0; x < width; x++) {
        this.tiles[y][x] = {
          x: x,
          y: y,
          type: 'empty'
        };
      }
    }
  }

  public setTile(x: number, y: number, type: string): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.tiles[y][x].type = type;
    }
  }

  public getTile(x: number, y: number): Tile | null {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      return this.tiles[y][x];
    }
    return null;
  }

  public getTileAtWorldPos(worldX: number, worldY: number): Tile | null {
    const x: number = Math.floor(worldX / this.tileSize);
    const y: number = Math.floor(worldY / this.tileSize);
    return this.getTile(x, y);
  }

  public gridToWorld(gridX: number, gridY: number): { x: number, y: number } {
    return {
      x: gridX * this.tileSize,
      y: gridY * this.tileSize
    };
  }

  public worldToGrid(worldX: number, worldY: number): { x: number, y: number } {
    return {
      x: Math.floor(worldX / this.tileSize),
      y: Math.floor(worldY / this.tileSize)
    };
  }

  public isValid(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  public isWalkable(x: number, y: number): boolean {
    const tile: Tile | null = this.getTile(x, y);
    if (!tile) return false;

    const walkableTiles: string[] = ['floor1', 'floor2', 'floor3', 'empty'];
    return walkableTiles.includes(tile.type);
  }

  public fillArea(startX: number, startY: number, endX: number, endY: number, type: string): void {
    for (let y: number = startY; y <= endY; y++) {
      for (let x: number = startX; x <= endX; x++) {
        this.setTile(x, y, type);
      }
    }
  }

  public getAllTiles(): Tile[][] {
    return this.tiles;
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }

  public getTileSize(): number {
    return this.tileSize;
  }

  public getWorldWidth(): number {
    return this.width * this.tileSize;
  }

  public getWorldHeight(): number {
    return this.height * this.tileSize;
  }
}
