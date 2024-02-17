import { Fragment, Ref, ref, watch } from 'vue';
import { Vec2 } from './Vec2';
import { GameObject } from './GameObject';
import { Player } from './Player';
import { GameEngine } from './GameEngine';
import { Resources } from './Resources';
import { Sprite } from './Sprite';
import { Train } from './Train';
import { Direction } from './direction.type';
import { Placement } from './Placement';
import { getNextHorizontalBumpPlacement } from './movement';

export type GameStatus = 'ongoing' | 'win' | 'draw';

const playerColors = ['red', 'blue', 'magenta', 'black', 'white'];

export interface TrainCowboysConfig {
  canvas: Ref<HTMLCanvasElement | undefined>;
  playerCount: number;
}

const delay = (duration: number) => new Promise(r => setTimeout(r, duration));

export class TrainCowboys {
  private _playerCount: number;
  private _engine: GameEngine = null!;
  private _players: Player[] = [];
  private _currentPlayerIndex = 0;
  private _train: Train = null!;
  private _actionRunning = false;

  isReady = ref(false);

  constructor(config: TrainCowboysConfig) {
    this._playerCount = config.playerCount;

    watch(
      () => config.canvas.value,
      c => {
        const ctx = c?.getContext?.('2d');
        if (!ctx) {
          return;
        }
        this._engine = new GameEngine(ctx);
        this.isReady.value = true;
        this.init();
      }
    );
  }

  get isRunning() {
    return this._engine.isRunning;
  }

  get curPlayer() {
    return this._players[this._currentPlayerIndex];
  }

  stop() {
    this._engine.stop();
  }

  reset() {
    this._engine.root.destroy(true);
    this._engine.stop();
    this._engine = new GameEngine(this._engine.ctx);
    this.init();
  }

  init() {
    this._actionRunning = false;
    this._players = [];
    this._currentPlayerIndex = 0;

    // create the background
    const bg = new Sprite({
      resource: Resources.grid,
      frameSize: new Vec2(1024, 1024),
      opacity: 0.1
    });
    this.addChild(bg);

    // create some train cars
    this._train = new Train({
      gridPosition: new Vec2(1, 4),
      playerCount: this._playerCount
    });
    this.addChild(this._train);

    // create some players
    for (let p = 0; p < this._playerCount; p++) {
      this.addPlayer(p);
    }

    // set the player selection
    this._players[this._currentPlayerIndex].select();

    // start the game automatically
    this._engine.start();
  }

  nextPlayer() {
    let nextId = this._currentPlayerIndex + 1;
    if (nextId >= this._players.length) {
      nextId = 0;
    }
    this._currentPlayerIndex = nextId;

    // set selection
    this._players.forEach(p => p.unselect());
    this._players[nextId]?.select();
  }

  private addPlayer(index: number) {
    const gridPos = this._train.getCar(index + 0).getEnteringPlacement('bottom', 'right').globalGridPos;
    const player = new Player({
      id: `player-${index}`,
      gridPos,
      color: playerColors[index]
    });

    this._players.push(player);
    this.addChild(player);
  }

  private addChild(obj: GameObject) {
    this._engine.root.addChild(obj);
  }

  private getOtherPlayers(notThis: Player) {
    return this._players.filter(p => p !== notThis);
  }

  private async animateFallingFromTrain(player: Player) {
    // TODO: groundY might be static for drawing the tracks?
    const groundY = this._train.getEngine().getBottomLeftPlacement().globalGridPos.y + 1;
    player.playAnimation('FREE_FALL');
    const fallTo = new Vec2(player.globalGridPos.x, groundY);
    await this._engine.moveToGrid(player, fallTo, { duration: 250 });

    player.direction = 'left';
    player.playAnimation('TUMBLE', true);
    await this._engine.moveToGrid(player, new Vec2(this._playerCount * 40, groundY), { duration: 1000 });
  }

  // ============ actions ===============
  private async doAction(action: () => Promise<void>) {
    if (this._actionRunning) {
      console.warn('action in progress. Request has been ignored');
      return;
    }

    this._actionRunning = true;

    try {
      await action();
    } finally {
      this._actionRunning = false;
    }
  }

  async move() {
    await this.doAction(() => this.doMove());
  }

  async doMove() {
    const player = this.curPlayer;

    if (player.isInDeathZone()) {
      await this.animateFallingFromTrain(player);
      this.nextPlayer();
      this.removePlayer(player);
      return;
    }

    if (player.isStunned) {
      await this.standup(player);
      this.nextPlayer();
      return;
    }

    // determine new position
    const nextPlacement = this._train.getNextHorizontalMovePlacement(player.placement, player.direction);
    if (nextPlacement.isDeathZone) {
      await this.moveUnsafe(player, nextPlacement);
    } else {
      await this.moveSafe(player, nextPlacement);
    }
  }

