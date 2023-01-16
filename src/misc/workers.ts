import {Event} from '../domain';
import TRACKING_SERVICE from '../service/tracking_service';
import {Logger} from '../service';

export interface Message {
  events: Event[];
}

export class SubmitEventWorker {

  async handle(message: Message): Promise<void> {
    const {events} = message;
    try {
      await TRACKING_SERVICE.multiTrack(events);
    } catch (ex) {
      // ignore tracking
      Logger.error('track event error cause', ex);
    }
  }
}
