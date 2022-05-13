import { Room } from 'colyseus'
import MyState from './MyState'

export default class MyRoom extends Room<MyState> {
  onCreate() {
    this.setState(new MyState())
  }
}
