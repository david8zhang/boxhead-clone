import Game from '../scenes/Game'
import { Constants } from '../utils/Constants'
import { Cell } from './Cell'
import { Healthbar } from './Healthbar'

export class Virus {
  public id: string
  private game: Game
  public sprite: Phaser.Physics.Arcade.Sprite
  public moveTarget?: Cell
  public healthbar: Healthbar

  constructor(position: { x: number; y: number }, id: string, game: Game) {
    this.id = id
    this.game = game
    this.sprite = this.game.physics.add.sprite(position.x, position.y, 'virus').setScale(0.75)
    this.sprite.setData('ref', this)
    this.healthbar = new Healthbar(this.game, {
      maxHealth: Constants.VIRUS_HEALTH,
      width: 10,
      length: 50,
      position: {
        x: this.sprite.x,
        y: this.sprite.y - this.sprite.displayHeight,
      },
    })
  }

  setMoveTarget(moveTarget: Cell) {
    this.moveTarget = moveTarget
  }

  takeDamage(damage: number) {
    this.flashTint(0xff0000)
    this.game.cameras.main.shake(100, 0.005)
    this.healthbar.decreaseHealth(damage)
  }

  flashTint(color: number) {
    this.sprite.setTintFill(color)
    this.game.time.addEvent({
      delay: 50,
      callback: () => {
        this.sprite.clearTint()
      },
    })
  }

  get health() {
    return this.healthbar.currHealth
  }

  destroy() {
    this.sprite.destroy()
    this.healthbar.destroy()
  }

  update() {
    if (this.moveTarget) {
      const angle = Phaser.Math.Angle.BetweenPoints(
        {
          x: this.sprite.x,
          y: this.sprite.y,
        },
        {
          x: this.moveTarget.sprite.x,
          y: this.moveTarget.sprite.y,
        }
      )
      const velocityVector = new Phaser.Math.Vector2(0, 0)
      this.game.physics.velocityFromRotation(angle, Constants.VIRUS_SPEED, velocityVector)
      this.sprite.setVelocity(velocityVector.x, velocityVector.y)
    }
    this.healthbar.setPosition(this.sprite.x, this.sprite.y - this.sprite.displayHeight)
  }
}
