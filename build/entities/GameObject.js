export class GameObject {
    x;
    y;
    width;
    height;
    spriteName;
    constructor(x, y, width, height, spriteName) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.spriteName = spriteName;
    }
    update(deltaTime) {
    }
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}
//# sourceMappingURL=GameObject.js.map