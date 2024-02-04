import { Ref, ref, watch } from 'vue';
import { Vec2 } from './Vec2';
import { GameObject } from './GameObject';
import { Player } from './Player';
import { GameEngine } from './GameEngine';
import { Resources } from './Resources';
import { Sprite } from './Sprite';
import { TimelineBuilder } from './Timeline';

export type GameStatus = 'ongoing' | 'win' | 'draw';

const playerColors = ['red', 'blue', 'magenta', 'black', 'white'];

export interface TrainCowboysConfig {
  canvas: Ref<HTMLCanvasElement | undefined>;
  playerCount: number;
}

export class TrainCowboys {
  private _playerCount: number;
  private _engine: GameEngine = null!;
  private _players: Player[] = [];
  private _currentPlayerIndex = 0;

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

    // create some players
    for (let p = 0; p < this._playerCount; p++) {
      this.addPlayer(p);
    }

    this._players[this._currentPlayerIndex].select();

    // start the game automatically
    this._engine.start();
  }

  async test() {
    console.log('--- testing movement');
    const p = this.curPlayer;
    p.gridPos = new Vec2(4, 4);

    const speed = 0.05;
    let time = 0;
    await this._engine.registerHandle((done, deltaTime) => {
      time += deltaTime;
      console.log('---- run');
      if (time > 1500) {
        done();
      }

      p.position.add(new Vec2(1, 0).scale(speed * deltaTime));
    });

    console.log('---- finished');

    // const tl = new TimelineBuilder()
    //   .then(() => new Promise(r => setTimeout(r, 500)))
    //   .then(() => new Promise(r => setTimeout(r, 500)))
    //   .then(() => new Promise(r => setTimeout(r, 500)))
    //   .build();

    // await tl.run(index => console.log(index));
    // console.log('---- completed');
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
    const player = new Player({
      id: `player-${index}`,
      gridPos: new Vec2(2 + 2 * index, 2),
      color: playerColors[index]
    });

    this._players.push(player);
    this.addChild(player);
  }

  private addChild(obj: GameObject) {
    this._engine.root.addChild(obj);
  }
}
