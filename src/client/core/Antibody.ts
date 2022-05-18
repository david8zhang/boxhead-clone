import Game from '../scenes/Game'

export class Antibody {
  public sprite: Phaser.Physics.Arcade.Sprite
  private game: Game
  constructor(x: number, y: number, game: Game) {
    this.game = game
    this.sprite = this.game.physics.add.sprite(x, y, 'antibody').setVisible(false)
    this.sprite.setData('ref', this)
  }

  public setVelocity(velocityVector: Phaser.Math.Vector2) {
    this.sprite.setVelocity(velocityVector.x, velocityVector.y)
  }

  public rotateToTarget(target: { x: number; y: number }) {
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
    this.sprite.setRotation(angle)
  }

  public setVisible(visibility: boolean) {
    this.sprite.setVisible(visibility)
  }

  public destroy() {
    this.sprite.destroy()
  }
}
