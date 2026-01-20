export class Grid {
    tileSize;
    width;
    height;
    tiles;
    constructor(width, height, tileSize) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.tiles = [];
        for (let y = 0; y < height; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < width; x++) {
                this.tiles[y][x] = {
                    x: x,
                    y: y,
                    type: 'empty'
                };
            }
        }
    }
    setTile(x, y, type) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.tiles[y][x].type = type;
        }
    }
    getTile(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.tiles[y][x];
        }
        return null;
    }
    getTileAtWorldPos(worldX, worldY) {
        const x = Math.floor(worldX / this.tileSize);
        const y = Math.floor(worldY / this.tileSize);
        return this.getTile(x, y);
    }
    gridToWorld(gridX, gridY) {
        return {
            x: gridX * this.tileSize,
            y: gridY * this.tileSize
        };
    }
    worldToGrid(worldX, worldY) {
        return {
            x: Math.floor(worldX / this.tileSize),
            y: Math.floor(worldY / this.tileSize)
        };
    }
    isValid(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
    isWalkable(x, y) {
        const tile = this.getTile(x, y);
        if (!tile) {
            return false;
        }
        const walkableTiles = ['floor1', 'floor2', 'floor3', 'empty'];
        return walkableTiles.includes(tile.type);
    }
    fillArea(startX, startY, endX, endY, type) {
        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                this.setTile(x, y, type);
            }
        }
    }
    getAllTiles() {
        return this.tiles;
    }
    getWidth() {
        return this.width;
    }
    getHeight() {
        return this.height;
    }
    getTileSize() {
        return this.tileSize;
    }
    getWorldWidth() {
        return this.width * this.tileSize;
    }
    getWorldHeight() {
        return this.height * this.tileSize;
    }
}
//# sourceMappingURL=Grid.js.map