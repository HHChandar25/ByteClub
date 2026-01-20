import { AssetLoader, Asset } from './AssetLoader.js';
import { Renderer } from './Renderer.js';
import { Grid, Tile } from '../systems/Grid.js';
import { InputHandler } from '../systems/InputHandler.js';
import { LevelManager } from '../systems/LevelManager.js';
import { Player } from '../entities/Player.js';
import { PushableObject } from '../entities/PushableObject.js';
import { CommandBlock } from '../entities/CommandBlock.js';
import { Obstacle } from '../entities/Obstacle.js';
import { GameObject } from '../entities/GameObject.js';
import { ElectricityEffect } from '../effects/ElectricityEffect.js';
import { PushablePlusBlock } from '../entities/PushablePlusBlock.js';

interface Pushable extends GameObject {
  push(dx: number, dy: number, tileSize: number): void;
}

export class Game {
  private canvas: HTMLCanvasElement;

  private ctx: CanvasRenderingContext2D;

  private assetLoader: AssetLoader;

  private renderer: Renderer;

  private grid: Grid;

  private inputHandler: InputHandler;

  private levelManager: LevelManager;

  private player: Player;

  private pushables: PushableObject[] = [];

  private pushablePlusBlocks: PushablePlusBlock[] = [];

  private commandBlocks: CommandBlock[] = [];

  private obstacles: Obstacle[] = [];

  private exitTile: { x: number, y: number };

  private electricityEffects: ElectricityEffect[] = [];

  private isRunning: boolean = false;

  private lastTime: number = 0;

  private levelComplete: boolean = false;

  private levelCompleteTimer: number = 0;

  private gameComplete: boolean = false;

  public constructor(canvasId: string) {
    const canvas: HTMLCanvasElement | null = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('Canvas not found');
    }

