import { Schema, type } from '@colyseus/schema'

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
export default class MyState extends Schema {
  @type('string')
  name = 'test_state'
}
