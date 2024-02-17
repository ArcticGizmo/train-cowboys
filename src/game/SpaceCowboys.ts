import { GameEngine } from '@/engine/GameEngine';
import { Ref, ref, watch } from 'vue';
import { Player } from './Player';
import { Sprite } from '@/engine/Sprite';
import { Resources } from '@/engine/Resources';
import { Vec2 } from '@/engine/Vec2';
import { GameObject } from '@/engine/GameObject';
import { SpaceShip } from './SpaceShip';

const playerColors = ['red', 'blue', 'magenta', 'black', 'white'];

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
    this.ship = new SpaceShip({ gridPos: new Vec2(1, 3), playerCount: this.playerCount });
    this.addChild(this.ship);

    // create some players
    for (let p = 0; p < this.playerCount; p++) {
      this.createPlayer(p);
    }

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

  nextPlayer() {
    let nextId = this.currentPlayerIndex + 1;
    if (nextId >= this.players.length) {
      nextId = 0;
    }
    this.currentPlayerIndex = nextId;

    // set selection
    this.players.forEach(p => p.unselect());
    this.players[nextId]?.select();
  }

  private createPlayer(index: number) {
    // TODO: take in facing direction as well
    const gridPos = this.ship.getRoom(index + 1).getEnteringPlacement('bottom', 'left').globalGridPos;
    const player = new Player({
      id: `player-${index}`,
      gridPos,
      color: playerColors[index]
    });
    this.players.push(player);
    this.addChild(player);
  }

  private removePlayer(player: Player) {
    const toRemove = this.players.find(p => p === player);

    if (!toRemove) {
      return;
    }

    player.destroy();
    this.players = this.players.filter(p => p !== player);
  }

  private getOtherPlayers(notThis: Player) {
    return this.players.filter(p => p !== notThis);
  }

  private playerInEndZone(player: Player) {
    // const placement = this._train.getAllPlacements().find(p => p.globalGridPos.equals(player.globalGridPos))!;
    // return this._train.isInEndZone(placement);
    return false;
  }

  private async animateFallingFromTrain(player: Player) {
    // TODO: groundY might be static for drawing the tracks?
    // const groundY = this._train.getEngine().getBottomLeftPlacement().globalGridPos.y + 1;
    // player.playAnimation('FREE_FALL');
    // const fallTo = new Vec2(player.globalGridPos.x, groundY);
    // await this._engine.moveToGrid(player, fallTo, { duration: 250 });
    // player.direction = 'left';
    // player.playAnimation('TUMBLE', true);
    // await this._engine.moveToGrid(player, new Vec2(this._playerCount * 40, groundY), { duration: 1000 });
  }

  private async standup(player: Player) {
    player.playAnimation('STAND', true);
    await delay(1500);
    player.isStunned = false;
    player.playAnimation('IDLE');
  }

  // =================== actions ===================== //
  private async doAction(action: () => Promise<void>) {
    if (this.actionRunning) {
      console.warn('action in progress. Request has been ignored');
      return false;
    }

    this.actionRunning = true;
    await action();
    this.actionRunning = false;
    return true;
  }

  async move() {
    return this.doAction(() => this.doMove());
  }

  async doMove() {}
}
