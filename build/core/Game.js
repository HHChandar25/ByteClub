import { AssetLoader } from './AssetLoader.js';
import { Renderer } from './Renderer.js';
import { Grid } from '../systems/Grid.js';
import { InputHandler } from '../systems/InputHandler.js';
import { LevelManager } from '../systems/LevelManager.js';
import { Player } from '../entities/Player.js';
import { ElectricityEffect } from '../effects/ElectricityEffect.js';
export class Game {
    canvas;
    ctx;
    assetLoader;
    renderer;
    grid;
    inputHandler;
    levelManager;
    player;
    pushables = [];
    pushablePlusBlocks = [];
    commandBlocks = [];
    obstacles = [];
    exitTile;
    electricityEffects = [];
    isRunning = false;
    lastTime = 0;
    levelComplete = false;
    levelCompleteTimer = 0;
    gameComplete = false;
    constructor(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            throw new Error('Canvas not found');
        }
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get 2d context');
        }
        this.ctx = ctx;
        this.assetLoader = new AssetLoader();
        this.renderer = new Renderer(ctx, this.assetLoader);
        this.inputHandler = new InputHandler();
        this.levelManager = new LevelManager();
        const tileSize = 64;
        const gridWidth = Math.floor(this.canvas.width / tileSize);
        const gridHeight = Math.floor(this.canvas.height / tileSize);
        this.grid = new Grid(gridWidth, gridHeight, tileSize);
        const levelData = this.levelManager.loadLevel(this.grid, tileSize);
        this.loadCurrentLevel();
        this.player = new Player(levelData.playerStart.x, levelData.playerStart.y, tileSize);
        this.pushables = levelData.pushables;
        this.exitTile = levelData.exit;
        const offsetX = Math.floor((this.canvas.width - this.grid.getWorldWidth()) / 2);
        const offsetY = Math.floor((this.canvas.height - this.grid.getWorldHeight()) / 2);
        this.renderer.setCamera(-offsetX, -offsetY);
    }
    loadCurrentLevel() {
        const tileSize = this.grid.getTileSize();
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
    loadAssets(assets, onComplete) {
        this.assetLoader.load(assets, onComplete);
    }
    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.loop(this.lastTime);
    }
    stop() {
        this.isRunning = false;
    }
    loop(currentTime) {
        if (!this.isRunning) {
            return;
        }
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.update(deltaTime);
        this.render();
        requestAnimationFrame((time) => this.loop(time));
    }
    update(deltaTime) {
        if (this.levelComplete) {
            this.levelCompleteTimer += deltaTime;
            if (this.levelCompleteTimer >= 1500) {
                if (this.levelManager.nextLevel()) {
                    this.loadCurrentLevel();
                }
                else {
                    this.gameComplete = true;
                }
            }
            return;
        }
        this.updateElectricityEffects(deltaTime);
        for (const cmdBlock of this.commandBlocks) {
            const pos = cmdBlock.getGridPosition();
            const isInCircuit = this.checkCircuitCompletion(pos.x, pos.y);
            cmdBlock.checkActivation(this.grid, pos.x, pos.y, isInCircuit);
            const shouldExecute = cmdBlock.update(deltaTime);
            if (shouldExecute) {
                this.executeCommand(cmdBlock);
            }
        }
        const movement = this.inputHandler.getMovementDirection();
        const isHolding = this.inputHandler.isShiftHeld();
        if (movement.x !== 0 || movement.y !== 0) {
            const grayCommandBlocks = this.commandBlocks.filter((block) => block.getBlockColor() === 'gray');
            const nonGrayCommandBlocks = this.commandBlocks.filter((block) => block.getBlockColor() !== 'gray');
            const allPushables = [
                ...this.pushables,
                ...this.pushablePlusBlocks,
                ...grayCommandBlocks
            ];
            const allObstacles = [
                ...this.obstacles
            ];
            for (const cmdBlock of nonGrayCommandBlocks) {
                allObstacles.push(cmdBlock);
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
        const playerPos = this.player.getGridPosition();
        if (playerPos.x === this.exitTile.x &&
            playerPos.y === this.exitTile.y && !this.player.getIsMoving()) {
            this.levelComplete = true;
        }
        if (this.inputHandler.isKeyPressed('r') || this.inputHandler.isKeyPressed('R')) {
            this.loadCurrentLevel();
        }
    }
    checkCircuitCompletion(cmdX, cmdY) {
        let leftPlusX = -1;
        for (let x = cmdX - 1; x >= 0; x--) {
            const tile = this.grid.getTile(x, cmdY);
            if (tile?.type === 'plus-block') {
                leftPlusX = x;
                break;
            }
            const moveablePlus = this.getMoveablePlusAt(x, cmdY);
            if (moveablePlus) {
                leftPlusX = x;
                break;
            }
            if (!tile || tile.type === 'wall-start' || tile.type === 'wall-end') {
                break;
            }
        }
        let rightMinusX = -1;
        for (let x = cmdX + 1; x < this.grid.getWidth(); x++) {
            const tile = this.grid.getTile(x, cmdY);
            if (tile?.type === 'minus-block') {
                rightMinusX = x;
                break;
            }
            if (!tile || tile.type === 'wall-start' || tile.type === 'wall-end') {
                break;
            }
        }
        if (leftPlusX !== -1 && rightMinusX !== -1) {
            for (let x = leftPlusX + 1; x < rightMinusX; x++) {
                if (!this.getCommandBlockAt(x, cmdY)) {
                    return false;
                }
            }
            return true;
        }
        let upPlusY = -1;
        for (let y = cmdY - 1; y >= 0; y--) {
            const tile = this.grid.getTile(cmdX, y);
            if (tile?.type === 'plus-block') {
                upPlusY = y;
                break;
            }
            const moveablePlus = this.getMoveablePlusAt(cmdX, y);
            if (moveablePlus) {
                upPlusY = y;
                break;
            }
            if (!tile || tile.type === 'wall-start' || tile.type === 'wall-end') {
                break;
            }
        }
        let downMinusY = -1;
        for (let y = cmdY + 1; y < this.grid.getHeight(); y++) {
            const tile = this.grid.getTile(cmdX, y);
            if (tile?.type === 'minus-block') {
                downMinusY = y;
                break;
            }
            if (!tile || tile.type === 'wall-start' || tile.type === 'wall-end') {
                break;
            }
        }
        if (upPlusY !== -1 && downMinusY !== -1) {
            for (let y = upPlusY + 1; y < downMinusY; y++) {
                if (!this.getCommandBlockAt(cmdX, y)) {
                    return false;
                }
            }
            return true;
        }
        let upMinusY = -1;
        for (let y = cmdY - 1; y >= 0; y--) {
            const tile = this.grid.getTile(cmdX, y);
            if (tile?.type === 'minus-block') {
                upMinusY = y;
                break;
            }
            if (!tile || tile.type === 'wall-start' || tile.type === 'wall-end') {
                break;
            }
        }
        let downPlusY = -1;
        for (let y = cmdY + 1; y < this.grid.getHeight(); y++) {
            const tile = this.grid.getTile(cmdX, y);
            if (tile?.type === 'plus-block') {
                downPlusY = y;
                break;
            }
            const moveablePlus = this.getMoveablePlusAt(cmdX, y);
            if (moveablePlus) {
                downPlusY = y;
                break;
            }
            if (!tile || tile.type === 'wall-start' || tile.type === 'wall-end') {
                break;
            }
        }
        if (upMinusY !== -1 && downPlusY !== -1) {
            for (let y = upMinusY + 1; y < downPlusY; y++) {
                if (!this.getCommandBlockAt(cmdX, y)) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    getMoveablePlusAt(gridX, gridY) {
        for (const plusBlock of this.pushablePlusBlocks) {
            const pos = plusBlock.getGridPosition();
            if (pos.x === gridX && pos.y === gridY) {
                return plusBlock;
            }
        }
        return null;
    }
    getCommandBlockAt(gridX, gridY) {
        for (const cmdBlock of this.commandBlocks) {
            const pos = cmdBlock.getGridPosition();
            if (pos.x === gridX && pos.y === gridY) {
                return cmdBlock;
            }
        }
        return null;
    }
    executeCommand(cmdBlock) {
        const direction = cmdBlock.getDirection();
        const commandColor = cmdBlock.getCommandColor();
        const allPushables = [
            ...this.pushables,
            ...this.pushablePlusBlocks
        ];
        for (const obstacle of this.obstacles) {
            const obsPos = obstacle.getGridPosition();
            const newX = obsPos.x + direction.dx;
            const newY = obsPos.y + direction.dy;
            if (obstacle.getColor() === commandColor) {
                const blockingCmdBlock = this.getCommandBlockAt(newX, newY);
                if (blockingCmdBlock) {
                    const movedBlocks = new Set();
                    const chainResult = this.tryMoveCommandBlockWithChain(blockingCmdBlock, direction.dx, direction.dy, movedBlocks);
                    if (chainResult) {
                        obstacle.tryMove(direction.dx, direction.dy, this.grid, this.obstacles, allPushables, this.player, commandColor, this.commandBlocks);
                    }
                }
                else {
                    obstacle.tryMove(direction.dx, direction.dy, this.grid, this.obstacles, allPushables, this.player, commandColor, this.commandBlocks);
                }
            }
        }
        const targetBlocks = this.commandBlocks.filter((block) => block !== cmdBlock && block.getBlockColor() === commandColor);
        const movedBlocks = new Set();
        for (const targetBlock of targetBlocks) {
            if (movedBlocks.has(targetBlock)) {
                continue;
            }
            const moveResult = this.tryMoveCommandBlockWithChain(targetBlock, direction.dx, direction.dy, movedBlocks);
            if (moveResult) {
                for (const block of moveResult) {
                    movedBlocks.add(block);
                }
            }
        }
    }
    tryMoveCommandBlockWithChain(block, dx, dy, alreadyMoved) {
        if (alreadyMoved.has(block)) {
            return [];
        }
        const blockPos = block.getGridPosition();
        const newX = blockPos.x + dx;
        const newY = blockPos.y + dy;
        if (!this.grid.isValid(newX, newY)) {
            return null;
        }
        const tile = this.grid.getTile(newX, newY);
        if (!tile) {
            return null;
        }
        const walkableTiles = ['floor1', 'floor2', 'floor3', 'exit'];
        if (!walkableTiles.includes(tile.type)) {
            return null;
        }
        for (const obstacle of this.obstacles) {
            const obsPos = obstacle.getGridPosition();
            if (obsPos.x === newX && obsPos.y === newY) {
                return null;
            }
        }
        const playerPos = this.player.getGridPosition();
        if (playerPos.x === newX && playerPos.y === newY) {
            return null;
        }
        const blockingBlock = this.getCommandBlockAt(newX, newY);
        if (blockingBlock && !alreadyMoved.has(blockingBlock)) {
            const newAlreadyMoved = new Set([...alreadyMoved, block]);
            const chainResult = this.tryMoveCommandBlockWithChain(blockingBlock, dx, dy, newAlreadyMoved);
            if (!chainResult) {
                return null;
            }
            alreadyMoved.add(block);
            block.push(dx, dy, this.grid.getTileSize());
            return [...chainResult, block];
        }
        const tileSize = this.grid.getTileSize();
        for (const pushable of this.pushables) {
            const objGridX = Math.floor(pushable.x / tileSize);
            const objGridY = Math.floor(pushable.y / tileSize);
            if (objGridX === newX && objGridY === newY) {
                return null;
            }
        }
        for (const plusBlock of this.pushablePlusBlocks) {
            const pos = plusBlock.getGridPosition();
            if (pos.x === newX && pos.y === newY) {
                return null;
            }
        }
        alreadyMoved.add(block);
        block.push(dx, dy, this.grid.getTileSize());
        return [block];
    }
    updateElectricityEffects(deltaTime) {
        const tileSize = this.grid.getTileSize();
        const nextEffects = new Map();
        for (let y = 0; y < this.grid.getHeight(); y++) {
            for (let x = 0; x < this.grid.getWidth(); x++) {
                const tile = this.grid.getTile(x, y);
                const isStaticPlus = tile?.type === 'plus-block';
                const isStaticMinus = tile?.type === 'minus-block';
                const moveablePlus = this.getMoveablePlusAt(x, y);
                if (!isStaticPlus && !moveablePlus && !isStaticMinus) {
                    continue;
                }
                for (let searchX = x + 1; searchX < this.grid.getWidth(); searchX++) {
                    const searchTile = this.grid.getTile(searchX, y);
                    if (searchTile?.type === 'wall-start' || searchTile?.type === 'wall-end') {
                        break;
                    }
                    const foundOpposite = ((isStaticPlus || moveablePlus) && searchTile?.type === 'minus-block') ||
                        (isStaticMinus && (searchTile?.type === 'plus-block' || this.getMoveablePlusAt(searchX, y)));
                    if (foundOpposite) {
                        let allEmpty = true;
                        for (let checkX = x + 1; checkX < searchX; checkX++) {
                            if (this.hasObjectAt(checkX, y)) {
                                allEmpty = false;
                                break;
                            }
                        }
                        if (allEmpty) {
                            const id = `h_${x}_${y}_${searchX}`;
                            const x1 = (x + 1) * tileSize;
                            const y1 = (y + 0.5) * tileSize;
                            const x2 = searchX * tileSize;
                            const y2 = y1;
                            const foundEffect = this.electricityEffects.find((e) => e.id === id);
                            let effect = foundEffect;
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
                for (let searchY = y + 1; searchY < this.grid.getHeight(); searchY++) {
                    const searchTile = this.grid.getTile(x, searchY);
                    if (searchTile?.type === 'wall-start' || searchTile?.type === 'wall-end') {
                        break;
                    }
                    const foundOpposite = ((isStaticPlus || moveablePlus) && searchTile?.type === 'minus-block') ||
                        (isStaticMinus && (searchTile?.type === 'plus-block' || this.getMoveablePlusAt(x, searchY)));
                    if (foundOpposite) {
                        let allEmpty = true;
                        for (let checkY = y + 1; checkY < searchY; checkY++) {
                            if (this.hasObjectAt(x, checkY)) {
                                allEmpty = false;
                                break;
                            }
                        }
                        if (allEmpty) {
                            const id = `v_${x}_${y}_${searchY}`;
                            const x1 = (x + 0.5) * tileSize;
                            const y1 = (y + 1) * tileSize;
                            const x2 = x1;
                            const y2 = searchY * tileSize;
                            let effect = this.electricityEffects.find((e) => e.id === id);
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
    hasObjectAt(gridX, gridY) {
        const tileSize = this.grid.getTileSize();
        for (const pushable of this.pushables) {
            const objGridX = Math.floor(pushable.x / tileSize);
            const objGridY = Math.floor(pushable.y / tileSize);
            if (objGridX === gridX && objGridY === gridY) {
                return true;
            }
        }
        for (const plusBlock of this.pushablePlusBlocks) {
            const pos = plusBlock.getGridPosition();
            if (pos.x === gridX && pos.y === gridY) {
                return true;
            }
        }
        for (const cmdBlock of this.commandBlocks) {
            const pos = cmdBlock.getGridPosition();
            if (pos.x === gridX && pos.y === gridY) {
                return true;
            }
        }
        for (const obstacle of this.obstacles) {
            const pos = obstacle.getGridPosition();
            if (pos.x === gridX && pos.y === gridY) {
                return true;
            }
        }
        return false;
    }
    render() {
        this.renderer.clear('#0a0a0a');
        this.renderer.renderGrid(this.grid);
        for (const effect of this.electricityEffects) {
            effect.render(this.ctx);
        }
        for (const cmdBlock of this.commandBlocks) {
            const isActive = cmdBlock.getIsActive();
            if (isActive) {
                this.ctx.save();
                this.ctx.shadowBlur = 20;
                const glowColor = cmdBlock.getCommandColor() === 'green' ? '#00ff00' : '#ffff00';
                this.ctx.shadowColor = glowColor;
                this.ctx.globalAlpha = 0.6 + Math.sin(Date.now() / 200) * 0.3;
                this.ctx.fillStyle = glowColor;
                const glowX = cmdBlock.x + 3;
                const glowY = cmdBlock.y + 3;
                const glowSizeW = cmdBlock.width - 6;
                const glowSizeH = cmdBlock.height - 6;
                this.ctx.fillRect(glowX, glowY, glowSizeW, glowSizeH);
                this.ctx.restore();
            }
            this.renderer.drawImage(cmdBlock.spriteName, cmdBlock.x, cmdBlock.y - 7, cmdBlock.width, cmdBlock.height);
        }
        for (const obstacle of this.obstacles) {
            this.renderer.drawImage(obstacle.spriteName, obstacle.x, obstacle.y - 5, obstacle.width, obstacle.height);
        }
        for (const pushable of this.pushables) {
            this.renderer.drawImage(pushable.spriteName, pushable.x, pushable.y - 10, pushable.width, pushable.height);
        }
        for (const plusBlock of this.pushablePlusBlocks) {
            this.renderer.drawImage(plusBlock.spriteName, plusBlock.x, plusBlock.y - 2, plusBlock.width, plusBlock.height);
        }
        this.renderer.drawImage(this.player.spriteName, this.player.x, this.player.y - 10, this.player.width, this.player.height);
        const levelText = `Niveau ${this.levelManager.getCurrentLevelNumber()} / ${this.levelManager.getTotalLevels()}`;
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
    getGrid() {
        return this.grid;
    }
    getRenderer() {
        return this.renderer;
    }
    getAssetLoader() {
        return this.assetLoader;
    }
    getContext() {
        return this.ctx;
    }
    getWidth() {
        return this.canvas.width;
    }
    getHeight() {
        return this.canvas.height;
    }
}
//# sourceMappingURL=Game.js.map