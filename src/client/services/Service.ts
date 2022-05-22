import { Client, Room } from 'colyseus.js'
import { Schema } from '@colyseus/schema'
import GameState from '~/server/states/GameState'
import { IVirus, Player } from '~/types/IGameState'
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

    this.room.state.viruses.onAdd = (virus) => {
      this.events.emit('spawn-virus', virus)
    }

    this.room.state.players.onAdd = (player) => {
      this.events.emit('player-join', player)

      player.onChange = (changes) => {
        // Update position
        const isPositionChange = changes.find((change) => {
          return change.field === 'x' || change.field == 'y'
        })
        if (isPositionChange) {
          this.events.emit('player-movement-update', player, changes)
        }

        // Projectile position
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

  onVirusSpawn(cb: (virus: IVirus) => void, context?: any) {
    this.events.on('spawn-virus', cb, context)
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

  onPlayerDamaged(cb: (player: Player, changes: any[]) => void, context?: any) {
    this.events.on('player-damage', cb, context)
  }

  onceStateChanged(cb: (state: GameState) => void, context?: any) {
    this.events.once('once-state-changed', cb, context)
  }

  onGameOver() {
    if (this.room) {
      this.room?.leave()
    }
  }

  movePlayer(playerId: string, position: { x?: number; y?: number }) {
    this.room?.send(Message.MovePlayer, {
      playerId,
      position,
    })
  }

  shoot(playerId: string, target: { x: number; y: number }) {
    this.room?.send(Message.Shoot, {
      playerId,
      target,
    })
  }

  killVirus(virusId: string) {
    this.room?.send(Message.KillVirus, {
      virusId,
    })
  }

  onPlayerDie(playerId: string) {
    this.room?.send(Message.PlayerDie, {
      playerId,
    })
  }

  startGame() {
    this.room?.send(Message.StartGame)
  }
}