  private async moveUnsafe(player: Player, nextPlacement: Placement) {
    // play falling animation
    player.changeDirection();
    player.playAnimation('FALL', true);
    // this prevents players from being shot while in mid air
    player.isStunned = true;
    await this._engine.moveToGrid(player, nextPlacement.globalGridPos, { duration: 500 });
    player.playAnimation('FREE_FALL');
    this.nextPlayer();
  }

  private async moveSafe(player: Player, nextPlacement: Placement) {
    // move player
    player.playAnimation('WALK');
    await this._engine.moveToGrid(player, nextPlacement.globalGridPos, { speed: 40 });
    player.playAnimation('IDLE');

    // recursively bump other players
    await this.tryBump(player, nextPlacement, player.direction);
    this.nextPlayer();
  }

  async shoot() {
    await this.doAction(() => this.doShoot());
  }

  async doShoot() {
    const player = this.curPlayer;

    if (player.isInDeathZone()) {
      await this.animateFallingFromTrain(player);
      this.nextPlayer();
      this.removePlayer(player);
      return;
    }

    if (player.isStunned) {
      await this.standup(player);
      this.nextPlayer();
      return;
    }

    const { x, y } = player.globalGridPos;

    let otherPlayers = this.getOtherPlayers(player).filter(p => !p.isStunned && p.globalGridPos.y === y);

    if (player.direction === 'left') {
      otherPlayers = otherPlayers.filter(p => p.globalGridPos.x < x);
      otherPlayers.sort((a, b) => b.globalGridPos.x - a.globalGridPos.x);
    } else {
      otherPlayers = otherPlayers.filter(p => p.globalGridPos.x > x);
      otherPlayers.sort((a, b) => a.globalGridPos.x - b.globalGridPos.x);
    }

    const playerToShoot = otherPlayers[0];

    player.playAnimation('SHOOT', true);

    const effects = [delay(1000).then(() => player.playAnimation('IDLE'))];

    if (playerToShoot) {
      playerToShoot.isStunned = true;
      const targetPlacement = this._train.getNextHorizontalMovePlacement(playerToShoot.placement, player.direction);
      const isUnsafe = targetPlacement.isDeathZone;
      effects.push(
        delay(500).then(async () => {
          playerToShoot.playAnimation('FALL', true);
          await delay(100);

          await this._engine.moveToGrid(playerToShoot, targetPlacement.globalGridPos, { duration: 500 });

          if (isUnsafe) {
            playerToShoot.isStunned = true;
            playerToShoot.playAnimation('FREE_FALL');
          } else {
            await this.tryBump(playerToShoot, targetPlacement, player.direction);
          }
        })
      );
    }

    await Promise.all(effects);

    this.nextPlayer();
  }

  async turn() {
    await this.doAction(() => this.doTurn());
  }

  async doTurn() {
    const player = this.curPlayer;

    if (player.isInDeathZone()) {
      await this.animateFallingFromTrain(player);
      this.nextPlayer();
      this.removePlayer(player);
      return;
    }

    if (player.isStunned) {
      await this.standup(player);
      this.nextPlayer();
      return;
    }

    player.playAnimation('TURN_FROM', true);
    await delay(500);
    player.changeDirection();
    player.playAnimation('IDLE');
    this.nextPlayer();
  }

  async climb() {
    await this.doAction(() => this.doClimb());
  }

  async doClimb() {
    // TODO: add a wrapper to prevent other actions being run
    // before this action has been completed
    const player = this.curPlayer;

    if (player.isInDeathZone()) {
      await this.animateFallingFromTrain(player);
      this.nextPlayer();
      this.removePlayer(player);
      return;
    }

    if (player.isStunned) {
      await this.standup(player);
      this.nextPlayer();
      return;
    }

    const climbTarget = this._train.getClimbTarget(player.placement.carIndex, player.placement.level, player.direction);

    // walk to under/over the ladder
    player.changeDirection();
    player.playAnimation('WALK');
    const prepSpot = new Vec2(climbTarget.globalGridPos.x, player.globalGridPos.y);
    await this._engine.moveToGrid(player, prepSpot, { speed: 40 });

    // traverse the ladder
    // TODO: handle direction changes
    player.changeDirection();
    player.playAnimation('CLIMB');
    await this._engine.moveToGrid(player, climbTarget.globalGridPos, { duration: 1000 });
    player.playAnimation('IDLE');

    await this.tryBump(player, climbTarget, player.direction);

    this.nextPlayer();
  }

  async reflex() {
    await this.doAction(() => this.doReflex());
  }

