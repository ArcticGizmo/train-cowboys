import { GameEngine } from '@/engine/GameEngine';
import { Ref, ref, watch } from 'vue';
import { Player } from './Player';
import { Sprite } from '@/engine/Sprite';
import { Resources } from '@/engine/Resources';
import { Vec2 } from '@/engine/Vec2';
import { GameObject } from '@/engine/GameObject';
import { SpaceShip } from './SpaceShip';
import { getNextHorizonalMovePlacement, getNextHorizontalBumpPlacement } from './movement';
import { Direction } from './direction.type';

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
    this.curPlayer.select();

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

  private async tryBump(bumper: Player, gridPos: Vec2, direction: Direction) {
    const playerToBump = this.getOtherPlayers(bumper).find(p => p.globalGridPos.equals(gridPos));
    if (!playerToBump || playerToBump.isInDeathZone()) {
      return;
    }

    const targetPlacement = getNextHorizontalBumpPlacement(this.ship.getAllPlacements(), gridPos, direction);
    playerToBump.playAnimation('WALK');
    await this.engine.moveToGrid(playerToBump, targetPlacement.globalGridPos, { duration: 1000 });
    playerToBump.playAnimation('IDLE');
    await this.tryBump(playerToBump, targetPlacement.globalGridPos, direction);
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

  async doMove() {
    const player = this.curPlayer;

    if (player.isInDeathZone()) {
      player.eject();
      this.nextPlayer();
      this.removePlayer(player);
      return;
    }

    if (player.isStunned) {
      await player.standup();
      this.nextPlayer();
      return;
    }

    // determine new position
    const targetPlacement = getNextHorizonalMovePlacement(this.ship, player.globalGridPos, player.direction);

    // TODO: make unsafe player movement when moving into death zone
    player.playAnimation('WALK');
    await this.engine.moveToGrid(player, targetPlacement.globalGridPos, { speed: 40 });
    player.playAnimation('IDLE');

    // recursively bump other players
    await this.tryBump(player, targetPlacement.globalGridPos, player.direction);
    this.nextPlayer();
  }
}
