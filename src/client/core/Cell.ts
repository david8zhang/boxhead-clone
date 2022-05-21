import Game from '../scenes/Game'
import { Constants } from '../utils/Constants'
import { Antibody } from './Antibody'
import { Healthbar } from './Healthbar'

export class Cell {
  public id: string
  public sprite: Phaser.Physics.Arcade.Sprite
  public highlight: Phaser.Physics.Arcade.Sprite
  public game: Game
  public healthbar: Healthbar
  public isInvulnerable = false

  constructor(id: string, position: { x: number; y: number }, game: Game) {
    this.id = id
    this.game = game

    const { x, y } = position
    this.sprite = this.game.physics.add.sprite(x, y, 'cell').setDepth(1)
    this.sprite.setData('ref', this)
    this.sprite.setPushable(false)

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

  get health() {
    return this.healthbar.currHealth
  }

  takeDamage(damage: number) {
    if (!this.isInvulnerable) {
      this.flashTint(0xff0000)
      this.game.cameras.main.shake(100, 0.005)
      this.isInvulnerable = true
      this.healthbar.decreaseHealth(damage)
      if (this.healthbar.currHealth === 0) {
        this.game.removePlayer(this.id)
      }
      this.game.time.delayedCall(500, () => {
        this.isInvulnerable = false
      })
    }
  }

  flashTint(color: number) {
    this.highlight.setTintFill(color)
    this.sprite.setTintFill(color)
    this.game.time.addEvent({
      delay: 50,
      callback: () => {
        this.highlight.setTintFill(0xffff00)
        this.sprite.clearTint()
      },
    })
  }

  destroy() {
    this.sprite.destroy()
    this.highlight.destroy()
    this.healthbar.destroy()
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
