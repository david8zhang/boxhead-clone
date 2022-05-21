import Phaser from 'phaser'
import GameState from '~/server/states/GameState'
import { IVirus, Player } from '~/types/IGameState'
import { Antibody } from '../core/Antibody'
import { Cell } from '../core/Cell'
import { Virus } from '../core/Virus'
import type Server from '../services/Service'
import { Constants } from '../utils/Constants'

export default class Game extends Phaser.Scene {
  private server?: Server

  // WASD movement
  private keyW!: Phaser.Input.Keyboard.Key
  private keyA!: Phaser.Input.Keyboard.Key
  private keyS!: Phaser.Input.Keyboard.Key
  private keyD!: Phaser.Input.Keyboard.Key

  // Entities
  private viruses!: Phaser.GameObjects.Group
  private antibodies!: Phaser.GameObjects.Group

  // Player
  public cells!: Phaser.GameObjects.Group
  public playerMapping: {
    [id: string]: Cell
  }
  private playerId: string = ''

  constructor() {
    super('game')
    this.playerMapping = {}
  }
  async create(data: { server: Server }) {
    // Setup gameobject groups
    this.viruses = this.add.group()
    this.antibodies = this.add.group()
    this.cells = this.add.group()
    this.setupMousePointerListener()
    this.setupKeyboardKeys()

    const { server } = data
    this.server = server
    if (!this.server) {
      throw new Error('Server instance missing')
    }
    await this.server.join()
    this.server.onceStateChanged(this.initGame)

    // Create collider between viruses and antibodies
    this.setupVirusAntibodyCollider()
    this.setupVirusCellCollider()
  }

  setupVirusAntibodyCollider() {
    this.physics.add.collider(this.viruses, this.antibodies, (obj1, obj2) => {
      const virus = obj1.getData('ref') as Virus
      const antibody = obj2.getData('ref') as Antibody
      virus.destroy()
      antibody.destroy()

      if (this.server) {
        this.server.killVirus(virus.virusId)
      }
    })
  }

  setupVirusCellCollider() {
    this.physics.add.collider(this.viruses, this.cells, (obj1, obj2) => {
      const virus = obj1.getData('ref') as Virus
      const cell = obj2.getData('ref') as Cell
      cell.takeDamage(Constants.VIRUS_DAMAGE)
    })
  }

  private initGame = (initialState: GameState) => {
    initialState.players.forEach((player) => {
      const cell = new Cell(player.id, { x: player.x, y: player.y }, this)
      this.cells.add(cell.sprite)
      this.playerMapping[player.id] = cell
    })

    // Register observers
    this.server?.onPlayerJoin(this.onPlayerJoin, this)
    this.server?.onPlayerLeave(this.onPlayerLeave, this)
    this.server?.onSetPlayerId(this.onSetPlayerId, this)
    this.server?.onPlayerMovementUpdate(this.onPlayerMovementUpdate, this)
    this.server?.onPlayerShoot(this.onPlayerShoot, this)
    this.server?.onVirusSpawn(this.onSpawnVirus, this)
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
    this.input.on('pointerdown', () => {
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

  private onSpawnVirus(virus: IVirus) {
    const newVirus = new Virus(
      {
        x: virus.spawnX,
        y: virus.spawnY,
      },
      virus.virusId,
      this
    )
    const player = this.playerMapping[virus.targetId]
    newVirus.setMoveTarget(player)
    this.viruses.add(newVirus.sprite)
  }

  private onPlayerShoot(player: Player, target: { x: number; y: number }) {
    const playerToUpdate = this.playerMapping[player.id]
    if (playerToUpdate && player.id !== this.playerId) {
      const antibody = playerToUpdate.shootAntibody({
        x: target.x,
        y: target.y,
      })
      this.antibodies.add(antibody.sprite)
    }
  }

  private onSetPlayerId(playerId: string) {
    this.playerId = playerId
    this.playerMapping[playerId].toggleHighlight(true)
  }

  private onPlayerJoin(newPlayer: Player) {
    const cell = new Cell(newPlayer.id, { x: newPlayer.x, y: newPlayer.y }, this)
    this.playerMapping[newPlayer.id] = cell
    this.cells.add(cell.sprite)
  }

  private onPlayerLeave(playerToRemove: Player) {
    this.removePlayer(playerToRemove.id)
  }

  public removePlayer(playerId: string) {
    if (this.playerMapping[playerId]) {
      this.playerMapping[playerId].destroy()
      delete this.playerMapping[playerId]
    }
  }

  update() {
    this.handlePlayerMovement()
    this.viruses.children.entries.forEach((virusSprite) => {
      const virus: Virus = virusSprite.getData('ref')
      virus.update()
    })
    Object.keys(this.playerMapping).forEach((playerId: string) => {
      this.playerMapping[playerId].update()
    })
  }
}
