import { GameEngine } from '@/engine/GameEngine';
import { Ref, ref, watch } from 'vue';
import { Player } from './Player';
import { Sprite } from '@/engine/Sprite';
import { Resources } from '@/engine/Resources';
import { Vec2 } from '@/engine/Vec2';
import { GameObject } from '@/engine/GameObject';
import { SpaceShip } from './SpaceShip';
import { getClimbTarget, getNextHorizonalMovePlacement, getNextHorizontalBumpPlacement } from './movement';
import { Direction } from './direction.type';

const playerColors = ['red', 'blue', 'magenta', 'black', 'white'];
const WALK_SPEED = 80;
const JETPACK_SPEED = 160;

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
    const gridPos = this.ship.getRoom(index + 1).getEnteringPlacement('bottom', 'right').globalGridPos;
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

  private async doMove() {
    const player = this.curPlayer;

    if (player.isInDeathZone()) {
      await player.eject();
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
    await this.engine.moveToGrid(player, targetPlacement.globalGridPos, { speed: WALK_SPEED });
    player.playAnimation('IDLE');

    // recursively bump other players
    await this.tryBump(player, targetPlacement.globalGridPos, player.direction);
    this.nextPlayer();
  }

  async turn() {
    return this.doAction(() => this.doTurn());
  }

  private async doTurn() {
    const player = this.curPlayer;

    if (player.isInDeathZone()) {
      await player.eject();
      this.nextPlayer();
      this.removePlayer(player);
      return;
    }

    if (player.isStunned) {
      await player.standup();
      this.nextPlayer();
      return;
    }

    player.playAnimation('TURN_FROM', true);
    await delay(500);
    player.changeDirection();
    player.playAnimation('IDLE');
    this.nextPlayer();
  }

  async changeSides() {
    return this.doAction(() => this.doChangeSides());
  }

  private async doChangeSides() {
    const player = this.curPlayer;

    if (player.isInDeathZone()) {
      await player.eject();
      this.nextPlayer();
      this.removePlayer(player);
      return;
    }

    if (player.isStunned) {
      await player.standup();
      this.nextPlayer();
      return;
    }

    const roomIndex = player.placement.roomIndex;

    const climbTarget = getClimbTarget(this.ship.getRoom(roomIndex).getPlacements(), player.placement.level, player.direction);

    // walk to ladder
    player.changeDirection();
    player.playAnimation('WALK');
    const prepSpot = new Vec2(climbTarget.globalGridPos.x, player.globalGridPos.y);
    await this.engine.moveToGrid(player, prepSpot, { speed: WALK_SPEED });

    // traverse the ladder
    player.changeDirection();
    player.playAnimation('CLIMB');
    await this.engine.moveToGrid(player, climbTarget.globalGridPos, { speed: WALK_SPEED });
    player.playAnimation('IDLE');

    await this.tryBump(player, climbTarget.globalGridPos, player.direction);

    this.nextPlayer();
  }

  async jetpack() {
    return this.doAction(() => this.doJetpack());
  }

  private async doJetpack() {
    const player = this.curPlayer;

    if (player.isStunned && player.isInSafeZone()) {
      await player.standup();
      this.nextPlayer();
      return;
    }

    const timing = { speed: JETPACK_SPEED };
    const targetGridPos = this.ship.getRoom(0).getEnteringPlacement('bottom', 'left').globalGridPos;

    // exit ship -- move along bottom -- enter ship
    await this.engine.moveToGrid(player, new Vec2(player.globalGridPos.x, targetGridPos.y + 4), timing);
    await this.engine.moveToGrid(player, new Vec2(targetGridPos.x, targetGridPos.y + 4), timing);
    await this.engine.moveToGrid(player, targetGridPos, timing);

    player.direction = 'left';
    player.isStunned = false;
    player.playAnimation('IDLE');

    await this.tryBump(player, targetGridPos, 'right');
    this.nextPlayer();
  }

  async shoot() {
    return this.doAction(() => this.doShoot());
  }

  private async doShoot() {
    const player = this.curPlayer;

    if (player.isStunned) {
      await player.standup();
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
      const targetPlacement = getNextHorizonalMovePlacement(this.ship, playerToShoot.globalGridPos, player.direction);
      const isUnsafe = targetPlacement.isDeathZone;
      effects.push(
        delay(500).then(async () => {
          playerToShoot.playAnimation('FALL', true);
          await delay(100);

          await this.engine.moveToGrid(playerToShoot, targetPlacement.globalGridPos, { duration: 500 });

          if (isUnsafe) {
            playerToShoot.isStunned = true;
            playerToShoot.playAnimation('FREE_FALL');
          } else {
            await this.tryBump(playerToShoot, targetPlacement.globalGridPos, player.direction);
          }
        })
      );
    }

    await Promise.all(effects);

    this.nextPlayer();
  }

  async reflex() {
    return this.doAction(() => this.doReflex());
  }

  private async doReflex() {
    // TODO: reflex cannot work across rounds, so might need a reflex counter
    const player = this.curPlayer;

    if (player.isInDeathZone()) {
      await player.eject();
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
      const targetPlacement = getNextHorizonalMovePlacement(this.ship, playerToShoot.globalGridPos, player.direction);
      effects.push(
        delay(500).then(async () => {
          playerToShoot.playAnimation('FALL', true);
          await delay(100);
          await this.engine.moveToGrid(playerToShoot, targetPlacement.globalGridPos, { duration: 200 });
        })
      );
    }

    await Promise.all(effects);
    player.playAnimation('IDLE');

    this.nextPlayer();
  }
}
