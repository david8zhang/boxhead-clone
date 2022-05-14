import Game from '../scenes/Game'

export class Cell {
  private id: string
  public sprite: Phaser.Physics.Arcade.Sprite
  public game: Game

  constructor(id: string, position: { x: number; y: number }, game: Game) {
    this.id = id
    this.game = game

    const { x, y } = position
    console.log(x, y)
    this.sprite = this.game.physics.add.sprite(x, y, 'cell')
  }

  updatePosition(x: number, y: number) {
    this.sprite.setPosition(x, y)
  }

  destroy() {
    this.sprite.destroy()
  }
}
