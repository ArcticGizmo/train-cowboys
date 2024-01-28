export interface Resource {
  image: HTMLImageElement;
  isLoaded: boolean;
}

const resource = (path: string): Resource => {
  const img = new Image();
  img.src = path;

  const resource: Resource = {
    image: img,
    isLoaded: false
  };

  img.onload = () => (resource.isLoaded = true);
  return resource;
};

export const Resources = {
  background: resource('/sprites/background.png'),
  player: resource('/sprites/player.png'),
  trainCar: resource('/sprites/train-card.png'),
  square: resource('/sprites/square.png')
};
