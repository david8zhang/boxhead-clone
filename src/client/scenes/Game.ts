import Phaser from 'phaser'
import GameState from '~/server/states/GameState'
import { Player } from '~/types/IGameState'
import { Cell } from '../core/Cell'
import type Server from '../services/Service'

export default class Game extends Phaser.Scene {
  private server?: Server
  public playerMapping: {
    [id: string]: Cell
  }

  constructor() {
    super('game')
    this.playerMapping = {}
  }
  async create(data: { server: Server }) {
    const { server } = data
    this.server = server
    if (!this.server) {
      throw new Error('Server instance missing')
    }

    await this.server.join()
    this.server.onceStateChanged(this.initGame)
  }

  private initGame = (initialState: GameState) => {
    initialState.players.forEach((player) => {
      this.playerMapping[player.id] = new Cell(player.id, { x: player.x, y: player.y }, this)
    })

    // Register observers
    this.server?.onPlayerJoin(this.onPlayerJoin, this)
  }

  private onPlayerJoin(newPlayer: Player) {
    this.playerMapping[newPlayer.id] = new Cell(
      newPlayer.id,
      { x: newPlayer.x, y: newPlayer.y },
      this
    )
  }
}
