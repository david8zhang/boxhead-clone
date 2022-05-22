import { Command } from '@colyseus/command'

interface Payload {
  virusId: string
}

export class KillVirusCommand extends Command {
  execute(data: Payload) {
    if (this.room.state.viruses[data.virusId]) {
      this.room.state.viruses.delete(data.virusId)
    }
  }
}
