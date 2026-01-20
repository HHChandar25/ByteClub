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

  /**
   * Converts grid coordinates to top-left world pixel coordinates.
   * * @param gridX - The X index on the grid.
   * @param gridY - The Y index on the grid.
   * @returns An object containing the world X and Y pixel positions.
   */
  public gridToWorld(gridX: number, gridY: number): { x: number, y: number } {
    return {
      x: gridX * this.tileSize,
      y: gridY * this.tileSize
    };
  }

  /**
   * Converts world pixel coordinates to grid indices.
   * * @param worldX - Horizontal pixel position.
   * @param worldY - Vertical pixel position.
   * @returns An object containing the corresponding grid X and Y indices.
   */
  public worldToGrid(worldX: number, worldY: number): { x: number, y: number } {
    return {
      x: Math.floor(worldX / this.tileSize),
      y: Math.floor(worldY / this.tileSize)
    };
  }

  /**
   * Validates if a set of grid coordinates exists within the defined grid dimensions.
   * * @param x - Grid X-coordinate to check.
   * @param y - Grid Y-coordinate to check.
   * @returns True if the coordinates are within bounds.
   */
  public isValid(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  /**
   * Checks if a tile at a specific grid position is considered traversable.
   * * @param x - Grid X-coordinate.
   * @param y - Grid Y-coordinate.
   * @returns True if the tile type is in the walkable whitelist.
   */
  public isWalkable(x: number, y: number): boolean {
    const tile: Tile | null = this.getTile(x, y);
    if (!tile) {
      return false;
    }
    const walkableTiles: string[] = ['floor1', 'floor2', 'floor3', 'empty'];
    return walkableTiles.includes(tile.type);
  }

  /**
   * Batch updates a rectangular area of tiles to a specific type.
   * * @param startX - Starting grid X-coordinate.
   * @param startY - Starting grid Y-coordinate.
   * @param endX - Ending grid X-coordinate.
   * @param endY - Ending grid Y-coordinate.
   * @param type - The tile type to apply to the area.
  */
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
