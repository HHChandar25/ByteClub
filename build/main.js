import { Game } from './core/Game.js';
const assets = [
    { name: 'main', path: './assets/background.png' },
    { name: 'floor1', path: 'assets/floor1.png' },
    { name: 'floor2', path: 'assets/floor2.png' },
    { name: 'floor3', path: 'assets/floor3.png' },
    { name: 'exit', path: 'assets/exit.png' },
    { name: 'wall-start', path: 'assets/wall-start.png' },
    { name: 'wall-end', path: 'assets/wall-end.png' },
    { name: 'character-front', path: 'assets/character-front.png' },
    { name: 'character-back', path: 'assets/character-back.png' },
    { name: 'character-right', path: 'assets/character-right.png' },
    { name: 'character-left', path: 'assets/character-left.png' },
    { name: 'metal-block', path: 'assets/metal-block.png' },
    { name: 'yellow-obstacle-top', path: 'assets/yellow-obstacle-top.png' },
    { name: 'yellow-obstacle-middle', path: 'assets/yellow-obstacle-middle.png' },
    { name: 'yellow-obstacle-bottom', path: 'assets/yellow-obstacle-bottom.png' },
    { name: 'green-obstacle-left', path: 'assets/green-obstacle-left.png' },
    { name: 'green-obstacle-center', path: 'assets/green-obstacle-center.png' },
    { name: 'green-obstacle-right', path: 'assets/green-obstacle-right.png' },
    { name: 'green-obstacle-top', path: 'assets/green-obstacle-top.png' },
    { name: 'green-obstacle-middle', path: 'assets/green-obstacle-middle.png' },
    { name: 'green-obstacle-bottom', path: 'assets/green-obstacle-bottom.png' },
    { name: 'pushable-plus-block', path: 'assets/pushable-plus-block.png' },
    { name: 'pushable-minus-block', path: 'assets/pushable-minus-block.png' },
    { name: 'yellow-plus-block', path: 'assets/yellow-plus.png' },
    { name: 'plus-block', path: 'assets/plus-block.png' },
    { name: 'minus-block', path: 'assets/minus-block.png' },
    { name: 'up-arrow', path: 'assets/up-arrow.png' },
    { name: 'down-arrow', path: 'assets/down-arrow.png' },
    { name: 'right-arrow', path: 'assets/right-arrow.png' },
    { name: 'green-left-arrow', path: 'assets/green-left-arrow.png' },
    { name: 'green-up-arrow', path: 'assets/green-up-arrow.png' },
];
const game = new Game('gameCanvas');
showLoading();
game.loadAssets(assets, () => {
    console.log('All assets loaded!');
    hideLoading();
    game.start();
});
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'block';
    }
}
function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
}
//# sourceMappingURL=main.js.map