import { Room, Client } from 'colyseus'
import GameState from './states/GameState'
import Player from './states/Player'
import Phaser from 'phaser'
import { Message } from '../types/Message'
import { Dispatcher } from '@colyseus/command'
import MovePlayerCommand from './commands/MovePlayerCommand'
import { ShootCommand } from './commands/ShootCommand'
import { SpawnVirusCommand } from './commands/SpawnVirusCommand'
import { KillVirusCommand } from './commands/KillVirusCommand'
import { StartGameCommand } from './commands/StartGameCommand'
import { PlayerDieCommand } from './commands/PlayerDieCommand'

export default class GameRoom extends Room<GameState> {
  public spawnVirusInterval?: NodeJS.Timer
  private dispatcher = new Dispatcher(this)
  onCreate() {
    this.setState(new GameState())
    this.onMessage(Message.MovePlayer, (client, message) => {
      this.dispatcher.dispatch(new MovePlayerCommand(), {
        playerId: message.playerId,
        position: message.position,
      })
    })
    this.onMessage(Message.Shoot, (client, message) => {
      this.dispatcher.dispatch(new ShootCommand(), {
        playerId: message.playerId,
        target: message.target,
      })
    })
    this.onMessage(Message.KillVirus, (client, message) => {
      this.dispatcher.dispatch(new KillVirusCommand(), {
        virusId: message.virusId,
      })
    })
    this.onMessage(Message.StartGame, () => {
      this.dispatcher.dispatch(new StartGameCommand())
      // this.spawnVirusInterval = setInterval(() => {
      //   this.dispatcher.dispatch(new SpawnVirusCommand())
      // }, 2000)
    })

    this.onMessage(Message.PlayerDie, (client, message) => {
      this.dispatcher.dispatch(new PlayerDieCommand(), {
        playerId: message.playerId,
      })
    })
  }

  onJoin(client: Client) {
    this.state.players.push(
      new Player(client.id, {
        x: Math.floor(Math.random() * 800),
        y: Math.floor(Math.random() * 600),
      })
    )
    client.send(Message.SetPlayerId, {
      playerId: client.id,
    })
  }

  onLeave(client: Client) {
    const indexToRemove = this.state.players.findIndex((player) => player.id === client.id)
    this.state.players.deleteAt(indexToRemove)
  }
}
