import { ref } from 'vue';
import { GameObject } from './GameObject';
import { Vec2 } from './Vec2';
import { GameLoop } from './GameLoop';
import { Sprite } from './Sprite';
import { Resources } from './Resources';
import { Player } from './Player';
import { Train } from './Train';
import { AQ, AQHelper } from './ActionQueue';

const PLAYER_COUNT = 3;

const playerColors = ['red', 'blue', 'magenta', 'black', 'white'];

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
  status = ref<'ongoing' | 'win' | 'draw'>('ongoing');

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
    const train = new Train({
      gridPosition: new Vec2(1, 4),
      playerCount: PLAYER_COUNT
    });
    this.addChild(train);

    // create players
    for (let pIndex = 0; pIndex < PLAYER_COUNT; pIndex++) {
      const playerPos = train.getCar(pIndex + 2).getPlacement('top', 'left').globalGridPos;
      const player = new Player({
        id: `player-${pIndex}`,
        gridPos: playerPos,
        color: playerColors[pIndex],
        train
      });
      this._players.push(player);
      this.addChild(player);
    }
  }

  testAQ() {
    if (!AQ.isFinished()) {
      console.log('-=-- still running');
      return;
    }

    const player = this.curPlayer;
    player.position = new Vec2(30, 30);
    // AQ.do(AQHelper.MoveTo(player, new Vec2(50, 30), 0.05));
    AQ.do(
      AQHelper.DoFor((deltaTime: number) => {
        player.position.add(new Vec2(0.005 * deltaTime, 0));
      }, 2500)
    );
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

  horsePlayer() {
    this.curPlayer.horse();
    this.nextPlayer();
  }

  reflexPlayer() {
    this.curPlayer.reflex();
    this.nextPlayer();
  }

  endRound() {
    const remainingPlayers = this._players.filter(p => !p.isInDeathZone);
    const playersToRemove = this._players.filter(p => p.isInDeathZone);

    // fix the next player index
    const curPlayer = this.curPlayer;
    if (remainingPlayers.includes(curPlayer)) {
      this._players = remainingPlayers;
      this._currentPlayerIndex = this._players.indexOf(curPlayer);
    } else {
      const playerCircle = this._players.slice();
      playerCircle.push(...playerCircle);
      let nextIndex = 0;
      for (let i = this._currentPlayerIndex; i < playerCircle.length; i++) {
        const playerToCheck = playerCircle[i];
        if (remainingPlayers.includes(playerToCheck)) {
          nextIndex = i;
          break;
        }
      }

      this._players = remainingPlayers;

      this._currentPlayerIndex = nextIndex;
    }

    playersToRemove.forEach(p => p.parent?.removeChild(p));

    const playerCount = this._players.length;
    if (playerCount === 1) {
      this.status.value = 'win';
    } else if (playerCount === 0) {
      this.status.value = 'draw';
    }

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
    AQ.step(delta);
  }

  private render() {
    // clear everything to prevent artifacts
    this._ctx.clearRect(0, 0, this._canvasSize.x, this._canvasSize.y);

    this._root.draw(this._ctx, 0, 0);
  }
}
