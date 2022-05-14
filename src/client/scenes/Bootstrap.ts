import Phaser from 'phaser'
import Server from '../services/Service'

export default class Bootstrap extends Phaser.Scene {
  private server!: Server
  constructor() {
    super('bootstrap')
  }

  init() {
    this.server = new Server()
  }

  preload() {
    this.load.image('cell', 'chipBlue.png')
  }

  create() {
    this.scene.launch('game', {
      server: this.server,
    })
  }
}
