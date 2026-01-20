export class Renderer {
    ctx;
    assetLoader;
    cameraX = 0;
    cameraY = 0;
    constructor(ctx, assetLoader) {
        this.ctx = ctx;
        this.assetLoader = assetLoader;
    }
    clear(color = '#000000') {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
    renderGrid(grid) {
        const tiles = grid.getAllTiles();
        const tileSize = grid.getTileSize();
        const canvasWidth = this.ctx.canvas.width;
        const canvasHeight = this.ctx.canvas.height;
        const startX = Math.floor(this.cameraX / tileSize);
        const startY = Math.floor(this.cameraY / tileSize);
        const endX = Math.ceil((this.cameraX + canvasWidth) / tileSize);
        const endY = Math.ceil((this.cameraY + canvasHeight) / tileSize);
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                if (x >= 0 && x < grid.getWidth() && y >= 0 && y < grid.getHeight()) {
                    const tile = tiles[y][x];
                    if (tile.type !== 'empty') {
                        const asset = this.assetLoader.get(tile.type);
                        if (asset) {
                            const screenX = x * tileSize - this.cameraX;
                            const screenY = y * tileSize - this.cameraY;
                            this.ctx.drawImage(asset, screenX, screenY, tileSize, tileSize);
                        }
                    }
                }
            }
        }
    }
    drawBackground(imageName) {
        const bg = this.assetLoader.get(imageName);
        if (!bg) {
            return;
        }
        this.ctx.drawImage(bg, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
    drawImage(imageName, worldX, worldY, width, height) {
        const asset = this.assetLoader.get(imageName);
        if (asset) {
            const screenX = worldX - this.cameraX;
            const screenY = worldY - this.cameraY;
            this.ctx.drawImage(asset, screenX, screenY, width, height);
        }
    }
    drawText(text, x, y, color = '#ffffff', size = 16) {
        this.ctx.fillStyle = color;
        this.ctx.font = size + 'px Arial';
        this.ctx.fillText(text, x, y);
    }
    drawRect(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }
    setCamera(x, y) {
        this.cameraX = x;
        this.cameraY = y;
    }
    getCameraX() {
        return this.cameraX;
    }
    getCameraY() {
        return this.cameraY;
    }
    centerCameraOn(worldX, worldY) {
        this.cameraX = worldX - this.ctx.canvas.width / 2;
        this.cameraY = worldY - this.ctx.canvas.height / 2;
    }
}
//# sourceMappingURL=Renderer.js.map