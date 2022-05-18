import Phaser from 'phaser'
import GameState from '~/server/states/GameState'
import { Player } from '~/types/IGameState'
import { Antibody } from '../core/Antibody'
import { Cell } from '../core/Cell'
import { Virus } from '../core/Virus'
import type Server from '../services/Service'
import { Constants } from '../utils/Constants'

export default class Game extends Phaser.Scene {
  private server?: Server
  public playerMapping: {
    [id: string]: Cell
  }
  private playerId: string = ''

  // WASD movement
  private keyW!: Phaser.Input.Keyboard.Key
  private keyA!: Phaser.Input.Keyboard.Key
  private keyS!: Phaser.Input.Keyboard.Key
  private keyD!: Phaser.Input.Keyboard.Key

  // Viruses
  private viruses!: Phaser.GameObjects.Group
  private antibodies!: Phaser.GameObjects.Group

  constructor() {
    super('game')
    this.playerMapping = {}
  }
  async create(data: { server: Server }) {
    // Setup gameobject groups
    this.viruses = this.add.group()
    this.antibodies = this.add.group()

    this.physics.add.collider(this.viruses, this.antibodies, (obj1, obj2) => {
      const virus = obj1.getData('ref') as Virus
      const antibody = obj2.getData('ref') as Antibody

      virus.destroy()
      antibody.destroy()
    })

    this.setupMousePointerListener()
    this.setupKeyboardKeys()
    this.setupSpawner()

    const { server } = data
    this.server = server
    if (!this.server) {
      throw new Error('Server instance missing')
    }
    await this.server.join()
    this.server.onceStateChanged(this.initGame)
  }

  setupSpawner() {
    this.time.addEvent({
      delay: 2000,
      callback: this.spawnVirus,
      callbackScope: this,
      repeat: -1,
    })
  }

  spawnVirus() {
    const fromTopBorder = Phaser.Math.Between(0, 1) === 0
    const randX = Phaser.Math.Between(0, Constants.GAME_WIDTH)
    const position = {
      x: randX,
      y: fromTopBorder ? Constants.GAME_HEIGHT - 20 : 20,
    }
    const virus = new Virus(position, this)
    const allPlayerIds = Object.keys(this.playerMapping)
    const randPlayerId = allPlayerIds[Phaser.Math.Between(0, allPlayerIds.length - 1)]
    const randPlayer = this.playerMapping[randPlayerId]
    virus.setMoveTarget(randPlayer)
    this.viruses.add(virus.sprite)
  }

  private initGame = (initialState: GameState) => {
    initialState.players.forEach((player) => {
      this.playerMapping[player.id] = new Cell(player.id, { x: player.x, y: player.y }, this)
    })

    // Register observers
    this.server?.onPlayerJoin(this.onPlayerJoin, this)
    this.server?.onPlayerLeave(this.onPlayerLeave, this)
    this.server?.onSetPlayerId(this.onSetPlayerId, this)
    this.server?.onPlayerMovementUpdate(this.onPlayerMovementUpdate, this)
    this.server?.onPlayerShoot(this.onPlayerShoot, this)
  }

  handlePlayerMovement() {
    if (!this.keyA || !this.keyD || !this.keyW || !this.keyS) {
      return
    }

    const leftDown = this.keyA.isDown
    const rightDown = this.keyD.isDown
    const upDown = this.keyW.isDown
    const downDown = this.keyS.isDown

    const currentCell = this.playerMapping[this.playerId]
    if (!currentCell) {
      return
    }
    const speed = Constants.PLAYER_SPEED
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

  setupKeyboardKeys() {
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  }

  setupMousePointerListener() {
    this.input.on('pointerup', () => {
      const target = {
        x: this.input.mousePointer.x,
        y: this.input.mousePointer.y,
      }
      const currentCell = this.playerMapping[this.playerId]
      if (currentCell) {
        const antibody = currentCell.shootAntibody(target)
        this.antibodies.add(antibody.sprite)
        this.server?.shoot(this.playerId, target)
      }
    })
  }

  private onPlayerMovementUpdate(player: Player, changes: any[]) {
    const playerToUpdate = this.playerMapping[player.id]
    if (playerToUpdate && player.id !== this.playerId) {
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

  private onPlayerShoot(player: Player, target: { x: number; y: number }) {
    const playerToUpdate = this.playerMapping[player.id]
    if (playerToUpdate && player.id !== this.playerId) {
      playerToUpdate.shootAntibody({
        x: target.x,
        y: target.y,
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
    if (this.viruses) {
      this.viruses.children.entries.forEach((virus) => {
        const virusRef: Virus = virus.getData('ref')
        virusRef.update()
      })
    }
  }
}
