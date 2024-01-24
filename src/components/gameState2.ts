interface GameState {
  // pure state, has no logic. Just holds a bunch of information
  // and is used to reflect the game state at a certain point in time
}

type PlayerId = number;

type CardType = 'move' | 'shoot' | 'climb' | 'turn';

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

interface PlayerAction {
  playerId: PlayerId;
  cardType: CardType;
}

class RoundBuilder {
  // takes in a list of card actions and an initial game state
  // and returns as list of actual game actions that will play out

  private _playerActions: PlayerAction[] = [];

  add(playerId: PlayerId, cardType: CardType) {
    this._playerActions.push({ playerId, cardType });
    return this;
  }

  build() {
    return this._playerActions;
  }
}

// ===== by iterating over all of these we will be able to change
// the game state

interface GameEvent {}

interface PlayerEvent extends GameEvent {
  playerId: PlayerId;
}

interface ShootNothing extends PlayerEvent {}

interface ShootPlayer extends PlayerEvent {
  hits: PlayerId;
}

interface FallOver extends PlayerEvent {}

interface StandUp extends PlayerEvent {}

interface StandUpAndShoot extends PlayerEvent {}

interface MoveForward extends PlayerEvent {}

interface PlayerRidesHorse extends PlayerEvent {}

interface PlayerTurns extends PlayerEvent {}

interface ChangeLevel extends PlayerEvent {}

interface PlayerWins extends PlayerEvent {}

interface NoWinner extends GameEvent {} // this might be overkill

// now for the game state
// this is responsible for "running" the game events
// this will cause some kind of animation to play
// and will resolve to a new GameState being built

class Game {
  state: GameState = {};

  step(action: PlayerAction) {
    const pId = action.playerId;
    switch (action.cardType) {
      case 'move':
        return this.move(pId);
      case 'climb':
        return this.climb(pId);
      case 'turn':
        return this.turn(pId);
      case 'shoot':
        return this.shoot(pId);
      default:
        throw 'unknown card type';
    }
  }

  private move(playerId: PlayerId) {}

  private turn(playerId: PlayerId) {}

  private climb(playerId: PlayerId) {}

  private shoot(playerId: PlayerId) {}

  private horse(playerId: PlayerId) {}

  private reflex(playerId: PlayerId) {}
}

// start the game (this is where the magic resolution happens)
const game = new Game();

// get all the cards players are going to have
const playerActions = new RoundBuilder().add(1, 'move').add(2, 'turn').add(3, 'climb').add(4, 'shoot').build();

for (var action of playerActions) {
  // will be async so that animations actually play
  game.step(action);
}

// convert these into actual game actions

// get all the players cards
