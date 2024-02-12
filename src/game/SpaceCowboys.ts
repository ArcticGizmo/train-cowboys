import { GameEngine } from '@/engine/GameEngine';
import { Ref, ref, watch } from 'vue';
import { Player } from './Player';
import { Sprite } from '@/engine/Sprite';
import { Resources } from '@/engine/Resources';
import { Vec2 } from '@/engine/Vec2';
import { GameObject } from '@/engine/GameObject';
import { SpaceShip } from './SpaceShip';

export interface SpaceCowboysConfig {
  canvas: Ref<HTMLCanvasElement | undefined>;
  playerCount: number;
}

export type GameStatus = 'ongoing' | 'win' | 'draw';

const delay = (duration: number) => new Promise(r => setTimeout(r, duration));

export class SpaceCowboys {
  private playerCount: number;
  private engine: GameEngine = null!;
  private players: Player[] = [];
  private currentPlayerIndex = 0;
  private ship: SpaceShip = null!;
  private actionRunning = false;

  isReady = ref(false);

  constructor(config: SpaceCowboysConfig) {
    this.playerCount = config.playerCount;

    watch(
      () => config.canvas.value,
      canvas => {
        const ctx = canvas?.getContext?.('2d');
        if (!ctx) {
          return;
        }

        this.engine = new GameEngine(ctx);
        this.isReady.value = true;
        this.init();
      }
    );
  }

  private addChild(obj: GameObject) {
    this.engine.root.addChild(obj);
  }

  private init() {
    this.actionRunning = false;
    this.players = [];
    this.currentPlayerIndex = 0;

    const bg = new Sprite({
      resource: Resources.grid,
      frameSize: new Vec2(1024, 1024),
      opacity: 0.1
    });
    this.addChild(bg);

    // create spaceship
    this.ship = new SpaceShip({ gridPos: new Vec2(4, 1), playerCount: this.playerCount });
    this.addChild(this.ship);

    this.engine.start();
  }

  get isRunning() {
    return this.engine.isRunning;
  }

  get curPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  stop() {
    this.engine.stop();
  }

  reset() {
    this.engine.root.destroy(true);
    this.engine.stop();
    this.engine = new GameEngine(this.engine.ctx);
    this.init();
  }
}
