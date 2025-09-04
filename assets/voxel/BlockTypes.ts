export enum BlockId {
  AIR = 0,
  DIRT = 1,
  GRASS = 2,
  STONE = 3,
  LOG = 4,
  LEAF = 5,
}

export interface BlockData {
  id: BlockId
  name: string
  /** Color applied to all faces */
  color: string
  solid: boolean
}

export const BLOCK_DATA: Record<BlockId, BlockData> = {
  [BlockId.AIR]: {
    id: BlockId.AIR,
    name: "Air",
    color: "#000000",
    solid: false,
  },
  [BlockId.DIRT]: {
    id: BlockId.DIRT,
    name: "Dirt",
    color: "#8b4513",
    solid: true,
  },
  [BlockId.GRASS]: {
    id: BlockId.GRASS,
    name: "Grass",
    color: "#5e6b2e",
    solid: true,
  },
  [BlockId.STONE]: {
    id: BlockId.STONE,
    name: "Stone",
    color: "#6b7280",
    solid: true,
  },
  [BlockId.LOG]: {
    id: BlockId.LOG,
    name: "Log",
    color: "#92400e",
    solid: true,
  },
  [BlockId.LEAF]: {
    id: BlockId.LEAF,
    name: "Leaf",
    color: "#22c55e",
    solid: true,
  },
}

export const BlockTypes = BlockId