  async doReflex() {
    // TODO: reflex cannot work across rounds, so maybe a reflex counter
    // can be reset when required? (doulbe check the rules on that one)
    const player = this.curPlayer;

    if (player.isInDeathZone()) {
      await this.animateFallingFromTrain(player);
      this.nextPlayer();
      this.removePlayer(player);
      return;
    }

    if (!player.isStunned) {
      // falldown
      player.playAnimation('FALL', true);
      await delay(500);
      player.isStunned = true;
      this.nextPlayer();
      return;
    }

    const { x, y } = player.globalGridPos;

    let otherPlayers = this.getOtherPlayers(player).filter(p => !p.isStunned && p.globalGridPos.y === y);

    if (player.direction === 'left') {
      otherPlayers = otherPlayers.filter(p => p.globalGridPos.x < x);
      otherPlayers.sort((a, b) => b.globalGridPos.x - a.globalGridPos.x);
    } else {
      otherPlayers = otherPlayers.filter(p => p.globalGridPos.x > x);
      otherPlayers.sort((a, b) => a.globalGridPos.x - b.globalGridPos.x);
    }

    const playerToShoot = otherPlayers[0];

    // reflex
    player.playAnimation('REFLEX', true);

    const effects = [delay(1500).then(() => player.playAnimation('IDLE'))];
    player.isStunned = false;

    if (playerToShoot) {
      playerToShoot.isStunned = true;
      const targetPlacement = this._train.getNextHorizontalMovePlacement(playerToShoot.placement, player.direction);
      effects.push(
        delay(500).then(async () => {
          playerToShoot.playAnimation('FALL', true);
          await delay(100);
          await this._engine.moveToGrid(playerToShoot, targetPlacement.globalGridPos, { duration: 200 });
        })
      );
    }

    await Promise.all(effects);
    player.playAnimation('IDLE');

    this.nextPlayer();
  }

  async horse() {
    await this.doAction(() => this.doHorse());
  }

  async doHorse() {
    const player = this.curPlayer;

    if (player.isStunned && player.isInSafeZone()) {
      await this.standup(player);
      this.nextPlayer();
      return;
    }

    const placement = this._train.getEngine().getBottomLeftPlacement();

    // TODO: this movement will become a path below the train (with horse animation)
    // potentially look at the player jumping off screen and the horse comes back in frame
    await this._engine.moveToGrid(player, placement.globalGridPos, { duration: 1000 });
    // TODO: animations -- fall -- horse mount -- horse ride -- horse dismount
    player.direction = 'left';
    player.isStunned = false;
    player.playAnimation('IDLE');

    await this.tryBump(player, placement, 'right');
    this.nextPlayer();
  }

  private async tryBump(bumper: Player, placement: Placement, direction: Direction) {
    const playerToBump = this.getOtherPlayers(bumper).find(p => p.globalGridPos.equals(placement.globalGridPos));
    if (!playerToBump) {
      return;
    }

    const nextPlacement = this._train.getNextHorizontalBumpPlacement(placement, direction);
    playerToBump.playAnimation('WALK');
    await this._engine.moveToGrid(playerToBump, nextPlacement.globalGridPos, { duration: 1000 });
    playerToBump.playAnimation('IDLE');
    await this.tryBump(playerToBump, nextPlacement, direction);
  }

  async endRound() {
    await this.doAction(() => this.doEndRound());
  }

  async doEndRound() {
    console.log('--- end round');
    // if any player is in the death zone, kill them
    const playersInDeathZone = this._players.filter(p => p.placement.isDeathZone);

    await Promise.all(
      playersInDeathZone.map(async (p, index) => {
        await delay(index * 100);
        await this.animateFallingFromTrain(p);
        this.removePlayer(p);
      })
    );

    // explode the train
    const deathX = this._train.getCaboose().getBottomLeftPlacement().globalGridPos.x;
    const playersOnCaboose = this._players.filter(p => p.globalGridPos.x >= deathX);

    // TODO: add caboose explosions
    playersOnCaboose.forEach(p => this.removePlayer(p));
    this._train.removeCaboose();

    // add loot animation to get player furthest to the back

    // change the starting player for the next round
    this.nextPlayer();
  }

  private removePlayer(player: Player) {
    const toRemove = this._players.find(p => p === player);

    if (!toRemove) {
      return;
    }

    player.destroy();
    this._players = this._players.filter(p => p !== player);
  }

  private async standup(player: Player) {
    player.playAnimation('STAND', true);
    await delay(1500);
    player.isStunned = false;
    player.playAnimation('IDLE');
  }

  getGameStatus(): GameStatus {
    const playerCount = this._players.length;
    if (playerCount === 0) return 'draw';
    if (playerCount === 1) return 'win';

    // TODO: if there is only the locamotive, the winner is based on
    // who has the most loot. Might need a more robust return for this one
    return 'ongoing';
  }

  // ================ debug ==============
  public die() {
    const player = this.curPlayer;
    this.removePlayer(player);
    this.nextPlayer();
  }

  public removeLastCar() {
    this._train.removeCaboose();
  }
}
