export class ElectricityEffect {
    id;
    x1;
    y1;
    x2;
    y2;
    animationTimer = 0;
    waveOffset = 0;
    isHorizontal;
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.isHorizontal = Math.abs(x2 - x1) > Math.abs(y2 - y1);
    }
    update(deltaTime) {
        this.animationTimer += deltaTime;
        this.waveOffset = (this.animationTimer / 100) % (Math.PI * 2);
    }
    render(ctx) {
        ctx.save();
        ctx.strokeStyle = '#00ccff';
        ctx.lineWidth = 5;
        ctx.shadowBlur = 0;
        ctx.lineJoin = 'miter';
        ctx.beginPath();
        const segments = 20;
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const amplitude = Math.round(Math.sin(t * Math.PI) * 4);
            const wave = Math.round(Math.sin(t * Math.PI * 8 + this.waveOffset) * amplitude);
            let x = this.x1 + (this.x2 - this.x1) * t;
            let y = this.y1 + (this.y2 - this.y1) * t;
            if (this.isHorizontal) {
                y += wave;
            }
            else {
                x += wave;
            }
            if (i === 0) {
                ctx.moveTo(x, y);
            }
            else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        const sparkCount = 3;
        for (let i = 0; i < sparkCount; i++) {
            const progress = ((this.animationTimer / 200 + i / sparkCount) % 1);
            let sparkX, sparkY;
            if (this.isHorizontal) {
                sparkX = this.x1 + (this.x2 - this.x1) * progress;
                sparkY = this.y1 + Math.round(Math.sin(progress * Math.PI * 8 + this.waveOffset) * 4);
            }
            else {
                sparkX = this.x1 + Math.round(Math.sin(progress * Math.PI * 8 + this.waveOffset) * 4);
                sparkY = this.y1 + (this.y2 - this.y1) * progress;
            }
            const alpha = 1 - Math.abs(progress - 0.5) * 2;
            ctx.fillStyle = `rgba(0, 204, 255, ${alpha})`;
            ctx.fillRect(Math.round(sparkX) - 1, Math.round(sparkY) - 1, 2, 2);
        }
        ctx.restore();
    }
}
//# sourceMappingURL=ElectricityEffect.js.map