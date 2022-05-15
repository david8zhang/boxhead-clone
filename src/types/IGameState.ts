export interface Projectile {
  targetX: number
  targetY: number
}

export interface Player {
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
  players: Player
}
