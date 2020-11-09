import {Properties} from "../domain";
import Queue from "storage-based-queue";
import {SubmitEventWorker, SubmitEngageWorker} from './workers';

export class PersistentQueue {
  private readonly queue = new Queue({
    storage: 'localstorage'
  });
  private readonly eventChannel = this.queue.create('event-channel');
  private readonly engageChannel = this.queue.create('engage-channel');

  start() {
    this.eventChannel.start();
    this.engageChannel.start();
  }

  stop() {
    this.eventChannel.stop();
    this.engageChannel.stop();
  }

  enqueueEvent(trackingApiKey: string, event: string, properties: Properties) {
    this.eventChannel.add({
      label: 'SubmitEventWorker',
      handler: 'SubmitEventWorker',
      args: {trackingApiKey: trackingApiKey, event: event, properties: properties},
    });
  }

  enqueueEngage(trackingApiKey: string, userId: string, properties: Properties) {
    this.engageChannel.add({
      label: 'SubmitEngageWorker',
      handler: 'SubmitEngageWorker',
      args: {trackingApiKey: trackingApiKey, userId: userId, properties: properties},
    });
  }
}
Queue.workers({SubmitEventWorker, SubmitEngageWorker});
