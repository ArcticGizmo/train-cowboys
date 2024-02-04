import { Ref, ref, watch } from 'vue';
import { Vec2 } from './Vec2';
import { GameObject } from './GameObject';
import { Player } from './Player';
import { GameEngine } from './GameEngine';
import { Resources } from './Resources';
import { Sprite } from './Sprite';
import { getNextHorizonalMovePlacement, getNextHorizontalBumpPlacement, getNextVerticalPlacement, posFromGrid } from './utils';
import { Train } from './Train';
import { Direction } from './direction';

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

  isReady = ref(false);
  status = ref<GameStatus>('ongoing');

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

  init() {
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
    this._players[nextId].select();
  }

  private addPlayer(index: number) {
    // create a single player for testing purposes
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

  // ============ actions ===============
  async move() {
    const player = this.curPlayer;

    if (player.isStunned) {
      await this.standup(player);
      this.nextPlayer();
      return;
    }

    // determine new position
    const nextPlacement = getNextHorizonalMovePlacement(this._train, player.globalGridPos, player.direction);

    // move player
    player.playAnimation('WALK_RIGHT');
    await this._engine.moveToGrid(player, nextPlacement.globalGridPos, 500);
    player.playAnimation('IDLE_RIGHT');

    // recursively bump other players
    await this.tryBump(player, nextPlacement.globalGridPos, player.direction);
    this.nextPlayer();
  }

  async shoot() {
    const player = this.curPlayer;

    if (player.isStunned) {
      await this.standup(player);
      this.nextPlayer();
      return;
    }

    const { x, y } = player.globalGridPos;

    let otherPlayers = this.getOtherPlayers(player).filter(p => p.isAlive && !p.isStunned && p.globalGridPos.y === y);

    if (player.direction === 'left') {
      otherPlayers = otherPlayers.filter(p => p.globalGridPos.x < x);
      otherPlayers.sort((a, b) => b.globalGridPos.x - a.globalGridPos.x);
    } else {
      otherPlayers = otherPlayers.filter(p => p.globalGridPos.x > x);
      otherPlayers.sort((a, b) => a.globalGridPos.x - b.globalGridPos.x);
    }

    const playerToShoot = otherPlayers[0];

    player.playAnimation('SHOOT_RIGHT', true);

    const effects = [delay(1000).then(() => player.playAnimation('IDLE_RIGHT'))];

    if (playerToShoot) {
      playerToShoot.isStunned = true;
      const targetPlacement = getNextHorizonalMovePlacement(this._train, playerToShoot.globalGridPos, player.direction);
      effects.push(
        delay(500).then(async () => {
          playerToShoot.playAnimation('FALL_RIGHT', true);
          await delay(100);
          await this._engine.moveToGrid(playerToShoot, targetPlacement.globalGridPos, 200);
        })
      );
    }

    await Promise.all(effects);

    this.nextPlayer();
  }

  async turn() {
    const player = this.curPlayer;

    if (player.isStunned) {
      await this.standup(player);
      this.nextPlayer();
      return;
    }

    player.playAnimation('TURN_FROM_RIGHT', true);
    await delay(500);
    player.changeDirection();
    player.playAnimation('IDLE_RIGHT');
  }

  async climb() {
    // TODO: add a wrapper to prevent other actions being run
    // before this action has been completed
    const player = this.curPlayer;

    if (player.isStunned) {
      await this.standup(player);
      this.nextPlayer();
      return;
    }

    const curGrid = player.globalGridPos;
    const placements = this._train.getAllPlacements();
    // TODO: need to iron out the movement required here
    // is it your closest side? What if you are in the middle?
    const nextPlacement = getNextVerticalPlacement(placements, curGrid);

    // TODO: move in the x direction to the ladder

    // climb up ladder
    player.playAnimation('CLIMB');
    await this._engine.moveToGrid(player, nextPlacement.globalGridPos, 1000);
    player.playAnimation('IDLE_RIGHT');

    // recursively bump other players
    // TODO: figure out which direction bumping should work in
    await this.tryBump(player, nextPlacement.globalGridPos, player.direction);
    this.nextPlayer();
  }

  async reflex() {
    // TODO: reflex cannot work across rounds, so maybe a reflex counter
    // can be reset when required? (doulbe check the rules on that one)
    const player = this.curPlayer;

    if (!player.isStunned) {
      // falldown
      player.playAnimation('FALL_RIGHT', true);
      await delay(500);
      player.isStunned = true;
      this.nextPlayer();
      return;
    }

    const { x, y } = player.globalGridPos;

    let otherPlayers = this.getOtherPlayers(player).filter(p => p.isAlive && !p.isStunned && p.globalGridPos.y === y);

    if (player.direction === 'left') {
      otherPlayers = otherPlayers.filter(p => p.globalGridPos.x < x);
      otherPlayers.sort((a, b) => b.globalGridPos.x - a.globalGridPos.x);
    } else {
      otherPlayers = otherPlayers.filter(p => p.globalGridPos.x > x);
      otherPlayers.sort((a, b) => a.globalGridPos.x - b.globalGridPos.x);
    }

    const playerToShoot = otherPlayers[0];

    // reflex
    player.playAnimation('REFLEX_RIGHT', true);

    const effects = [delay(1500).then(() => player.playAnimation('IDLE_RIGHT'))];
    player.isStunned = false;

    if (playerToShoot) {
      playerToShoot.isStunned = true;
      const targetPlacement = getNextHorizonalMovePlacement(this._train, playerToShoot.globalGridPos, player.direction);
      effects.push(
        delay(500).then(async () => {
          playerToShoot.playAnimation('FALL_RIGHT', true);
          await delay(100);
          await this._engine.moveToGrid(playerToShoot, targetPlacement.globalGridPos, 200);
        })
      );
    }

    await Promise.all(effects);
    player.playAnimation('IDLE_RIGHT');

    this.nextPlayer();
  }

  async horse() {
    const player = this.curPlayer;

    if (player.isStunned) {
      await this.standup(player);
      this.nextPlayer();
      return;
    }

    const placement = this._train.getEngine().getBottomLeftPlacement();
    // TODO: this movement will become a path below the train
    await this._engine.moveToGrid(player, placement.globalGridPos, 1000);
    // TODO: animations -- fall -- horse mount -- horse ride -- horse dismount
    player.direction = 'right';
  }

  private async tryBump(bumper: Player, gridPos: Vec2, direction: Direction) {
    const playerToBump = this.getOtherPlayers(bumper).find(p => p.globalGridPos.equals(gridPos));
    if (!playerToBump) {
      return;
    }

    const nextPlacement = getNextHorizontalBumpPlacement(this._train.getAllPlacements(), gridPos, direction);
    playerToBump.playAnimation('WALK_RIGHT');
    await this._engine.moveToGrid(playerToBump, nextPlacement.globalGridPos, 250);
    playerToBump.playAnimation('IDLE_RIGHT');
    await this.tryBump(playerToBump, nextPlacement.globalGridPos, direction);
  }

  private async standup(player: Player) {
    player.playAnimation('STAND_RIGHT', true);
    await delay(1500);
    player.isStunned = false;
    player.playAnimation('IDLE_RIGHT');
  }
}
