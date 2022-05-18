import Game from '../scenes/Game'
import { Constants } from '../utils/Constants'
import { Cell } from './Cell'

export class Virus {
  private game: Game
  public sprite: Phaser.Physics.Arcade.Sprite
  private moveTarget?: Cell
  constructor(position: { x: number; y: number }, game: Game) {
    this.game = game
    this.sprite = this.game.physics.add.sprite(position.x, position.y, 'virus').setScale(0.75)
    this.sprite.setData('ref', this)
  }

  setMoveTarget(moveTarget: Cell) {
    this.moveTarget = moveTarget
  }

  destroy() {
    this.sprite.destroy()
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
  }
}
