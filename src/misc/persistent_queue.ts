import Queue from 'storage-based-queue';
import {Message, SubmitEventWorker} from './workers';
import {Mutex} from 'async-mutex';
import {Event, Properties} from '../domain';

Queue.workers({SubmitEventWorker});

export class PersistentQueue {
  private readonly queue = new Queue({
    storage: 'localstorage'
  });

  private readonly maxSize: number;
  private readonly timePersistent: number;
  private readonly eventChannel = this.queue.create('event-track-channel');
  private readonly mutex = new Mutex();
  private tempEvents: Event[] = [];
  private currentScheduleId: number | null = null;

  /**
   * @param queueSize max size để chờ persist xuống storage
   * @param timePersistent thời gian max để chờ persist, tính theo millis
   */
  constructor(queueSize = 100, timePersistent = 60000) {
    this.maxSize = queueSize;
    this.timePersistent = timePersistent;

    this.start();
  }

  private start() {
    this.eventChannel.start();
  }

  async stop() {
    this.eventChannel.stop();
    await this.persist()
  }

  async add(eventName: string, properties?: Properties) {
    const releaser = await this.mutex.acquire();
    try {
      this.tempEvents.push({
        eventName: eventName,
        properties: properties
      });

      if (this.tempEvents.length > this.maxSize) {
        await this.persist()
      } else {
        this.schedulePersist();
      }

    } finally {
      releaser();
    }
  }

  private async persist() {
    try {
      if (this.tempEvents.length > 0) {
        await this.eventChannel.add({
          priority: 1,
          label: 'persist-event',
          createdAt: Date.now(),
          handler: 'SubmitEventWorker',
          args: { events: this.tempEvents } as Message,
        });
        this.tempEvents = [];
      }
    } catch (ex) {
      // ignore exception
      console.warn('persist error', ex);
    }
  }

  private schedulePersist() {
    // clear old schedule time
    if (this.currentScheduleId) {
      clearTimeout(this.currentScheduleId);
    }

    // add new schedule
    this.currentScheduleId = setTimeout(async () => {
      const releaser = await this.mutex.acquire();
      try {
        await this.persist();
      } finally {
        releaser();
      }
    }, this.timePersistent)
  }
}
