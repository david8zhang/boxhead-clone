import { Command } from '@colyseus/command'
import { GamePlayingState } from '../../types/IGameState'

export class StartGameCommand extends Command {
  execute() {
    this.room.state.gamePlayingState = GamePlayingState.PLAYING
  }
}
