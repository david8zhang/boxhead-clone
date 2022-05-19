import { Schema, type } from '@colyseus/schema'

export default class Virus extends Schema {
  @type('string')
  virusId: string

  @type('number')
  spawnX: number

  @type('number')
  spawnY: number

  @type('string')
  targetId: string

  constructor(spawnX: number, spawnY: number, targetId: string, virusId: string) {
    super()
    this.spawnX = spawnX
    this.spawnY = spawnY
    this.targetId = targetId
    this.virusId = virusId
  }
}
