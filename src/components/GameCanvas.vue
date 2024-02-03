<template>
  <canvas ref="canvas" style="border: 1px solid black" :width="CANVAS_WIDTH" :height="CANVAS_HEIGHT" />
  <!-- <div>
    <h1>Status</h1>
    <p>isRunning: {{ engine.isRunning }}</p>
    <h1>buttons and stuff</h1>
    <button @click="engine.start()">Start</button>
    <button @click="engine.stop()">Stop</button>
  </div> -->
  <div>{{ engine.status }}</div>
  <div>
    <h1>Actions</h1>
    <button @click="onBump()">Bump</button>
    <button @click="onMove()">Move</button>
    <button @click="onTurn()">Turn</button>
    <button @click="onShoot()">Shoot</button>
    <button @click="onClimb()">Climb</button>
    <button @click="onHorse()">Horse</button>
    <button @click="onReflex()">Reflex</button>
    <br />
    <button @click="onEndRound()">End Round</button>
    <button @click="engine.testCQ()">Test CQ</button>
    <br />
    <h1>Animations</h1>
    <button v-for="name in ANIMATIONS" :key="name" @click="engine.playAnimation(name)">{{ name }}</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { GameEngine } from '@/engine/GameEngine';
import { Vec2 } from '@/engine/Vec2';
import { PlayerAnimations, type PlayerAnimationName } from '@/engine/animations/playerAnimations';
const CANVAS_WIDTH = 460;
const CANVAS_HEIGHT = 200;

// const CANVAS_WIDTH = 200;
// const CANVAS_HEIGHT = 100;

const engine = new GameEngine(new Vec2(CANVAS_WIDTH, CANVAS_HEIGHT));

const ANIMATIONS = Object.keys(PlayerAnimations) as PlayerAnimationName[];

const canvas = ref<HTMLCanvasElement>();

watch(
  () => canvas.value,
  c => {
    const ctx = c!.getContext('2d')!;
    if (!ctx) {
      throw 'Context not defined';
    }
    engine.bindContext(ctx);

    engine.init();
    engine.start();
  }
);

const onBump = () => {
  console.log('--- bump');
  engine.bumpPlayer();
};

const onMove = () => {
  console.log('--- move');
  engine.movePlayerToNextCar();
};

const onTurn = () => {
  console.log('--- turn');
  engine.turnPlayer();
};

const onShoot = () => {
  console.log('--- shoot');
  engine.shootPlayer();
};

const onClimb = () => {
  console.log('--- climb');
  engine.climbPlayer();
};

const onHorse = () => {
  console.log('--- horse');
  engine.horsePlayer();
};

const onReflex = () => {
  console.log('--- reflex');
  engine.reflexPlayer();
};

const onEndRound = () => {
  console.log('--- end round');
  engine.endRound();
};
</script>

<style scoped>
canvas {
  width: 100%;
  background-color: sandybrown;
  image-rendering: pixelated;
  image-rendering: optimizeSpeed;
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: -o-crisp-edges;
  image-rendering: crisp-edges;
  -ms-interpolation-mode: nearest-neighbor;
}

button,
p {
  font-size: 2rem;
}
</style>
