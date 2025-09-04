import * as THREE from "three";
import { BlockId } from "./BlockTypes";

function makeTexture(draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext("2d")!;
  draw(ctx);
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

function noise(ctx: CanvasRenderingContext2D, c1: string, c2: string) {
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      ctx.fillStyle = Math.random() > 0.5 ? c1 : c2;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

export function createBlockTextures(): Record<BlockId, THREE.Texture> {
  const textures: Partial<Record<BlockId, THREE.Texture>> = {};

  textures[BlockId.DIRT] = makeTexture((ctx) => {
    noise(ctx, "#8b4513", "#5e3410");
  });

  textures[BlockId.GRASS] = makeTexture((ctx) => {
    noise(ctx, "#6faa3a", "#4e822b");
  });

  textures[BlockId.STONE] = makeTexture((ctx) => {
    noise(ctx, "#7d7d7d", "#5a5a5a");
  });

  textures[BlockId.LOG] = makeTexture((ctx) => {
    for (let x = 0; x < 16; x++) {
      const color = x % 2 === 0 ? "#8a5a2d" : "#7b4b1e";
      for (let y = 0; y < 16; y++) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    for (let i = 0; i < 64; i++) {
      const x = Math.floor(Math.random() * 16);
      const y = Math.floor(Math.random() * 16);
      ctx.fillStyle = Math.random() > 0.5 ? "#9c6e3b" : "#6d4b1f";
      ctx.fillRect(x, y, 1, 1);
    }
  });

  textures[BlockId.LEAF] = makeTexture((ctx) => {
    noise(ctx, "#3d8f3d", "#2e6f2e");
  });

  return textures as Record<BlockId, THREE.Texture>;