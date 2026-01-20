import { GameObject } from './GameObject.js';
export class PushableObject extends GameObject {
    targetX;
    targetY;
    isMoving = false;
    speed = 400;
    constructor(x, y, width, height, spriteName = 'metal-block') {
        super(x, y, width, height, spriteName);
        this.targetX = x;
        this.targetY = y;
    }
    push(dx, dy, tileSize) {
        if (this.isMoving) {
            return;
        }
        this.targetX = this.x + (dx * tileSize);
        this.targetY = this.y + (dy * tileSize);
        this.isMoving = true;
    }
    update(deltaTime) {
        if (!this.isMoving) {
            return;
        }
        const dt = deltaTime / 1000;
        const moveDistance = this.speed * dt;
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= moveDistance) {
            this.x = this.targetX;
            this.y = this.targetY;
            this.isMoving = false;
        }
        else {
            const ratio = moveDistance / distance;
            this.x += dx * ratio;
            this.y += dy * ratio;
        }
    }
    getIsMoving() {
        return this.isMoving;
    }
}
//# sourceMappingURL=PushableObject.js.map