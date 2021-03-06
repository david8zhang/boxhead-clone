export interface IVirus {
  spawnX: number
  spawnY: number
  targetId: string
  virusId: string
}

export interface Player {
  x: number
  y: number
  id: string

  velocityX: number
  velocityY: number

  projectileTargetX: number
  projectileTargetY: number
  lastShotTimestamp: number
}

export interface GameState {
  players: Player[]
  viruses: Map<string, IVirus>
}

export enum GamePlayingState {
  PLAYING = 0,
  WAITING = 0,
}
