import { Scene } from 'phaser'
import Server from '../services/Service'
import { Constants } from '../utils/Constants'

export default class MainMenu extends Scene {
  private server?: Server

  constructor() {
    super('menu')
  }

  create(data: { server: Server }) {
    this.server = data.server
    const mainTitleText = this.add.text(0, 0, 'Cells at War', {
      fontSize: '30px',
      color: 'white',
    })
    mainTitleText.setPosition(
      Constants.GAME_WIDTH / 2 - mainTitleText.displayWidth / 2,
      Constants.GAME_HEIGHT / 2 - mainTitleText.displayHeight / 2
    )

    const subtitleText = this.add.text(0, 0, 'Press Space to Play', {
      fontSize: '20px',
      color: 'white',
    })
    subtitleText.setPosition(
      Constants.GAME_WIDTH / 2 - subtitleText.displayWidth / 2,
      mainTitleText.y + 40
    )

    this.input.keyboard.on('keydown', (e) => {
      console.log(e)
      if (e.code === 'Space') {
        this.scene.start('game', {
          server: this.server,
        })
      }
    })
  }
}
