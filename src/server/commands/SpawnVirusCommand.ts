import { Command } from '@colyseus/command'
import short from 'short-uuid'
import Virus from '../states/Virus'

const GAME_WIDTH = 800
const GAME_HEIGHT = 600

export class SpawnVirusCommand extends Command {
  execute() {
    const virusId = short.generate()
    const fromTopBorder = Math.floor(Math.random() * 2) == 0
    const randX = Math.floor(Math.random() * GAME_WIDTH)
    const position = {
      x: randX,
      y: fromTopBorder ? GAME_HEIGHT - 20 : 20,
    }
    const players = this.room.state.players
    if (players.length > 0) {
      const randPlayerId = players[Math.floor(Math.random() * players.length)].id
      const newVirus = new Virus(position.x, position.y, randPlayerId, virusId)
      this.room.state.viruses.set(virusId, newVirus)
    }
  }
}
