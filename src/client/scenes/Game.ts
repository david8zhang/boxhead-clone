import Phaser from 'phaser'
import type Server from '../services/Service'

export default class Game extends Phaser.Scene {
  constructor() {
    super('game')
  }
  create(data: { server: Server }) {
    const { server } = data
    server.join()
  }
}
