<template>
  <canvas ref="canvas" style="border: 1px solid black" :width="CANVAS_WIDTH" :height="CANVAS_HEIGHT" />
  <div>
    <h3>Status: {{ game.status }}</h3>
  </div>
  <div>
    <h3>Actions</h3>
    <button @click="game.move()">Move</button>
    
    <button @click="game.climb()">Climb</button>
    <button @click="game.shoot()">Shoot</button>
    <button @click="game.turn()">Turn</button>
    <button @click="game.reflex()">reflex</button>
    <button @click="game.horse()">Horse</button>
  </div>
  <div>
    <h3>Debug Actions</h3>
    <button @click="game.nextPlayer()">Next Player</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { TrainCowboys } from '@/engine/TrainCowboys';
const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 200;

// const CANVAS_WIDTH = 200;
// const CANVAS_HEIGHT = 100;
const canvas = ref<HTMLCanvasElement>();

const game = new TrainCowboys({ playerCount: 2, canvas });
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
  font-size: 1rem;
}
</style>
