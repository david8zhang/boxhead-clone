import { Schema, type } from '@colyseus/schema'

export default class Player extends Schema {
  @type('string') id: string
  @type('number') x: number
  @type('number') y: number
  constructor(id: string, position: { x: number; y: number }) {
    super()
    const { x, y } = position
    console.log('Added player at ', x, y)
    this.x = x
    this.y = y
    this.id = id
  }
}
