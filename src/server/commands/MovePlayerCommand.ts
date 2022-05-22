import { Command } from '@colyseus/command'
import Player from '../states/Player'

type Payload = {
  playerId: string
  velocity: {
    x: number
    y: number
  }
}

export default class MovePlayerCommand extends Command {
  execute(data: Payload) {
    const { playerId, velocity } = data
    const playerIndex = this.room.state.players.findIndex((p: Player) => playerId === p.id)
    const player = this.room.state.players[playerIndex]
    if (player) {
      if (velocity.x !== undefined) {
        player.velocityX = velocity.x
      }
      if (velocity.y !== undefined) {
        player.velocityY = velocity.y
      }
    }
  }
}
