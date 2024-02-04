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

    // create a single player for testing purposes
    const player = new Player({
      id: 'player-1',
      gridPos: new Vec2(2, 2),
      color: playerColors[0]
    });

    this.addChild(player);

    this._engine.start();
  }

  private addChild(obj: GameObject) {
    this._engine.root.addChild(obj);
    return this;
  }
}
