<template>
  <canvas ref="canvas" style="border: 1px solid black" :width="CANVAS_WIDTH" :height="CANVAS_HEIGHT" />
  <div>
    <h1>Status</h1>
    <p>isRunning: {{ engine.isRunning }}</p>
    <h1>buttons and stuff</h1>
    <button @click="engine.start()">Start</button>
    <button @click="engine.stop()">Stop</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { GameEngine } from '@/engine/GameEngine';
import { Vec2 } from '@/engine/Vec2';

const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 200;

const engine = new GameEngine(new Vec2(CANVAS_WIDTH, CANVAS_HEIGHT));

const canvas = ref<HTMLCanvasElement>();

watch(
  () => canvas.value,
  c => {
    const ctx = c!.getContext('2d')!;
    if (!ctx) {
      throw 'Context not defined';
    }
    engine.bindContext(ctx);

    console.log('engine starting');
    engine.init();
  }
);
</script>

<style scoped>
canvas {
  width: 100%;
  background-color: sandybrown;
}

button,
p {
  font-size: 2rem;
}
</style>
