import { Ref, ref, watch } from 'vue';
import { Vec2 } from './Vec2';
import { GameObject } from './GameObject';
import { Player } from './Player';
import { GameEngine } from './GameEngine';
import { Resources } from './Resources';
import { Sprite } from './Sprite';
import { TimelineBuilder } from './Timeline';
import { getNextHorizontalPlacement, posFromGrid } from './utils';
import { Train } from './Train';
import { Placement } from './Placement';
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

  // ============ actions ===============
  async move() {
    const player = this.curPlayer;

    if (player.isStunned) {
      await this.standup(player);
      this.nextPlayer();
      return;
    }

    // determine new position
    const placements = this._train.getAllPlacements();
    const curPlacement = placements.find(p => p.globalGridPos.equals(player.globalGridPos))!;

    const carIndex = this._train.getCarIndexFromPlacement(curPlacement);

    let nextPlacement: Placement;
    const level = this._train.getEngine().getLevelFromPlacement(curPlacement);
    if (player.direction === 'left') {
      nextPlacement = this._train.getCar(carIndex - 1).getPlacement(level, 'right');
    } else {
      nextPlacement = this._train.getCar(carIndex + 1).getPlacement(level, 'left');
    }

    // move player
    player.playAnimation('WALK_RIGHT');
    await this._engine.moveToGrid(player, nextPlacement.globalGridPos, 500);

    // recursively bump other players
    await this.tryBump(player, nextPlacement.globalGridPos, player.direction);
    player.playAnimation('IDLE_RIGHT');
    this.nextPlayer();
  }

  private async tryBump(bumper: Player, gridPos: Vec2, direction: Direction) {
    const playerToBump = this._players.find(p => p !== bumper && p.globalGridPos.equals(gridPos));
    if (!playerToBump) {
      return;
    }

    const nextPlacement = getNextHorizontalPlacement(this._train.getAllPlacements(), gridPos, direction);
    playerToBump.playAnimation('WALK_RIGHT');
    await this._engine.moveToGrid(playerToBump, nextPlacement.globalGridPos, 250);
    playerToBump.playAnimation('IDLE_RIGHT');
    await this.tryBump(playerToBump, nextPlacement.globalGridPos, direction);
  }

  private async standup(player: Player) {
    player.playAnimation('IDLE_RIGHT');
    player.isStunned = false;
  }

  // ============ debug stuff ==============
  async test() {
    console.log('--- testing movement');
    const p = this.curPlayer;
    p.gridPos = new Vec2(2, 2);

    // Does the following
    // - move to the right
    // - climb down
    // - pause for a second
    // - move to the right
    // - shoot
    // - climb up
    p.playAnimation('WALK_RIGHT');
    await this._engine.moveToGrid(p, new Vec2(4, 2), 500);
    p.playAnimation('CLIMB');
    await this._engine.moveToGrid(p, new Vec2(4, 4), 500);
    p.playAnimation('IDLE_RIGHT');
    await delay(1000);
    p.playAnimation('WALK_RIGHT');
    await this._engine.moveToGrid(p, new Vec2(6, 4), 500);
    p.playAnimation('SHOOT_RIGHT', true);
    await delay(1000);
    p.playAnimation('CLIMB');
    await this._engine.moveToGrid(p, new Vec2(6, 2), 500);
    p.playAnimation('IDLE_RIGHT');
    console.log('---- finished');
  }

  async test2() {
    console.log('--- testing movement');
    const p1 = this._players[0];
    const p2 = this._players[1];

    p1.gridPos = new Vec2(2, 2);
    p1.playAnimation('IDLE_RIGHT');

    p2.gridPos = new Vec2(4, 2);
    p2.playAnimation('IDLE_RIGHT');

    // player 1 shoots player 2
    p1.playAnimation('SHOOT_RIGHT', true);

    await Promise.all([
      // revert player 2 animation
      delay(1000).then(() => {
        p1.playAnimation('IDLE_RIGHT');
      }),
      // make player 2 take impact
      delay(500).then(async () => {
        p2.playAnimation('FALL_RIGHT', true);
        await delay(100);
        await this._engine.moveToGrid(p2, new Vec2(6, 2), 50);
      })
    ]);

    console.log('---- finished');
  }
}
