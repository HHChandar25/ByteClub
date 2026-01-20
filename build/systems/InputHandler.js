export class InputHandler {
    keys = new Map();
    keyPressed = new Map();
    constructor() {
        this.setupListeners();
    }
    setupListeners() {
        window.addEventListener('keydown', (e) => {
            if (!this.keys.get(e.key)) {
                this.keyPressed.set(e.key, true);
            }
            this.keys.set(e.key, true);
        });
        window.addEventListener('keyup', (e) => {
            this.keys.set(e.key, false);
            this.keyPressed.set(e.key, false);
        });
    }
    isKeyDown(key) {
        return this.keys.get(key) || false;
    }
    isKeyPressed(key) {
        const pressed = this.keyPressed.get(key) || false;
        if (pressed) {
            this.keyPressed.set(key, false);
        }
        return pressed;
    }
    getMovementDirection() {
        let dx = 0;
        let dy = 0;
        if (this.isKeyPressed('ArrowUp') || this.isKeyPressed('w') || this.isKeyPressed('W')) {
            dy = -1;
        }
        else if (this.isKeyPressed('ArrowDown') || this.isKeyPressed('s') || this.isKeyPressed('S')) {
            dy = 1;
        }
        else if (this.isKeyPressed('ArrowLeft') || this.isKeyPressed('a') || this.isKeyPressed('A')) {
            dx = -1;
        }
        else if (this.isKeyPressed('ArrowRight') || this.isKeyPressed('d') || this.isKeyPressed('D')) {
            dx = 1;
        }
        return { x: dx, y: dy };
    }
    isShiftHeld() {
        return this.isKeyDown('Shift');
    }
}
//# sourceMappingURL=InputHandler.js.map