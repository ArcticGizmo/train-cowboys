import { Ref, ref, watch } from 'vue';
import { Vec2 } from './Vec2';
import { GameObject } from './GameObject';
import { Player } from './Player';
import { GameEngine } from './GameEngine';
import { Resources } from './Resources';
import { Sprite } from './Sprite';

export type GameStatus = 'ongoing' | 'win' | 'draw';

const playerColors = ['red', 'blue', 'magenta', 'black', 'white'];

export interface TrainCowboysConfig {
  playerCount: number;
}

export class TrainCowboys {
  private _engine: GameEngine = null!;
  private _players: Player[] = [];
  private _currentPlayerIndex = 0;

  isReady = ref(false);
  status = ref<GameStatus>('ongoing');

  constructor(canvas: Ref<HTMLCanvasElement | undefined>) {
    watch(
      () => canvas.value,
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

  init() {
    // create the background
    const bg = new Sprite({
      resource: Resources.grid,
      frameSize: new Vec2(1024, 1024),
      opacity: 0.1
    });

    this.addChild(bg);

    // create some players
    this.addPlayer(0);
    this.addPlayer(1);

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
    const player = new Player({
      id: `player-${index}`,
      gridPos: new Vec2(2 + 4 * index, 2),
      color: playerColors[index]
    });

    this._players.push(player);
    this.addChild(player);
  }

  private addChild(obj: GameObject) {
    this._engine.root.addChild(obj);
  }
}
