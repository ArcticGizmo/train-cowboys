import { ref } from 'vue';
import { GameObject } from './GameObject';
import { SpriteRect } from './SpirteRect';
import { Vec2 } from './Vec2';
import { GameLoop } from './GameLoop';
import { Sprite } from './Sprite';
import { Resources } from './Resources';
import * as utils from './utils';
import { Player } from './Player';
import { SpriteCircle } from './SpriteCircle';
import { Train } from './Train';

export class GameEngine {
  private _ctx: CanvasRenderingContext2D = null!;
  private _loop = new GameLoop(
    delta => this.update(delta),
    () => this.render()
  );
  private _canvasSize: Vec2;
  private _root = new GameObject();
  private _players: Player[] = [];
  private _currentPlayerIndex = 0;

  isReady = ref(false);
  isRunning = ref(false);

  constructor(canvasSize: Vec2) {
    this._canvasSize = canvasSize;
  }

  bindContext(ctx: CanvasRenderingContext2D) {
    this._ctx = ctx;
    this.isReady.value = true;
  }

  init() {
    const bg = new Sprite({
      resource: Resources.grid,
      frameSize: new Vec2(1024, 1024),
      opacity: 0.1
    });

    this.addChild(bg);

    // create the train
    const train = new Train({ gridPosition: new Vec2(1, 4), playerCount: 2 });
    this.addChild(train);

    // create players
    const player1Pos = train.getCar(2).getPlacement('top', 'left').globalGridPos;
    const player1 = new Player({
      id: 'player-1',
      gridPos: player1Pos,
      color: 'red',
      train
    });
    this._players.push(player1);
    this.addChild(player1);

    const player2Pos = train.getCar(3).getPlacement('top', 'left').globalGridPos;
    const player2 = new Player({
      id: 'player-2',
      gridPos: player2Pos,
      color: 'magenta',
      train
    });
    this._players.push(player2);
    this.addChild(player2);
  }

  private get curPlayer() {
    return this._players[this._currentPlayerIndex];
  }

  start() {
    this.isRunning.value = true;
    this._loop.start();
  }

  stop() {
    this.isRunning.value = false;
    this._loop.stop();
  }

  turnPlayer() {
    this.curPlayer.turn();
    this.nextPlayer();
  }

  movePlayerToNextCar() {
    this.curPlayer.moveToNextCar();
    this.nextPlayer();
  }

  shootPlayer() {
    this.curPlayer.shoot();
    this.nextPlayer();
  }

  climbPlayer() {
    this.curPlayer.climb();
    this.nextPlayer();
  }

  private nextPlayer() {
    let nextId = this._currentPlayerIndex + 1;
    if (nextId >= this._players.length) {
      nextId = 0;
    }
    this._currentPlayerIndex = nextId;
  }

  private addChild(gameObject: GameObject) {
    this._root.addChild(gameObject);
  }

  private update(delta: number) {
    this._root.stepEntry(delta, this._root);
  }

  private render() {
    // clear everything to prevent artifacts
    this._ctx.clearRect(0, 0, this._canvasSize.x, this._canvasSize.y);

    this._root.draw(this._ctx, 0, 0);
  }
}
