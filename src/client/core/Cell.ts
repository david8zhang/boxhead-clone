import Game from '../scenes/Game'
import { Constants } from '../utils/Constants'
import { Antibody } from './Antibody'
import { Healthbar } from './Healthbar'

export class Cell {
  private id: string
  public sprite: Phaser.Physics.Arcade.Sprite
  public highlight: Phaser.Physics.Arcade.Sprite
  public game: Game
  public healthbar: Healthbar

  constructor(id: string, position: { x: number; y: number }, game: Game) {
    this.id = id
    this.game = game

    const { x, y } = position
    this.sprite = this.game.physics.add.sprite(x, y, 'cell').setDepth(1)
    this.highlight = this.game.physics.add
      .sprite(x, y, 'cell')
      .setDisplaySize(this.sprite.displayWidth * 1.25, this.sprite.displayHeight * 1.25)
      .setTintFill(0xffff00)
      .setVisible(false)

    this.healthbar = new Healthbar(this.game, {
      width: 10,
      length: 100,
      position: {
        x: this.sprite.x,
        y: this.sprite.y - this.sprite.displayHeight,
      },
      maxHealth: 100,
    })
  }

  toggleHighlight(state: boolean) {
    this.highlight.setVisible(state)
  }

  updatePosition(x: number, y: number) {
    this.sprite.setPosition(x, y)
  }

  shootAntibody(target: { x: number; y: number }) {
    const antibody = new Antibody(this.sprite.x, this.sprite.y, this.game)
    const angle = Phaser.Math.Angle.BetweenPoints(
      {
        x: this.sprite.x,
        y: this.sprite.y,
      },
      {
        x: target.x,
        y: target.y,
      }
    )
    const velocityVector = new Phaser.Math.Vector2(0, 0)
    this.game.physics.velocityFromRotation(angle, Constants.ANTIBODY_SPEED, velocityVector)
    antibody.rotateToTarget(target)
    antibody.setVelocity(velocityVector)
    antibody.setVisible(true)
    this.game.time.delayedCall(2000, () => {
      antibody.destroy()
    })
    return antibody
  }

  destroy() {
    this.sprite.destroy()
    this.highlight.destroy()
  }

  setVelocity(xVelocity: number, yVelocity: number) {
    this.highlight.setVelocity(xVelocity, yVelocity)
    this.sprite.setVelocity(xVelocity, yVelocity)
  }

  setVelocityX(xVelocity: number) {
    this.highlight.setVelocityX(xVelocity)
    this.sprite.setVelocityX(xVelocity)
  }

  setVelocityY(yVelocity: number) {
    this.highlight.setVelocityY(yVelocity)
    this.sprite.setVelocityY(yVelocity)
  }

  update() {
    this.healthbar.setPosition(this.sprite.x, this.sprite.y - this.sprite.displayHeight)
  }
}
