import { Command } from '@colyseus/command'

interface Payload {
  virusId: string
}

export class KillVirusCommand extends Command {
  execute(data: Payload) {
    this.room.state.viruses.delete(data.virusId)
  }
}
