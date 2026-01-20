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
}
