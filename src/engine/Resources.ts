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
  player: resource('/sprites/cowboy.png'),
  trainCar: resource('/sprites/train-car.png'),
  square: resource('/sprites/square.png'),
  grid: resource('/sprites/grid.png'),
  smoke: resource('/sprites/smoke.png'),
  astronaut: resource('/sprites/astronaut.png'),
  station: resource('/sprites/station.png')
};
