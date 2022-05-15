import Game from '../scenes/Game'

export class Cell {
  private id: string
  public sprite: Phaser.Physics.Arcade.Sprite
  public highlight: Phaser.Physics.Arcade.Sprite
  public game: Game

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
  }

  toggleHighlight(state: boolean) {
    this.highlight.setVisible(state)
  }

  updatePosition(x: number, y: number) {
    this.sprite.setPosition(x, y)
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
}
