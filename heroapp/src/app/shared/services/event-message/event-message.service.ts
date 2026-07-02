import {Injectable} from '@angular/core';
import {Broadcaster} from './broadcaster.service';

@Injectable()
export class EventMessage {

  constructor() {
  }

  public sendMessage(msgId: string, data?: any) {
    // add timeout for some case send message when init will show error
      Broadcaster.getInstance().broadcast(msgId, data);
  }

  public onMessage(key) {
    return Broadcaster.getInstance().on(key);
  }

}
