import { CardType } from './cardType';

type PlayerId = number;
type Level = 'top' | 'bottom';

interface GameAction {
  playerId: PlayerId;
  cardType: CardType;
}

const COLORS = ['red', 'yellow', 'blue', 'green', 'orange', 'black', 'grey'] as const;

type Color = (typeof COLORS)[number];

class Player {
  id: PlayerId;
  color: Color;
  isStunned = false;
  isDead = false;
  facingForward = true;
  money = 0;

  constructor(id: PlayerId, facingForward: boolean) {
    this.id = id;
    this.color = COLORS[id];
    this.facingForward = facingForward;
  }
}

class Train {
  // TODO: there will need to be a special front and back
  // area for horse
  private _engine: TrainCar;
  private _cars: TrainCar[] = []; // engine at 0th
  constructor(playerCount: number) {
    this._engine = new TrainCar();
    this._cars.push(this._engine);
    for (let i = 0; i < playerCount; i++) {
      this._cars.push(new TrainCar());
    }
  }

  addPlayer(playerId: PlayerId, carIndex: number) {
    this._cars[carIndex].bottom.push(playerId);
  }

  movePlayer(playerId: PlayerId, carIndex: number, level: Level) {
    // make sure they are remove from previous car
    this._cars.forEach(c => {
      c.bottom = c.bottom.filter(p => p !== playerId);
      c.top = c.top.filter(p => p !== playerId);
    });

    // the direction matters here
    const car = this._cars[carIndex];
    if (level === 'top') {
      car.top.push(playerId);
    } else {
      car.bottom.push(playerId);
    }
  }
}

class TrainCar {
  top: PlayerId[] = [];
  bottom: PlayerId[] = [];

  constructor() {
    // randomise money ammount
  }
}

export class GameState {
  // how does the momento pattern work again?
  // probably overkill
  private _players: Player[] = [];
  private _train: Train;
  private _order: number[] = [];

  constructor(playerCount: number) {
    this._train = new Train(playerCount);

    for (let i = 0; i < playerCount; i++) {
      // TODO: fix facing direction
      this._players.push(new Player(i, true));
      this._order.push(i);
    }

    // randomise order
    this._order.sort(() => Math.random() - 0.5);

    // add players to the train
    // TODO: replace with correct seeding rules
    this._order.forEach((playerId, index) => {});
  }

  play(playerId: PlayerId, card: CardType) {
    const player = this._players[playerId];

    if (player.isDead) {
      return;
    }

    // do something for each card

    // this will need to return something about what happened
    // so that the game can display what has changed
    // can return a list of things that happened (in order)
    // - moved
    // - shot
    // - stood up
    // - horsed
    // - turned
    // OR, tightly link with rendering and each play
    // performs some action in the scene (timers and all)
    // could take in some kind of renderer
  }

  endRount() {
    // decouple the car
    // check if there is only one person left

    // move to next player
    const last = this._order.pop()!;
    this._order.unshift(last);
  }
}

// all I want is to be able to play cards in a round
// something like "build round"
// then you can just step through the round
// each card played will result in some outcome

// looks like I want a way to bind rendering an animations
// into everything. I want something that converts cards into
// a set of actions



