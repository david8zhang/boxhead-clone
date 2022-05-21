export interface IVirus {
  spawnX: number
  spawnY: number
  targetId: string
  virusId: string
}

export interface Player {
  health: number
  x: number
  y: number
  id: string

  xVelocity: number
  yVelocity: number

  projectileTargetX: number
  projectileTargetY: number
  lastShotTimestamp: number
}

export interface GameState {
  players: Player[]
  viruses: Map<string, IVirus>
}
