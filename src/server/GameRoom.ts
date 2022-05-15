import { Room, Client } from 'colyseus'
import GameState from './states/GameState'
import Player from './states/Player'
import Phaser from 'phaser'
import { Message } from '../types/Message'
import { Dispatcher } from '@colyseus/command'
import MovePlayerCommand from './commands/MovePlayerCommand'

export default class GameRoom extends Room<GameState> {
  private dispatcher = new Dispatcher(this)
  onCreate() {
    this.setState(new GameState())
    this.onMessage(Message.MovePlayer, (client, message) => {
      this.dispatcher.dispatch(new MovePlayerCommand(), {
        client,
        playerId: message.playerId,
        velocity: message.velocity,
      })
    })
  }

  onJoin(client: Client, options: any) {
    this.state.players.push(
      new Player(client.id, {
        x: Math.floor(Math.random() * 100),
        y: Math.floor(Math.random() * 100),
      })
    )
    client.send(Message.SetPlayerId, { playerId: client.id })
  }
  onLeave(client: Client, options: any) {
    const indexToRemove = this.state.players.findIndex((player) => player.id === client.id)
    this.state.players.deleteAt(indexToRemove)
  }
}
