<template>
  <canvas ref="canvas" style="border: 1px solid black" :width="CANVAS_WIDTH" :height="CANVAS_HEIGHT" />
  <div>
    <h3>Status: {{ gameStatus }}</h3>
  </div>
  <!-- <div>
    <h3>Actions</h3>
    <button @click="game.move()">Move</button>

    <button @click="game.climb()">Climb</button>
    <button @click="game.shoot()">Shoot</button>
    <button @click="game.turn()">Turn</button>
    <button @click="game.reflex()">reflex</button>
    <button @click="game.horse()">Horse</button>
    <button @click="onEndRound">END ROUND</button>
  </div>
  <div>
    <h3>Debug Actions</h3>
    <button @click="game.nextPlayer()">Next Player</button>
    <button @click="game.die()">Die</button>
    <button @click="onReset()">RESET</button>
    <button @click="game.removeLastCar()">Remove Car</button>
  </div> -->
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { SpaceCowboys, type GameStatus } from '@/game/SpaceCowboys';
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 400;

const gameStatus = ref<GameStatus>('ongoing');
const canvas = ref<HTMLCanvasElement>();

const game = new SpaceCowboys({ playerCount: 3, canvas });

// const onEndRound = async () => {
//   await game.endRound();
//   gameStatus.value = game.getGameStatus();
//   if (gameStatus.value !== 'ongoing') {
//     console.log(gameStatus.value);
//     game.stop();
//   }
// };

// const onReset = () => {
//   game.reset();
//   gameStatus.value = 'ongoing';
// };
</script>

<style scoped>
canvas {
  width: 100%;
  background-color: rgb(165, 252, 255);
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
