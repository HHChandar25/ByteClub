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
   * Determines if a specific key is currently being held down.
   * Useful for continuous actions like running or sustained movement.
   * * @param key - The KeyboardEvent key value (e.g., 'Shift', 'Control').
   * @returns True if the key is currently depressed.
   */
  public isKeyDown(key: string): boolean {
    return this.keys.get(key) || false;
  }

  /**
   * Determines if a key was pressed since the last check, then resets its state.
   * This implementation ensures that an action (like jumping or interacting)
   * only triggers once even if the key is held down.
   * * @param key - The KeyboardEvent key value (e.g., 'Enter', 'Escape').
   * @returns True only on the first frame the key is detected as pressed.
   */
  public isKeyPressed(key: string): boolean {
    const pressed: boolean = this.keyPressed.get(key) || false;
    if (pressed) {
      // Consume the input event so it doesn't trigger again next frame
      this.keyPressed.set(key, false);
    }
    return pressed;
  }

  /**
   * Translates keyboard input into a normalized grid direction vector.
   * Supports Arrow keys and WASD (case-insensitive).
   * * Note: This implementation prioritizes vertical movement over horizontal
   * if multiple keys are pressed simultaneously, and uses `isKeyPressed`
   * to ensure discrete tile-by-tile movement steps.
   * @returns A direction object with x and y components ranging from -1 to 1.
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
   * Checks if the Shift key is currently depressed.
   * Commonly used for toggling states like "Sprinting" or "Slow walk".
   * @returns True if either Left or Right Shift is held.
   */
  public isShiftHeld(): boolean {
    return this.isKeyDown('Shift');
  }
}
