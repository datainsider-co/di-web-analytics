import {Properties} from "../domain";
import Queue from "storage-based-queue";
import {SubmitEngageWorker, SubmitEventWorker} from './workers';
import {Mutex} from 'async-mutex';

Queue.workers({SubmitEventWorker, SubmitEngageWorker});

export class PersistentQueue {
  private readonly queue = new Queue({
    storage: 'localstorage'
  });

  private readonly eventChannel = this.queue.create('event-channel');
  private readonly engageChannel = this.queue.create('engage-channel');
  private readonly mutex = new Mutex();

  constructor() {
    this.start();
  }

  private start() {
    this.eventChannel.start();
    this.engageChannel.start();
  }

  stop() {
    this.eventChannel.stop();
    this.engageChannel.stop();
  }

  async enqueueEvent(url: string, trackingApiKey: string, event: string, properties: Properties) {
    const releaser = await this.mutex.acquire();
    try {
      return await this.eventChannel.add({
        priority: 1,
        label: event,
        createdAt: Date.now(),
        handler: 'SubmitEventWorker',
        args: {url: url, trackingApiKey: trackingApiKey, event: event, properties: properties},
      });
    } finally {
      releaser();
    }
  }

  async enqueueEngage(url: string, trackingApiKey: string, userId: string, properties: Properties) {
    const releaser = await this.mutex.acquire();
    try {
      return await this.engageChannel.add({
        priority: 1,
        createdAt: Date.now(),
        handler: 'SubmitEngageWorker',
        args: {url: url, trackingApiKey: trackingApiKey, userId: userId, properties: properties},
      });
    } finally {
      releaser();
    }
  }
}
