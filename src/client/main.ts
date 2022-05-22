import Phaser from 'phaser'
import 'regenerator-runtime/runtime'

import Bootstrap from './scenes/Bootstrap'
import Game from './scenes/Game'
import GameOver from './scenes/GameOver'
import MainMenu from './scenes/MainMenu'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
    },
  },
  scene: [Bootstrap, MainMenu, Game, GameOver],
}

export default new Phaser.Game(config)
