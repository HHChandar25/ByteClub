export interface Asset {
  name: string;
  path: string;
}

export class AssetLoader {
  private assets: Map<string, HTMLImageElement> = new Map();

  private toLoad: Asset[] = [];

  private loaded: number = 0;

  private onComplete: (() => void) | null = null;

  public load(assetList: Asset[], callback: () => void): void {
    this.toLoad = assetList;
    this.loaded = 0;
    this.onComplete = callback;

    if (assetList.length === 0) {
      callback();
      return;
    }

    for (let i: number = 0; i < assetList.length; i++) {
      this.loadOne(assetList[i]);
    }
  }

  private loadOne(asset: Asset): void {
    const img: HTMLImageElement = new Image();

    img.onload = (): void => {
      this.assets.set(asset.name, img);
      this.loaded += 1;

      if (this.loaded === this.toLoad.length && this.onComplete) {
        this.onComplete();
      }
    };

    img.onerror = (): void => {
      console.error('Failed to load: ' + asset.path);
      this.loaded += 1;

      if (this.loaded === this.toLoad.length && this.onComplete) {
        this.onComplete();
      }
    };

    img.src = asset.path;
  }

  public get(name: string): HTMLImageElement | undefined {
    return this.assets.get(name);
  }

  public getProgress(): number {
    if (this.toLoad.length === 0) {
      return 1;
    }
    return this.loaded / this.toLoad.length;
  }

  public isLoaded(): boolean {
    return this.loaded === this.toLoad.length;
  }
}
