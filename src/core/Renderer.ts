import { Grid, Tile } from '../systems/Grid.js';
import { AssetLoader } from './AssetLoader.js';

export class Renderer {
  private ctx: CanvasRenderingContext2D;

  private assetLoader: AssetLoader;

  private cameraX: number = 0;

  private cameraY: number = 0;

  public constructor(ctx: CanvasRenderingContext2D, assetLoader: AssetLoader) {
    this.ctx = ctx;
    this.assetLoader = assetLoader;
  }

  /**
   * Clears the entire canvas with the specified color.
   *
   * @param [color='#000000'] - The fill color (default is black).
  */
  public clear(color: string = '#000000'): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  /**
   * Renders the visible portion of a grid onto the canvas.
   *
   * @param grid - The grid to render.
  */
  public renderGrid(grid: Grid): void {
    const tiles: Tile[][] = grid.getAllTiles();
    const tileSize: number = grid.getTileSize();
    const canvasWidth: number = this.ctx.canvas.width;
    const canvasHeight: number = this.ctx.canvas.height;

    const startX: number = Math.floor(this.cameraX / tileSize);
    const startY: number = Math.floor(this.cameraY / tileSize);
    const endX: number = Math.ceil((this.cameraX + canvasWidth) / tileSize);
    const endY: number = Math.ceil((this.cameraY + canvasHeight) / tileSize);

    for (let y: number = startY; y < endY; y++) {
      for (let x: number = startX; x < endX; x++) {
        if (x >= 0 && x < grid.getWidth() && y >= 0 && y < grid.getHeight()) {
          const tile: Tile | null = tiles[y][x];

          if (tile.type !== 'empty') {
            const asset: HTMLImageElement | undefined = this.assetLoader.get(tile.type);

            if (asset) {
              const screenX: number = x * tileSize - this.cameraX;
              const screenY: number = y * tileSize - this.cameraY;

              this.ctx.drawImage(
                asset,
                screenX,
                screenY,
                tileSize,
                tileSize
              );
            }
          }
        }
      }
    }
  }

  /**
   * Draws a background image stretched to fill the entire canvas.
   *
   * @param imageName - The name of the background image asset.
  */
  public drawBackground(imageName: string): void {
    const bg: HTMLImageElement | undefined = this.assetLoader.get(imageName);
    if (!bg) {
      return;
    }

    this.ctx.drawImage(bg, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  /**
   * Draws an image from the asset loader at the specified world coordinates.
   *
   * @param imageName - The name of the image asset to draw.
   * @param worldX - The x-coordinate in the game world.
   * @param worldY - The y-coordinate in the game world.
   * @param width - The width to draw the image.
   * @param height - The height to draw the image.
  */
  public drawImage(
    imageName: string,
    worldX: number,
    worldY: number,
    width: number,
    height: number
  ): void {
    const asset: HTMLImageElement | undefined = this.assetLoader.get(imageName);
    if (asset) {
      const screenX: number = worldX - this.cameraX;
      const screenY: number = worldY - this.cameraY;

      this.ctx.drawImage(asset, screenX, screenY, width, height);
    }
  }

  /**
   * Draws text on the canvas at the specified position with optional color and size.
   *
   * @param text - The text to draw.
   * @param x - The x-coordinate.
   * @param y - The y-coordinate.
   * @param [color='#ffffff'] - The text color (default is white).
   * @param [size=16] - The font size in pixels (default is 16).
  */
  public drawText(text: string, x: number, y: number, color: string = '#ffffff', size: number = 16): void {
    this.ctx.fillStyle = color;
    this.ctx.font = size + 'px Arial';
    this.ctx.fillText(text, x, y);
  }


  /**
   * Draws a filled rectangle on the canvas.
   *
   * @param x - The x-coordinate of the top-left corner.
   * @param y - The y-coordinate of the top-left corner.
   * @param width - The rectangle's width.
   * @param height - The rectangle's height.
   * @param color - The fill color.
   */
  public drawRect(x: number, y: number, width: number, height: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  public setCamera(x: number, y: number): void {
    this.cameraX = x;
    this.cameraY = y;
  }

  public getCameraX(): number {
    return this.cameraX;
  }

  public getCameraY(): number {
    return this.cameraY;
  }

  /**
   * Centers the camera on the specified world coordinates.
   *
   * @param worldX - The x-coordinate in the game world.
   * @param worldY - The y-coordinate in the game world.
  */
  public centerCameraOn(worldX: number, worldY: number): void {
    this.cameraX = worldX - this.ctx.canvas.width / 2;
    this.cameraY = worldY - this.ctx.canvas.height / 2;
  }
}
