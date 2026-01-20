export class ElectricityEffect {
  public id?: string;

  private x1: number;

  private y1: number;

  private x2: number;

  private y2: number;

  private animationTimer: number = 0;

  private waveOffset: number = 0;

  private isHorizontal: boolean;

  public constructor(x1: number, y1: number, x2: number, y2: number) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.isHorizontal = Math.abs(x2 - x1) > Math.abs(y2 - y1);
  }

  public update(deltaTime: number): void {
    this.animationTimer += deltaTime;
    this.waveOffset = (this.animationTimer / 100) % (Math.PI * 2);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    ctx.strokeStyle = '#00ccff';
    ctx.lineWidth = 5;
    ctx.shadowBlur = 0;
    ctx.lineJoin = 'miter';

    ctx.beginPath();

    const segments: number = 20;

    for (let i: number = 0; i <= segments; i++) {
      const t: number = i / segments;

      const amplitude: number = Math.round(Math.sin(t * Math.PI) * 4);
      const wave: number = Math.round(Math.sin(t * Math.PI * 8 + this.waveOffset) * amplitude);

      let x: number = this.x1 + (this.x2 - this.x1) * t;
      let y: number = this.y1 + (this.y2 - this.y1) * t;

      if (this.isHorizontal) {
        y += wave;
      } else {
        x += wave;
      }

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();

    const sparkCount: number = 3;

    for (let i: number = 0; i < sparkCount; i++) {
      const progress: number = ((this.animationTimer / 200 + i / sparkCount) % 1);
      let sparkX: number, sparkY: number;

      if (this.isHorizontal) {
        sparkX = this.x1 + (this.x2 - this.x1) * progress;
        sparkY = this.y1 + Math.round(Math.sin(progress * Math.PI * 8 + this.waveOffset) * 4);
      } else {
        sparkX = this.x1 + Math.round(Math.sin(progress * Math.PI * 8 + this.waveOffset) * 4);
        sparkY = this.y1 + (this.y2 - this.y1) * progress;
      }

      const alpha: number = 1 - Math.abs(progress - 0.5) * 2;

      ctx.fillStyle = `rgba(0, 204, 255, ${alpha})`;
      ctx.fillRect(Math.round(sparkX) - 1, Math.round(sparkY) - 1, 2, 2);
    }

    ctx.restore();
  }
}
