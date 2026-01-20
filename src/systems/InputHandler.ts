export class InputHandler {
  private keys: Map<string, boolean> = new Map();
  private keyPressed: Map<string, boolean> = new Map();

  public constructor() {
    this.setupListeners();
  }

  /**
   * Setup keyboard listeners
   */
  private setupListeners(): void {
    window.addEventListener('keydown', (e: KeyboardEvent): void => {
      if (!this.keys.get(e.key)) {
        this.keyPressed.set(e.key, true);
      }
      this.keys.set(e.key, true);
    });

    window.addEventListener('keyup', (e: KeyboardEvent): void => {
      this.keys.set(e.key, false);
      this.keyPressed.set(e.key, false);
    });
  }

  /**
   * Check if key is currently down
   */
  public isKeyDown(key: string): boolean {
    return this.keys.get(key) || false;
  }

  /**
   * Check if key was just pressed (returns true only once per press)
   */
  public isKeyPressed(key: string): boolean {
    const pressed: boolean = this.keyPressed.get(key) || false;
    if (pressed) {
      this.keyPressed.set(key, false);
    }
    return pressed;
  }

  /**
   * Get movement direction from arrow keys or WASD
   */
  public getMovementDirection(): { x: number, y: number } {
    let dx: number = 0;
    let dy: number = 0;

    if (this.isKeyPressed('ArrowUp') || this.isKeyPressed('w') || this.isKeyPressed('W')) {
      dy = -1;
    } else if (this.isKeyPressed('ArrowDown') || this.isKeyPressed('s') || this.isKeyPressed('S')) {
      dy = 1;
    } else if (this.isKeyPressed('ArrowLeft') || this.isKeyPressed('a') || this.isKeyPressed('A')) {
      dx = -1;
    } else if (this.isKeyPressed('ArrowRight') || this.isKeyPressed('d') || this.isKeyPressed('D')) {
      dx = 1;
    }

    return { x: dx, y: dy };
  }

  /**
   * Check if Shift key is held down
   */
  public isShiftHeld(): boolean {
    return this.isKeyDown('Shift');
  }
}
