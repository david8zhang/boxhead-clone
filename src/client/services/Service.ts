import { Client } from 'colyseus.js'

// This service will handle client-side communications with our multiplayer server
export default class Server {
  private client: Client
  constructor() {
    this.client = new Client('ws://localhost:2567')
  }

  // Join a room
  async join() {
    // Colyseus will automatically handle matchmaking
    const room = await this.client.joinOrCreate('test_room')
    console.log(room)
  }
}