    this.canvas = canvas;
    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2d context');
    }

    this.ctx = ctx;
    this.assetLoader = new AssetLoader();
    this.renderer = new Renderer(ctx, this.assetLoader);
    this.inputHandler = new InputHandler();
    this.levelManager = new LevelManager();

    const tileSize: number = 64;
    const gridWidth: number = Math.floor(this.canvas.width / tileSize);
    const gridHeight: number = Math.floor(this.canvas.height / tileSize);

    this.grid = new Grid(gridWidth, gridHeight, tileSize);

    // eslint-disable-next-line @typescript-eslint/typedef
    const levelData = this.levelManager.loadLevel(this.grid, tileSize);
    this.loadCurrentLevel();
    this.player = new Player(levelData.playerStart.x, levelData.playerStart.y, tileSize);
    this.pushables = levelData.pushables;
    this.exitTile = levelData.exit;

    const offsetX: number = Math.floor((this.canvas.width - this.grid.getWorldWidth()) / 2);
    const offsetY: number = Math.floor((this.canvas.height - this.grid.getWorldHeight()) / 2);
    this.renderer.setCamera(-offsetX, -offsetY);
  }

  private loadCurrentLevel(): void {
    const tileSize: number = this.grid.getTileSize();
    // eslint-disable-next-line @typescript-eslint/typedef
    const levelData = this.levelManager.loadLevel(this.grid, tileSize);

    this.player = new Player(levelData.playerStart.x, levelData.playerStart.y, tileSize);
    this.pushables = levelData.pushables;
    this.pushablePlusBlocks = levelData.pushablePlusBlocks;
    this.commandBlocks = levelData.commandBlocks;
    this.obstacles = levelData.obstacles;
    this.exitTile = levelData.exit;
    this.levelComplete = false;
    this.levelCompleteTimer = 0;
  }

  public loadAssets(assets: Asset[], onComplete: () => void): void {
    this.assetLoader.load(assets, onComplete);
  }

  /**
   *
   */
  public start(): void {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  /**
   *
   */
  public stop(): void {
    this.isRunning = false;
  }

  private loop(currentTime: number): void {
    if (!this.isRunning) {
      return;
    }

    const deltaTime: number = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame((time: number): void => this.loop(time));
  }

  private update(deltaTime: number): void {
    if (this.levelComplete) {
      this.levelCompleteTimer += deltaTime;

      if (this.levelCompleteTimer >= 1500) {
        if (this.levelManager.nextLevel()) {
          this.loadCurrentLevel();
        } else {
          this.gameComplete = true;
        }
      }
      return;
    }

    this.updateElectricityEffects(deltaTime);

    for (const cmdBlock of this.commandBlocks) {
      const pos: { x: number; y: number } = cmdBlock.getGridPosition();
      const isInCircuit: boolean = this.checkCircuitCompletion(pos.x, pos.y);
      cmdBlock.checkActivation(this.grid, pos.x, pos.y, isInCircuit);

      const shouldExecute: boolean = cmdBlock.update(deltaTime);
      if (shouldExecute) {
        this.executeCommand(cmdBlock);
      }
    }

    const movement: { x: number; y: number } = this.inputHandler.getMovementDirection();
    const isHolding: boolean = this.inputHandler.isShiftHeld();

    if (movement.x !== 0 || movement.y !== 0) {
      const grayCommandBlocks: CommandBlock[] = this.commandBlocks.filter((block: CommandBlock): boolean => block.getBlockColor() === 'gray');
      const nonGrayCommandBlocks: CommandBlock[] = this.commandBlocks.filter((block: CommandBlock): boolean => block.getBlockColor() !== 'gray');
      const allPushables: Pushable[] = [
        ...this.pushables,
        ...this.pushablePlusBlocks,
        ...grayCommandBlocks
      ];
      const allObstacles: Obstacle[] = [
        ...this.obstacles
      ];

      // Add non-gray command blocks as obstacles (they can't be pushed by player)
      for (const cmdBlock of nonGrayCommandBlocks) {
        // Type assertion is safe here because of treating command blocks as obstacles for collision
        allObstacles.push(cmdBlock as unknown as Obstacle);
      }

      this.player.tryMove(movement.x, movement.y, this.grid, allPushables, isHolding, allObstacles);
    }

    this.player.update(deltaTime);

    for (const pushable of this.pushables) {
      pushable.update(deltaTime);
    }

    for (const plusBlock of this.pushablePlusBlocks) {
      plusBlock.update(deltaTime);
    }

    for (const cmdBlock of this.commandBlocks) {
      cmdBlock.update(deltaTime);
    }

    for (const obstacle of this.obstacles) {
      obstacle.update(deltaTime);
    }

    const playerPos: { x: number; y: number } = this.player.getGridPosition();
    if (playerPos.x === this.exitTile.x &&
        playerPos.y === this.exitTile.y && !this.player.getIsMoving()) {
      this.levelComplete = true;
    }

    if (this.inputHandler.isKeyPressed('r') || this.inputHandler.isKeyPressed('R')) {
      this.loadCurrentLevel();
    }
  }

  private checkCircuitCompletion(cmdX: number, cmdY: number): boolean {
    let leftPlusX: number = -1;
    for (let x: number = cmdX - 1; x >= 0; x--) {
      const tile: Tile | null = this.grid.getTile(x, cmdY);
      if (tile?.type === 'plus-block') {
        leftPlusX = x;
        break;
      }
      const moveablePlus: PushablePlusBlock | null = this.getMoveablePlusAt(x, cmdY);
      if (moveablePlus) {
        leftPlusX = x;
        break;
      }
      if (!tile || tile.type === 'wall-start' || tile.type === 'wall-end') {
        break;
      }
    }

    let rightMinusX: number = -1;
    for (let x: number = cmdX + 1; x < this.grid.getWidth(); x++) {
      const tile: Tile | null = this.grid.getTile(x, cmdY);
      if (tile?.type === 'minus-block') {
        rightMinusX = x;
        break;
      }
      if (!tile || tile.type === 'wall-start' || tile.type === 'wall-end') {
        break;
      }
    }

    if (leftPlusX !== -1 && rightMinusX !== -1) {
      for (let x: number = leftPlusX + 1; x < rightMinusX; x++) {
        if (!this.getCommandBlockAt(x, cmdY)) {
          return false;
        }
      }
      return true;
    }

    let upPlusY: number = -1;
    for (let y: number = cmdY - 1; y >= 0; y--) {
      const tile: Tile | null = this.grid.getTile(cmdX, y);
      if (tile?.type === 'plus-block') {
        upPlusY = y;
        break;
      }
      const moveablePlus: PushablePlusBlock | null = this.getMoveablePlusAt(cmdX, y);
      if (moveablePlus) {
        upPlusY = y;
        break;
      }
      if (!tile || tile.type === 'wall-start' || tile.type === 'wall-end') {
        break;
      }
    }

    let downMinusY: number = -1;
    for (let y: number = cmdY + 1; y < this.grid.getHeight(); y++) {
      const tile: Tile | null = this.grid.getTile(cmdX, y);
      if (tile?.type === 'minus-block') {
        downMinusY = y;
        break;
      }
      if (!tile || tile.type === 'wall-start' || tile.type === 'wall-end') {
        break;
      }
    }

    if (upPlusY !== -1 && downMinusY !== -1) {
      for (let y: number = upPlusY + 1; y < downMinusY; y++) {
        if (!this.getCommandBlockAt(cmdX, y)) {
          return false;
        }
      }
      return true;
    }

    let upMinusY: number = -1;
    for (let y: number = cmdY - 1; y >= 0; y--) {
      const tile: Tile | null = this.grid.getTile(cmdX, y);
      if (tile?.type === 'minus-block') {
        upMinusY = y;
        break;
      }
      if (!tile || tile.type === 'wall-start' || tile.type === 'wall-end') {
        break;
      }
    }

    let downPlusY: number = -1;
    for (let y: number = cmdY + 1; y < this.grid.getHeight(); y++) {
      const tile: Tile | null = this.grid.getTile(cmdX, y);
      if (tile?.type === 'plus-block') {
        downPlusY = y;
        break;
      }
      const moveablePlus: PushablePlusBlock | null = this.getMoveablePlusAt(cmdX, y);
      if (moveablePlus) {
        downPlusY = y;
        break;
      }
      if (!tile || tile.type === 'wall-start' || tile.type === 'wall-end') {
        break;
      }
    }

    if (upMinusY !== -1 && downPlusY !== -1) {
      for (let y: number = upMinusY + 1; y < downPlusY; y++) {
        if (!this.getCommandBlockAt(cmdX, y)) {
          return false;
        }
      }
      return true;
    }

    return false;
  }

  private getMoveablePlusAt(gridX: number, gridY: number): PushablePlusBlock | null {
    for (const plusBlock of this.pushablePlusBlocks) {
      const pos: { x: number; y: number } = plusBlock.getGridPosition();
      if (pos.x === gridX && pos.y === gridY) {
        return plusBlock;
      }
    }
    return null;
  }

  private getCommandBlockAt(gridX: number, gridY: number): CommandBlock | null {
    for (const cmdBlock of this.commandBlocks) {
      const pos: { x: number; y: number } = cmdBlock.getGridPosition();
      if (pos.x === gridX && pos.y === gridY) {
        return cmdBlock;
      }
    }
    return null;
  }

  private executeCommand(cmdBlock: CommandBlock): void {
    const direction: { dx: number; dy: number } = cmdBlock.getDirection();
    const blockColor: string = cmdBlock.getBlockColor();
    const commandColor: string = cmdBlock.getCommandColor();

    const allPushables: Pushable[] = [
      ...this.pushables,
      ...this.pushablePlusBlocks
    ];

    for (const obstacle of this.obstacles) {
      const obsPos: { x: number; y: number } = obstacle.getGridPosition();
      const newX: number = obsPos.x + direction.dx;
      const newY: number = obsPos.y + direction.dy;

      if (obstacle.getColor() === commandColor) {
        const blockingCmdBlock: CommandBlock | null = this.getCommandBlockAt(newX, newY);

        if (blockingCmdBlock) {
          const movedBlocks: Set<CommandBlock> = new Set<CommandBlock>();
          const chainResult: CommandBlock[] | null = this.tryMoveCommandBlockWithChain(
            blockingCmdBlock,
            direction.dx,
            direction.dy,
            movedBlocks
          );

          if (chainResult) {
            obstacle.tryMove(
              direction.dx, direction.dy, this.grid, this.obstacles, allPushables,
              this.player, commandColor, this.commandBlocks
            );
          }
        } else {
          obstacle.tryMove(
            direction.dx, direction.dy, this.grid, this.obstacles, allPushables,
            this.player, commandColor, this.commandBlocks
          );
        }
      }
    }

    const targetBlocks: CommandBlock[] = this.commandBlocks.filter(
      (block: CommandBlock): boolean => block !== cmdBlock && block.getBlockColor() === commandColor
    );

    const movedBlocks: Set<CommandBlock> = new Set<CommandBlock>();

    for (const targetBlock of targetBlocks) {
      if (movedBlocks.has(targetBlock)) {
        continue;
      }

      const moveResult: CommandBlock[] | null = this.tryMoveCommandBlockWithChain(
        targetBlock,
        direction.dx,
        direction.dy,
        movedBlocks
      );

      if (moveResult) {
        for (const block of moveResult) {
          movedBlocks.add(block);
        }
      }
    }
  }

  private tryMoveCommandBlockWithChain(
    block: CommandBlock,
    dx: number,
    dy: number,
    alreadyMoved: Set<CommandBlock>
  ): CommandBlock[] | null {
    if (alreadyMoved.has(block)) {
      return [];
    }

    const blockPos: { x: number; y: number } = block.getGridPosition();
    const newX: number = blockPos.x + dx;
    const newY: number = blockPos.y + dy;

    if (!this.grid.isValid(newX, newY)) {
      return null;
    }

    const tile: Tile | null = this.grid.getTile(newX, newY);
    if (!tile) {
      return null;
    }

    const walkableTiles: string[] = ['floor1', 'floor2', 'floor3', 'exit'];
    if (!walkableTiles.includes(tile.type)) {
      return null;
    }

    for (const obstacle of this.obstacles) {
      const obsPos: { x: number; y: number } = obstacle.getGridPosition();
      if (obsPos.x === newX && obsPos.y === newY) {
        return null;
      }
    }

    const playerPos: { x: number; y: number } = this.player.getGridPosition();
    if (playerPos.x === newX && playerPos.y === newY) {
      return null;
    }

    const blockingBlock: CommandBlock | null = this.getCommandBlockAt(newX, newY);

    if (blockingBlock && !alreadyMoved.has(blockingBlock)) {
      const newAlreadyMoved: Set<CommandBlock> = new Set([...alreadyMoved, block]);

      const chainResult: CommandBlock[] | null = this.tryMoveCommandBlockWithChain(
        blockingBlock,
        dx,
        dy,
        newAlreadyMoved
      );

      if (!chainResult) {
        return null;
      }

      alreadyMoved.add(block);
      block.push(dx, dy, this.grid.getTileSize());

      return [...chainResult, block];
    }

    const tileSize: number = this.grid.getTileSize();

    for (const pushable of this.pushables) {
      const objGridX: number = Math.floor(pushable.x / tileSize);
      const objGridY: number = Math.floor(pushable.y / tileSize);
      if (objGridX === newX && objGridY === newY) {
        return null;
      }
    }

    for (const plusBlock of this.pushablePlusBlocks) {
      const pos: { x: number; y: number } = plusBlock.getGridPosition();
      if (pos.x === newX && pos.y === newY) {
        return null;
      }
    }

    alreadyMoved.add(block);
    block.push(dx, dy, this.grid.getTileSize());
    return [block];
  }

  private updateElectricityEffects(deltaTime: number): void {
    const tileSize: number = this.grid.getTileSize();
    const nextEffects: Map<string, ElectricityEffect> = new Map<string, ElectricityEffect>();

    for (let y: number = 0; y < this.grid.getHeight(); y++) {
      for (let x: number = 0; x < this.grid.getWidth(); x++) {
        const tile: Tile | null = this.grid.getTile(x, y);

        const isStaticPlus: boolean = tile?.type === 'plus-block';
        const isStaticMinus: boolean = tile?.type === 'minus-block';
        const moveablePlus: PushablePlusBlock | null = this.getMoveablePlusAt(x, y);

        if (!isStaticPlus && !moveablePlus && !isStaticMinus) {
          continue;
        }

        for (let searchX: number = x + 1; searchX < this.grid.getWidth(); searchX++) {
          const searchTile: Tile | null = this.grid.getTile(searchX, y);

          if (searchTile?.type === 'wall-start' || searchTile?.type === 'wall-end') {
            break;
          }

          const foundOpposite: boolean | PushablePlusBlock | null =
            ((isStaticPlus || moveablePlus) && searchTile?.type === 'minus-block') ||
            (isStaticMinus && (searchTile?.type === 'plus-block' || this.getMoveablePlusAt(searchX, y)));

          if (foundOpposite) {
            let allEmpty: boolean = true;
            for (let checkX: number = x + 1; checkX < searchX; checkX++) {
              if (this.hasObjectAt(checkX, y)) {
                allEmpty = false;
                break;
              }
            }

            if (allEmpty) {
              const id: string = `h_${x}_${y}_${searchX}`;
              const x1: number = (x + 1) * tileSize;
              const y1: number = (y + 0.5) * tileSize;
              const x2: number = searchX * tileSize;
              const y2: number = y1;

              const foundEffect: ElectricityEffect = this.electricityEffects.find(
                (e: ElectricityEffect): boolean => e.id === id
              )!;
              let effect: ElectricityEffect = foundEffect;
              if (!effect) {
                effect = new ElectricityEffect(x1, y1, x2, y2);
                effect.id = id;
              }
              effect.update(deltaTime);
              nextEffects.set(id, effect);
            }
            break;
          }
        }

        for (let searchY: number = y + 1; searchY < this.grid.getHeight(); searchY++) {
          const searchTile: Tile | null = this.grid.getTile(x, searchY);

          if (searchTile?.type === 'wall-start' || searchTile?.type === 'wall-end') {
            break;
          }

          const foundOpposite: boolean | PushablePlusBlock| null =
            ((isStaticPlus || moveablePlus) && searchTile?.type === 'minus-block') ||
            (isStaticMinus && (searchTile?.type === 'plus-block' || this.getMoveablePlusAt(x, searchY)));

          if (foundOpposite) {
            let allEmpty: boolean = true;
            for (let checkY: number = y + 1; checkY < searchY; checkY++) {
              if (this.hasObjectAt(x, checkY)) {
                allEmpty = false;
                break;
              }
            }

            if (allEmpty) {
              const id: string = `v_${x}_${y}_${searchY}`;
              const x1: number = (x + 0.5) * tileSize;
              const y1: number = (y + 1) * tileSize;
              const x2: number = x1;
              const y2: number = searchY * tileSize;

              let effect: ElectricityEffect | undefined =
                this.electricityEffects.find((e: ElectricityEffect): boolean => e.id === id);
              if (!effect) {
                effect = new ElectricityEffect(x1, y1, x2, y2);
                effect.id = id;
              }
              effect.update(deltaTime);
              nextEffects.set(id, effect);
            }
            break;
          }
        }
      }
    }

    this.electricityEffects = Array.from(nextEffects.values());
  }

  private hasObjectAt(gridX: number, gridY: number): boolean {
    const tileSize: number = this.grid.getTileSize();

    for (const pushable of this.pushables) {
      const objGridX: number = Math.floor(pushable.x / tileSize);
      const objGridY: number = Math.floor(pushable.y / tileSize);
      if (objGridX === gridX && objGridY === gridY) {
        return true;
      }
    }

    for (const plusBlock of this.pushablePlusBlocks) {
      const pos: { x: number; y: number } = plusBlock.getGridPosition();
      if (pos.x === gridX && pos.y === gridY) {
        return true;
      }
    }

    for (const cmdBlock of this.commandBlocks) {
      const pos: { x: number; y: number } = cmdBlock.getGridPosition();
      if (pos.x === gridX && pos.y === gridY) {
        return true;
      }
    }

    for (const obstacle of this.obstacles) {
      const pos: { x: number; y: number } = obstacle.getGridPosition();
      if (pos.x === gridX && pos.y === gridY) {
        return true;
      }
    }

    return false;
  }

  private render(): void {
    this.renderer.clear('#0a0a0a');
    this.renderer.renderGrid(this.grid);

    for (const effect of this.electricityEffects) {
      effect.render(this.ctx);
    }

    for (const cmdBlock of this.commandBlocks) {
      const isActive: boolean = cmdBlock.getIsActive();

      if (isActive) {
        this.ctx.save();
        this.ctx.shadowBlur = 20;
        const glowColor: string = cmdBlock.getCommandColor() === 'green' ? '#00ff00' : '#ffff00';
        this.ctx.shadowColor = glowColor;
        this.ctx.globalAlpha = 0.6 + Math.sin(Date.now() / 200) * 0.3;

        this.ctx.fillStyle = glowColor;
        const glowX: number = cmdBlock.x + 3;
        const glowY: number = cmdBlock.y + 3;
        const glowSizeW: number = cmdBlock.width - 6;
        const glowSizeH: number = cmdBlock.height - 6;

        this.ctx.fillRect(glowX, glowY, glowSizeW, glowSizeH);
        this.ctx.restore();
      }

      this.renderer.drawImage(
        cmdBlock.spriteName,
        cmdBlock.x,
        cmdBlock.y - 7,
        cmdBlock.width,
        cmdBlock.height
      );
    }

    for (const obstacle of this.obstacles) {
      this.renderer.drawImage(
        obstacle.spriteName,
        obstacle.x,
        obstacle.y - 5,
        obstacle.width,
        obstacle.height
      );
    }

    for (const pushable of this.pushables) {
      this.renderer.drawImage(
        pushable.spriteName,
        pushable.x,
        pushable.y - 10,
        pushable.width,
        pushable.height
      );
    }

    for (const plusBlock of this.pushablePlusBlocks) {
      this.renderer.drawImage(
        plusBlock.spriteName,
        plusBlock.x,
        plusBlock.y - 2,
        plusBlock.width,
        plusBlock.height
      );
    }

    this.renderer.drawImage(
      this.player.spriteName,
      this.player.x,
      this.player.y - 10,
      this.player.width,
      this.player.height
    );

    const levelText: string = `Niveau ${this.levelManager.getCurrentLevelNumber()} / ${this.levelManager.getTotalLevels()}`;
    this.renderer.drawText(levelText, 10, 20, '#ffffff', 18);
    this.renderer.drawText('Pijltjestoetsen/WASD: Bewegen | Shift ingedrukt houden: Blokken vasthouden | R: Reset', 10, 45, '#ffffff', 14);

    if (this.levelComplete && !this.gameComplete) {
      this.renderer.drawText('Niveau voltooid!', this.canvas.width / 2 - 80, this.canvas.height / 8, '#00ff00', 24);
    }

    if (this.gameComplete) {
      this.renderer.drawText('Gefeliciteerd!', this.canvas.width / 2 - 100, this.canvas.height / 2 - 20, '#ffff00', 28);
      this.renderer.drawText('Je hebt alle niveaus voltooid!', this.canvas.width / 2 - 120, this.canvas.height / 2 + 20, '#ffffff', 20);
    }
  }

  public getGrid(): Grid {
    return this.grid;
  }

  public getRenderer(): Renderer {
    return this.renderer;
  }

  public getAssetLoader(): AssetLoader {
    return this.assetLoader;
  }

  public getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  public getWidth(): number {
    return this.canvas.width;
  }

  public getHeight(): number {
    return this.canvas.height;
  }
}
