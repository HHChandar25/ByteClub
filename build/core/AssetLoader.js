export class AssetLoader {
    assets = new Map();
    toLoad = [];
    loaded = 0;
    onComplete = null;
    load(assetList, callback) {
        this.toLoad = assetList;
        this.loaded = 0;
        this.onComplete = callback;
        if (assetList.length === 0) {
            callback();
            return;
        }
        for (let i = 0; i < assetList.length; i++) {
            this.loadOne(assetList[i]);
        }
    }
    loadOne(asset) {
        const img = new Image();
        img.onload = () => {
            this.assets.set(asset.name, img);
            this.loaded += 1;
            if (this.loaded === this.toLoad.length && this.onComplete) {
                this.onComplete();
            }
        };
        img.onerror = () => {
            console.error('Failed to load: ' + asset.path);
            this.loaded += 1;
            if (this.loaded === this.toLoad.length && this.onComplete) {
                this.onComplete();
            }
        };
        img.src = asset.path;
    }
    get(name) {
        return this.assets.get(name);
    }
    getProgress() {
        if (this.toLoad.length === 0) {
            return 1;
        }
        return this.loaded / this.toLoad.length;
    }
    isLoaded() {
        return this.loaded === this.toLoad.length;
    }
}
//# sourceMappingURL=AssetLoader.js.map