<template>
  <canvas ref="canvas" style="border: 1px solid black" :width="CANVAS_WIDTH" :height="CANVAS_HEIGHT" />
</template>

<script setup lang="ts">
import { ref } from 'vue';

const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 200;

const canvas = ref<HTMLCanvasElement>();
</script>

<style scoped>
canvas {
  width: 100%;
  background-color: sandybrown;
}
</style>
