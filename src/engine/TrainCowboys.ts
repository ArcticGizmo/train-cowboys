import { Fragment, Ref, ref, watch } from 'vue';
import { Vec2 } from './Vec2';
import { GameObject } from './GameObject';
import { Player } from './Player';
import { GameEngine } from './GameEngine';
import { Resources } from './Resources';
import { Sprite } from './Sprite';
import { getNextHorizonalMovePlacement, getNextHorizontalBumpPlacement, getNextVerticalPlacement, posFromGrid } from './utils';
import { Train } from './Train';
import { Direction } from './direction';
import { Placement } from './Placement';
import { AnimationPlayer } from './animations/AnimationPlayer';
import { AnimationPattern } from './animations/AnimationPattern';
import { SmokeAnimations } from './animations/smokeAnimations';

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
    const gridPos = this._train.getCar(index + 1).getPlacement('bottom', 'left').globalGridPos;
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

  private playerInDeathZone(player: Player) {
    const placement = this._train.getAllPlacements().find(p => p.globalGridPos.equals(player.globalGridPos))!;
    return this._train.isInDeathZone(placement);
  }

  private async animateFallingFromTrain(player: Player) {
    // TODO: groundY might be static for drawing the tracks?
    const groundY = this._train.getEngine().getBottomLeftPlacement().globalGridPos.y + 1;
    player.playAnimation('FREE_FALL');
    const fallTo = new Vec2(player.globalGridPos.x, groundY);
    await this._engine.moveToGrid(player, fallTo, 250);

    player.direction = 'left';
    player.playAnimation('TUMBLE', true);
    await this._engine.moveToGrid(player, new Vec2(30, groundY), 1000);
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

    if (this.playerInDeathZone(player)) {
      await this.animateFallingFromTrain(player);
      this.nextPlayer();
      this.removePlayer(player);
      return;
    }

    if (player)
      if (player.isStunned) {
        await this.standup(player);
        this.nextPlayer();
        return;
      }

    // determine new position
    const nextPlacement = getNextHorizonalMovePlacement(this._train, player.globalGridPos, player.direction);

    if (this._train.isInDeathZone(nextPlacement)) {
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
    await this._engine.moveToGrid(player, nextPlacement.globalGridPos, 500);
    player.playAnimation('FREE_FALL');
    this.nextPlayer();
  }

  private async moveSafe(player: Player, nextPlacement: Placement) {
    // move player
    player.playAnimation('WALK');
    await this._engine.moveToGrid(player, nextPlacement.globalGridPos, 500);
    player.playAnimation('IDLE');

    // recursively bump other players
    await this.tryBump(player, nextPlacement.globalGridPos, player.direction);
    this.nextPlayer();
  }

  async shoot() {
    await this.doAction(() => this.doShoot());
  }

  async doShoot() {
    const player = this.curPlayer;

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
      const targetPlacement = getNextHorizonalMovePlacement(this._train, playerToShoot.globalGridPos, player.direction);
      effects.push(
        delay(500).then(async () => {
          playerToShoot.playAnimation('FALL', true);
          await delay(100);
          await this._engine.moveToGrid(playerToShoot, targetPlacement.globalGridPos, 200);
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

    if (this.playerInDeathZone(player)) {
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

    if (this.playerInDeathZone(player)) {
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

    const curGrid = player.globalGridPos;
    const placements = this._train.getAllPlacements();
    // TODO: move player so back is against car divider
    const nextPlacement = getNextVerticalPlacement(placements, curGrid);

    // TODO: move in the x direction to the ladder

    // climb up ladder
    player.playAnimation('CLIMB');
    await this._engine.moveToGrid(player, nextPlacement.globalGridPos, 1000);
    player.playAnimation('IDLE');

    // recursively bump other players
    // TODO: figure out which direction bumping should work in
    await this.tryBump(player, nextPlacement.globalGridPos, player.direction);
    this.nextPlayer();
  }

  async reflex() {
    await this.doAction(() => this.doReflex());
  }

  async doReflex() {
    // TODO: reflex cannot work across rounds, so maybe a reflex counter
    // can be reset when required? (doulbe check the rules on that one)
    const player = this.curPlayer;

    if (this.playerInDeathZone(player)) {
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
      const targetPlacement = getNextHorizonalMovePlacement(this._train, playerToShoot.globalGridPos, player.direction);
      effects.push(
        delay(500).then(async () => {
          playerToShoot.playAnimation('FALL', true);
          await delay(100);
          await this._engine.moveToGrid(playerToShoot, targetPlacement.globalGridPos, 200);
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

    if (!this.playerInDeathZone(player) && player.isStunned) {
      await this.standup(player);
      this.nextPlayer();
      return;
    }

    const placement = this._train.getEngine().getBottomLeftPlacement();
    // TODO: this movement will become a path below the train
    await this._engine.moveToGrid(player, placement.globalGridPos, 1000);
    // TODO: animations -- fall -- horse mount -- horse ride -- horse dismount
    player.direction = 'left';
    player.isStunned = false;
    player.playAnimation('IDLE');
  }

  private async tryBump(bumper: Player, gridPos: Vec2, direction: Direction) {
    const playerToBump = this.getOtherPlayers(bumper).find(p => p.globalGridPos.equals(gridPos));
    if (!playerToBump) {
      return;
    }

    const nextPlacement = getNextHorizontalBumpPlacement(this._train.getAllPlacements(), gridPos, direction);
    playerToBump.playAnimation('WALK');
    await this._engine.moveToGrid(playerToBump, nextPlacement.globalGridPos, 250);
    playerToBump.playAnimation('IDLE');
    await this.tryBump(playerToBump, nextPlacement.globalGridPos, direction);
  }

  async endRound() {
    await this.doAction(() => this.doEndRound());
  }

  async doEndRound() {
    console.log('--- end round');
    // if any player is in the death zone, kill them
    const placements = this._train.getAllPlacements();
    const playersInDeathZone = this._players.filter(player => {
      const placement = placements.find(p => p.globalGridPos.equals(player.globalGridPos))!;
      return this._train.isInDeathZone(placement);
    });

    await Promise.all(
      playersInDeathZone.map(async (p, index) => {
        await delay(index * 100);
        await this.animateFallingFromTrain(p);
        this.removePlayer(p);
      })
    );

    // remove the last car
    const caboose = this._train.getCaboose();

    // if any players are on the last car, play animation
    // sending them off the screen
    const deathX = this._train.getCaboose().getBottomLeftPlacement().globalGridPos.x;
    const playersOnCaboose = this._players.filter(p => p.globalGridPos.x >= deathX);

    // TODO: add caboose explosions
    await Promise.all(
      playersOnCaboose.map(async p => {
        await this.animateFallingFromTrain(p);
        this.removePlayer(p);
      })
    );

    this._train.removeCaboose();

    // TODO: add car animations and explosions (once there are car graphics)

    // add loot animation to get player furthest to the back

    // change the starting player for the next round
    this.nextPlayer();

    await delay(1000);
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
