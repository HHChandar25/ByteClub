import { AssetLoader, Asset } from './AssetLoader.js';
import { Renderer } from './Renderer.js';
import { Grid } from '../systems/Grid.js';
import { InputHandler } from '../systems/InputHandler.js';
import { LevelManager } from '../systems/LevelManager.js';
import { Player } from '../entities/Player.js';
import { PushableObject } from '../entities/PushableObject.js';
import { CommandBlock } from '../entities/CommandBlock.js';
import { Obstacle } from '../entities/Obstacle.js';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private assetLoader: AssetLoader;
  private renderer: Renderer;
  private grid: Grid;
  private inputHandler: InputHandler;
  private levelManager: LevelManager;

  private player!: Player;
  private pushables: PushableObject[] = [];
  private commandBlocks: CommandBlock[] = [];
  private obstacles: Obstacle[] = [];

  private exitTile!: { x: number; y: number };

  private isRunning = false;
  private lastTime = 0;
  private levelComplete = false;

  public constructor(canvasId: string) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) throw new Error('Canvas not found');

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2D context');

    this.canvas = canvas;
    this.ctx = ctx;

    this.assetLoader = new AssetLoader();
    this.renderer = new Renderer(ctx, this.assetLoader);
    this.inputHandler = new InputHandler();
    this.levelManager = new LevelManager();

    const tileSize = 64;
    this.grid = new Grid(
      Math.floor(canvas.width / tileSize),
      Math.floor(canvas.height / tileSize),
      tileSize
    );

    this.loadCurrentLevel();
  }

  private loadCurrentLevel(): void {
    const data = this.levelManager.loadLevel(this.grid, this.grid.getTileSize());

    this.player = new Player(
      data.playerStart.x,
      data.playerStart.y,
      this.grid.getTileSize()
    );

    this.pushables = data.pushables;
    this.commandBlocks = data.commandBlocks;
    this.obstacles = data.obstacles;
    this.exitTile = data.exit;

    this.levelComplete = false;
  }

  public loadAssets(assets: Asset[], onComplete: () => void): void {
    this.assetLoader.load(assets, onComplete);
  }

  public start(): void {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  private loop(time: number): void {
    if (!this.isRunning) return;

    const deltaTime = time - this.lastTime;
    this.lastTime = time;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame(t => this.loop(t));
  }

  private update(deltaTime: number): void {
    if (this.levelComplete) return;

    // --- Command block activation logic ---
    for (const cmd of this.commandBlocks) {
      const pos = cmd.getGridPosition();
      cmd.checkActivation(this.grid, pos.x, pos.y);
      cmd.update(deltaTime);
    }

    // --- Player movement ---
    const move = this.inputHandler.getMovementDirection();
    if (move.x !== 0 || move.y !== 0) {
      this.player.tryMove(
        move.x,
        move.y,
        this.grid,
        this.pushables,
        false,
        this.obstacles
      );
    }

    this.player.update(deltaTime);

    for (const p of this.pushables) p.update(deltaTime);
    for (const o of this.obstacles) o.update(deltaTime);
    for (const c of this.commandBlocks) c.update(deltaTime);

    const playerPos = this.player.getGridPosition();
    if (
      playerPos.x === this.exitTile.x &&
      playerPos.y === this.exitTile.y &&
      !this.player.getIsMoving()
    ) {
      this.levelComplete = true;
    }
  }
}
