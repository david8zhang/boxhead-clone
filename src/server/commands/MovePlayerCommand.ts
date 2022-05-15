import { Command } from '@colyseus/command'
import { Client } from 'colyseus.js'
import Player from '../states/Player'

type Payload = {
  client: Client
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
        player.xVelocity = velocity.x
      }
      if (velocity.y !== undefined) {
        player.yVelocity = velocity.y
      }
    }
  }
}
