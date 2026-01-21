# ⚡ Sparky's Journey

A grid-based puzzle game built with **TypeScript** and **HTML Canvas**, where players solve levels by moving blocks, completing electric circuits, and triggering command blocks to reach the exit.

---

## 🎮 Gameplay Overview

The player navigates through a tile-based level using keyboard controls.
Each level contains interactive elements such as:

* **Pushable blocks**
* **Command blocks** that execute movements
* **Plus (+) and Minus (−) blocks** that form electric circuits
* **Obstacles** that react to commands
* **An exit tile** to complete the level

To finish a level, the player must:

1. Activate command blocks by completing electric circuits
2. Use logic and movement to reposition blocks
3. Reach the exit tile once the puzzle is solved

---

## 🧠 Core Mechanics

### 🔌 Electric Circuits

* A circuit is formed when a **Plus block** and a **Minus block** are aligned horizontally or vertically
* All tiles between them must be empty or contain command blocks
* When a circuit is complete, electricity effects are rendered and command blocks activate

### 📦 Command Blocks

* Each command block has:

  * A **block color**
  * A **command color**
  * A **direction**
* When activated, they move all blocks and obstacles of the same color

### 🧱 Pushable Blocks

* Can be pushed by the player
* Some blocks can be held in place using **Shift**

### 🚧 Obstacles

* Can block paths
* Some obstacles move only when triggered by command blocks

---

## 🎹 Controls

| Key               | Action                |
| ----------------- | --------------------- |
| Arrow Keys / WASD | Move player           |
| Shift (hold)      | Hold pushable blocks  |
| R                 | Restart current level |

---

## 🗺️ Levels

* Levels are managed via the `LevelManager`
* Each level defines:

  * Grid layout
  * Player start position
  * Pushables
  * Command blocks
  * Obstacles
  * Exit tile
* Completing a level automatically loads the next one
* Completing all levels finishes the game 🎉

---

## 🧱 Project Structure

```
src/
├── core/
│   ├── Game.ts
│   ├── Renderer.ts
│   └── AssetLoader.ts
│
├── entities/
│   ├── Player.ts
│   ├── PushableObject.ts
│   ├── PushablePlusBlock.ts
│   ├── CommandBlock.ts
│   ├── Obstacle.ts
│   └── GameObject.ts
│
├── systems/
│   ├── Grid.ts
│   ├── InputHandler.ts
│   └── LevelManager.ts
│
├── effects/
│   └── ElectricityEffect.ts
│
└── assets/
```

---

## 🛠️ Technologies Used

* **TypeScript**
* **HTML5 Canvas**
* **ES Modules**
* **Object-Oriented Design**
* **Custom game loop & renderer**

---

## ▶️ Running the Game Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Build the project

```bash
npm run build
```
