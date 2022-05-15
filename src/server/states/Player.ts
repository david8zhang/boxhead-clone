import { Schema, type } from '@colyseus/schema'

export default class Player extends Schema {
  @type('string') id: string
  @type('number') x: number
  @type('number') y: number
  @type('number') xVelocity: number = 0
  @type('number') yVelocity: number = 0

  constructor(id: string, position: { x: number; y: number }) {
    super()
    const { x, y } = position
    this.x = x
    this.y = y
    this.id = id
  }

  setVelocity(xVelocity: number, yVelocity: number) {
    this.xVelocity = xVelocity
    this.yVelocity = yVelocity
  }
}
