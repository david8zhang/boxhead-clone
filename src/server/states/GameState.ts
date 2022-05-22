import { Schema, ArraySchema, MapSchema, type } from '@colyseus/schema'
import { GamePlayingState } from '../../types/IGameState'
import Player from './Player'
import Virus from './Virus'

/**
 * Schemas are server-side data structures that help in synchronizing
 * game state across different clients
 *
 * 1. When the user joins the room, they receive the full state from the server
 * 2. At every "patchRate", binary patches of the state are sent to every client (50ms by default)
 * 3. Schema callbacks are triggered on client side when patches come in from the server
 * 4. onStateChange is triggered after all the latest patches have been applied in the client
 *
 * Note: Connected clients are always ensured to be in sync with the server
 */
export default class GameState extends Schema {
  @type([Player])
  players: ArraySchema<Player>

  @type({ map: Virus })
  viruses: MapSchema<Virus>

  @type('number')
  gamePlayingState: number = GamePlayingState.WAITING

  constructor() {
    super()
    this.players = new ArraySchema()
    this.viruses = new MapSchema()
  }
}
