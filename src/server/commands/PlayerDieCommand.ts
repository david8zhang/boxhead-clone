import { Command } from '@colyseus/command'
import Player from '../states/Player'

interface Payload {
  playerId: string
}

export class PlayerDieCommand extends Command {
  execute(data: Payload) {
    const indexToRemove = this.room.state.players.findIndex(
      (player: Player) => player.id === data.playerId
    )
    this.state.players.deleteAt(indexToRemove)
  }
}
