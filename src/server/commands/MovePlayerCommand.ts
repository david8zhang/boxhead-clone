import { Command } from '@colyseus/command'
import Player from '../states/Player'

type Payload = {
  playerId: string
  position: {
    x: number
    y: number
  }
}

export default class MovePlayerCommand extends Command {
  execute(data: Payload) {
    const { playerId, position } = data
    const playerIndex = this.room.state.players.findIndex((p: Player) => playerId === p.id)
    const player = this.room.state.players[playerIndex]
    if (player) {
      if (position.x !== undefined) {
        player.x = position.x
      }
      if (position.y !== undefined) {
        player.y = position.y
      }
    }
  }
}
