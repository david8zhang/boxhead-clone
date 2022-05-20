import Game from '../scenes/Game'

export interface HealthBarConfig {
  maxHealth: number
  length: number
  width: number
  position: {
    x: number
    y: number
  }
  onLoseAllHealthHandler?: () => void
}

export class Healthbar {
  private scene: Game

  public currHealth: number
  public maxHealth: number
  public position: { x: number; y: number }
  public length: number
  public width: number

  private bar: Phaser.GameObjects.Graphics
  public onHealthDecreased: Array<() => void> = []
  public onLoseAllHealthHandler: () => void = () => {}

  constructor(scene: Game, healthbarConfig: HealthBarConfig) {
    this.scene = scene
    this.currHealth = healthbarConfig.maxHealth
    this.maxHealth = healthbarConfig.maxHealth
    this.length = healthbarConfig.length
    this.width = healthbarConfig.width
    this.position = healthbarConfig.position
    if (healthbarConfig.onLoseAllHealthHandler) {
      this.onLoseAllHealthHandler = healthbarConfig.onLoseAllHealthHandler
    }

    this.bar = new Phaser.GameObjects.Graphics(this.scene)
    this.bar.setDepth(100)
    this.scene.add.existing(this.bar)
    this.draw()
  }

  setOnLoseAllHealthHandler(handler: () => void) {
    this.onLoseAllHealthHandler = handler
  }

  addOnHealthDecreasedHandler(handler: () => void) {
    this.onHealthDecreased.push(handler)
  }

  increaseHealth(amount: number): void {
    this.currHealth = Math.min(this.maxHealth, this.currHealth + amount)
    this.draw()
  }

  decreaseHealth(amount: number): void {
    this.currHealth -= amount
    this.onHealthDecreased.forEach((handler) => handler())
    this.draw()
    if (this.currHealth <= 0) {
      this.onLoseAllHealthHandler()
    }
  }

  setPosition(x: number, y: number) {
    this.position.x = x
    this.position.y = y
    this.draw()
  }

  draw(): void {
    this.bar.clear()
    const percentage = this.currHealth / this.maxHealth
    const length = Math.max(0, Math.floor(percentage * this.length))
    this.bar.fillStyle(0x000000)

    // Draw a black rectangle for healthbar BG
    this.bar.fillRect(this.position.x - this.length / 2, this.position.y, this.length, this.width)

    if (percentage <= 0.33) {
      this.bar.fillStyle(0xff0000)
    } else if (percentage <= 0.67) {
      this.bar.fillStyle(0xf1c40f)
    } else {
      this.bar.fillStyle(0x2ecc71)
    }

    // Draw a colored rectangle to represent health
    this.bar.fillRect(this.position.x - this.length / 2, this.position.y, length, this.width)
  }
}
