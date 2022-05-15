import Phaser from 'phaser'
import GameState from '~/server/states/GameState'
import { Player } from '~/types/IGameState'
import { Cell } from '../core/Cell'
import type Server from '../services/Service'

export default class Game extends Phaser.Scene {
  private server?: Server
  public playerMapping: {
    [id: string]: Cell
  }
  private playerId: string = ''

  constructor() {
    super('game')
    this.playerMapping = {}
  }
  async create(data: { server: Server }) {
    const { server } = data
    this.server = server
    if (!this.server) {
      throw new Error('Server instance missing')
    }

    await this.server.join()
    this.server.onceStateChanged(this.initGame)
  }

  private initGame = (initialState: GameState) => {
    initialState.players.forEach((player) => {
      this.playerMapping[player.id] = new Cell(player.id, { x: player.x, y: player.y }, this)
    })

    // Register observers
    this.server?.onPlayerJoin(this.onPlayerJoin, this)
    this.server?.onPlayerLeave(this.onPlayerLeave, this)
    this.server?.onSetPlayerId(this.onSetPlayerId, this)
    this.server?.onPlayerUpdate(this.onPlayerUpdate, this)
  }

  handlePlayerMovement() {
    const keyboard = this.input.keyboard.createCursorKeys()
    const leftDown = keyboard.left.isDown
    const rightDown = keyboard.right.isDown
    const upDown = keyboard.up.isDown
    const downDown = keyboard.down.isDown

    const currentCell = this.playerMapping[this.playerId]
    if (!currentCell) {
      return
    }
    const speed = 100
    if (leftDown || rightDown) {
      let velocityX = leftDown ? -speed : speed
      if (leftDown && rightDown) {
        velocityX = 0
      }
      currentCell.setVelocityX(velocityX)
      this.server?.movePlayer(this.playerId, { x: velocityX })
    } else {
      currentCell.setVelocityX(0)
      this.server?.movePlayer(this.playerId, { x: 0 })
    }
    if (upDown || downDown) {
      let velocityY = upDown ? -speed : speed
      if (upDown && downDown) {
        velocityY = 0
      }
      currentCell.setVelocityY(velocityY)
      this.server?.movePlayer(this.playerId, { y: velocityY })
    } else {
      currentCell.setVelocityY(0)
      this.server?.movePlayer(this.playerId, { y: 0 })
    }
  }

  private onPlayerUpdate(player: Player, changes: any[]) {
    const playerToUpdate = this.playerMapping[player.id]
    if (playerToUpdate) {
      changes.forEach((change) => {
        const { field, value } = change
        if (field === 'xVelocity') {
          playerToUpdate.setVelocityX(value)
        }
        if (field === 'yVelocity') {
          playerToUpdate.setVelocityY(value)
        }
      })
    }
  }

  private onSetPlayerId(playerId: string) {
    this.playerId = playerId
    this.playerMapping[playerId].toggleHighlight(true)
  }

  private onPlayerJoin(newPlayer: Player) {
    this.playerMapping[newPlayer.id] = new Cell(
      newPlayer.id,
      { x: newPlayer.x, y: newPlayer.y },
      this
    )
  }

  private onPlayerLeave(playerToRemove: Player) {
    if (this.playerMapping[playerToRemove.id]) {
      this.playerMapping[playerToRemove.id].destroy()
      delete this.playerMapping[playerToRemove.id]
    }
  }

  update() {
    this.handlePlayerMovement()
  }
}
