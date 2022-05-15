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
      this.events.emit('set-player-id', message.playerId)
    })

    // Emit a state change event whenever state change is received from server
    this.room.onStateChange.once((state) => {
      this.events.emit('once-state-changed', state)
    })

    this.room.state.players.onAdd = (player) => {
      this.events.emit('player-join', player)

      player.onChange = (changes) => {
        const isPositionChange = changes.find((change) => {
          return change.field === 'xVelocity' || change.field == 'yVelocity'
        })
        if (isPositionChange) {
          this.events.emit('player-movement-update', player, changes)
        }

        const isProjectileChange = changes.find((change) => {
          return (
            change.field === 'projectileTargetX' ||
            change.field === 'projectileTargetY' ||
            change.field === 'lastShotTimestamp'
          )
        })
        if (isProjectileChange) {
          this.events.emit('player-shoot', player, {
            x: player.projectileTargetX,
            y: player.projectileTargetY,
          })
        }
      }

      player.triggerAll()
    }

    this.room.state.players.onRemove = (player) => {
      this.events.emit('player-leave', player)
    }
  }

  onPlayerMovementUpdate(cb: (player: Player, changes: any[]) => void, context?: any) {
    this.events.on('player-movement-update', cb, context)
  }

  onPlayerShoot(cb: (player: Player, target: { x: number; y: number }) => void, context?: any) {
    this.events.on('player-shoot', cb, context)
  }

  onSetPlayerId(cb: (playerId: string) => void, context?: any) {
    this.events.on('set-player-id', cb, context)
  }

  onPlayerJoin(cb: (newPlayer: Player) => void, context?: any) {
    this.events.on('player-join', cb, context)
  }

  onPlayerLeave(cb: (playerToRemove: Player) => void, context?: any) {
    this.events.on('player-leave', cb, context)
  }

  onceStateChanged(cb: (state: GameState) => void, context?: any) {
    this.events.once('once-state-changed', cb, context)
  }

  movePlayer(playerId: string, velocity: { x?: number; y?: number }) {
    this.room?.send(Message.MovePlayer, {
      playerId,
      velocity,
    })
  }

  shoot(playerId: string, target: { x: number; y: number }) {
    this.room?.send(Message.Shoot, {
      playerId,
      target,
    })
  }
}
