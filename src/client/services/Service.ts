import { Client, Room } from 'colyseus.js'
import { Schema } from '@colyseus/schema'
import GameState from '~/server/states/GameState'
import { Player } from '~/types/IGameState'
import { Message } from '../../types/Message'

// This service will handle client-side communications with our multiplayer server
export default class Server {
  private client: Client
  private events: Phaser.Events.EventEmitter
  private room?: Room<GameState & Schema>
  private _playerId: string = ''

  constructor() {
    this.client = new Client('ws://localhost:2567')
    this.events = new Phaser.Events.EventEmitter()
  }

  get playerId() {
    return this._playerId
  }

  // Join a room
  async join() {
    // Colyseus will automatically handle matchmaking
    this.room = await this.client.joinOrCreate('game_room')

    this.room.onMessage(Message.SetPlayerId, (message) => {
      this._playerId = message.playerId
    })

    // Emit a state change event whenever state change is received from server
    this.room.onStateChange.once((state) => {
      this.events.emit('once-state-changed', state)
    })

    this.room.state.players.onAdd = (player) => {
      this.events.emit('player-join', player)
    }
  }

  onPlayerJoin(cb: (newPlayer: Player) => void, context?: any) {
    this.events.on('player-join', cb, context)
  }

  // Attach an observer to game state change events
  onceStateChanged(cb: (state: GameState) => void, context?: any) {
    this.events.once('once-state-changed', cb, context)
  }
}
