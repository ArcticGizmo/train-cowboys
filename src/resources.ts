interface Resource {
  image: HTMLImageElement;
  isLoaded: boolean;
}

const TO_LOAD = {
  background: '/sprites/background.png',
  player: '/sprites/player.png',
  trainCar: '/sprites/train-card.png'
};

type ResourceName = keyof typeof TO_LOAD

class Resources {
  // @ts-ignore (will be instantiated at run time)
  private _images: Record<ResourceName, Resource> = {};

  constructor() {
    Object.entries(TO_LOAD).forEach(([key, path]) => {
      const img = new Image();
      img.src = path;

      const resource: Resource = {
        image: img,
        isLoaded: false
      };

      img.onload = () => (resource.isLoaded = true);

      this._images[key as ResourceName] = resource;
    });
  }
}
