import { ref } from 'vue';
import { GameObject } from './GameObject';
import { Vec2 } from './Vec2';
import { GameLoop } from './GameLoop';
import { Sprite } from './Sprite';
import { Resources } from './Resources';
import { Player } from './Player';
import { Train } from './Train';
import { CQ, CQHelper } from './ChangeQueue';
import { PlayerAnimationName } from './animations/playerAnimations';

export class GameEngine {
  private _ctx: CanvasRenderingContext2D = null!;
  private _loop = new GameLoop(
    delta => this.update(delta),
    () => this.render()
  );

  canvasSize: Vec2;

  root = new GameObject();
  isRunning = ref(false);

  constructor(ctx: CanvasRenderingContext2D) {
    this._ctx = ctx;
    ctx.imageSmoothingEnabled = false;
    this.canvasSize = new Vec2(this._ctx.canvas.width, this._ctx.canvas.height);
  }

  // init() {
  //   const bg = new Sprite({
  //     resource: Resources.grid,
  //     frameSize: new Vec2(1024, 1024),
  //     opacity: 0.1
  //   });

  //   this.addChild(bg);

  //   // create the train
  //   const train = new Train({
  //     gridPosition: new Vec2(1, 4),
  //     playerCount: PLAYER_COUNT
  //   });
  //   this.addChild(train);

  //   // create players
  //   for (let pIndex = 0; pIndex < PLAYER_COUNT; pIndex++) {
  //     const playerPos = train.getCar(pIndex + 2).getPlacement('top', 'left').globalGridPos;
  //     const player = new Player({
  //       id: `player-${pIndex}`,
  //       gridPos: playerPos,
  //       color: playerColors[pIndex],
  //       train
  //     });
  //     this._players.push(player);
  //     this.addChild(player);
  //   }
  // }

  // playAnimation(name: PlayerAnimationName) {
  //   if (CQ.inProgress()) {
  //     console.log('--- still running animation');
  //     return;
  //   }
  //   const player = this.curPlayer;
  //   player.setAnimation(name);
  // }

  // testCQ() {
  //   if (!CQ.isFinished()) {
  //     console.log('-=-- still running');
  //     return;
  //   }

  //   const player = this.curPlayer;
  //   player.position = new Vec2(30, 30);
  //   // CQ.do(CQHelper.MoveTo(player, new Vec2(50, 30), 0.05));
  //   CQ.do(
  //     CQHelper.DoFor((deltaTime: number) => {
  //       player.position.add(new Vec2(0.005 * deltaTime, 0));
  //     }, 2500)
  //   ).thenDo(
  //     CQHelper.DoFor((deltaTime: number) => {
  //       player.position.add(new Vec2(0, 0.005 * deltaTime));
  //     }, 2500)
  //   );

  //   const nextPlayer = this._players[this._currentPlayerIndex + 1];

  //   CQ.do(
  //     CQHelper.DoFor((deltaTime: number) => {
  //       nextPlayer.position.add(new Vec2(0.005 * deltaTime, 0));
  //     }, 10_000)
  //   );
  // }

  // private get curPlayer() {
  //   return this._players[this._currentPlayerIndex];
  // }

  start() {
    this.isRunning.value = true;
    this._loop.start();
  }

  stop() {
    this.isRunning.value = false;
    this._loop.stop();
  }

  // turnPlayer() {
  //   if (CQ.inProgress()) {
  //     return;
  //   }
  //   this.curPlayer.turn();
  //   this.nextPlayer();
  // }

  // movePlayerToNextCar() {
  //   if (CQ.inProgress()) {
  //     return;
  //   }
  //   this.curPlayer.moveToNextCar();
  //   this.nextPlayer();
  // }

  // bumpPlayer() {
  //   if (CQ.inProgress()) {
  //     return;
  //   }

  //   this.curPlayer.bump('left');
  //   this.nextPlayer();
  // }

  // shootPlayer() {
  //   if (CQ.inProgress()) {
  //     return;
  //   }
  //   this.curPlayer.shoot();
  //   this.nextPlayer();
  // }

  // climbPlayer() {
  //   if (CQ.inProgress()) {
  //     return;
  //   }
  //   this.curPlayer.climb();
  //   this.nextPlayer();
  // }

  // horsePlayer() {
  //   if (CQ.inProgress()) {
  //     return;
  //   }
  //   this.curPlayer.horse();
  //   this.nextPlayer();
  // }

  // reflexPlayer() {
  //   if (CQ.inProgress()) {
  //     return;
  //   }
  //   this.curPlayer.reflex();
  //   this.nextPlayer();
  // }

  // endRound() {
  //   if (CQ.inProgress()) {
  //     return;
  //   }
  //   const remainingPlayers = this._players.filter(p => !p.isInDeathZone);
  //   const playersToRemove = this._players.filter(p => p.isInDeathZone);

  //   // fix the next player index
  //   const curPlayer = this.curPlayer;
  //   if (remainingPlayers.includes(curPlayer)) {
  //     this._players = remainingPlayers;
  //     this._currentPlayerIndex = this._players.indexOf(curPlayer);
  //   } else {
  //     const playerCircle = this._players.slice();
  //     playerCircle.push(...playerCircle);
  //     let nextIndex = 0;
  //     for (let i = this._currentPlayerIndex; i < playerCircle.length; i++) {
  //       const playerToCheck = playerCircle[i];
  //       if (remainingPlayers.includes(playerToCheck)) {
  //         nextIndex = i;
  //         break;
  //       }
  //     }

  //     this._players = remainingPlayers;

  //     this._currentPlayerIndex = nextIndex;
  //   }

  //   playersToRemove.forEach(p => p.parent?.removeChild(p));

  //   const playerCount = this._players.length;
  //   if (playerCount === 1) {
  //     this.status.value = 'win';
  //   } else if (playerCount === 0) {
  //     this.status.value = 'draw';
  //   }

  //   this.nextPlayer();
  // }

  // private nextPlayer() {
  //   let nextId = this._currentPlayerIndex + 1;
  //   if (nextId >= this._players.length) {
  //     nextId = 0;
  //   }
  //   this._currentPlayerIndex = nextId;
  // }

  // private addChild(gameObject: GameObject) {
  //   this._root.addChild(gameObject);
  // }

  private update(delta: number) {
    this.root.stepEntry(delta, this.root);
    CQ.step(delta);
  }

  private render() {
    // clear everything to prevent artifacts
    this._ctx.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y);

    this.root.draw(this._ctx, 0, 0);
  }
}
