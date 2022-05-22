import { Command } from '@colyseus/command'
import Player from '../states/Player'

type Payload = {
  playerId: string
  target: {
    x: number
    y: number
  }
}

export class ShootCommand extends Command {
  execute(data: Payload) {
    const { playerId, target } = data
    const playerIndex = this.room.state.players.findIndex((p: Player) => playerId === p.id)
    const player: Player = this.room.state.players[playerIndex]
    if (player) {
      player.setLastShotProjectile(target)
    }
  }
}
