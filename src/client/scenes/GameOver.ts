import { Scene } from 'phaser'
import Server from '../services/Service'
import { Constants } from '../utils/Constants'

export class GameOver extends Scene {
  constructor() {
    super('gameover')
  }

  create() {
    const gameOverText = this.add.text(0, 0, 'Game Over', { fontSize: '40px', color: 'white' })
    console.log(gameOverText)
    gameOverText.setPosition(
      Constants.GAME_WIDTH / 2 - gameOverText.displayWidth / 2,
      Constants.GAME_HEIGHT / 2 - gameOverText.displayHeight / 2
    )
  }
}
