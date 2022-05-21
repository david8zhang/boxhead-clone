import { Command } from '@colyseus/command'
import Player from '../states/Player'

interface Payload {
  playerId: string
  damage: number
}

export class DamagePlayerCommand extends Command {
  execute(data: Payload) {
    const playerIndex = this.room.state.players.findIndex((p: Player) => p.id == data.playerId)
    const playerToDamage = this.room.state.players[playerIndex]
    playerToDamage.health -= data.damage
  }
}
