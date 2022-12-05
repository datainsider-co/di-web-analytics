import Queue from 'storage-based-queue';
import {Message, SubmitEventWorker} from './workers';
import {Mutex} from 'async-mutex';
import {Event, Properties} from '../domain';
import {Logger} from '../service/logger';

Queue.workers({SubmitEventWorker});

export class PersistentQueue {
  private readonly queue = new Queue({
    storage: 'indexeddb'
  });

  private readonly maxSize: number;
  private readonly flushInterval: number;
  private readonly eventChannel = this.queue.create('event-track-channel');
  private readonly mutex = new Mutex();
  private events: Event[] = [];
  private currentScheduleId: number | null = null;

  /**
   * @param queueSize max size để chờ persist xuống storage
   * @param flushInterval thời gian max để chờ persist, tính theo millis
   */
  constructor(queueSize = 100, flushInterval = 60000) {
    Logger.info("init PersistentQueue", {queueSize, flushInterval});
    this.maxSize = queueSize;
    this.flushInterval = flushInterval;

    this.start();
  }

  private start() {
    Logger.debug('PersistentQueue::start');
    this.eventChannel.start();
    Logger.debug('PersistentQueue::start completed');
  }

  async stop() {
    const releaser = await this.mutex.acquire();

    try {
      const events = Array.from(this.events);
      this.events = [];
      await this.persist(events);
      this.eventChannel.stop();
    } catch (ex){
      Logger.error('PersistentQueue::stop error', ex);
    } finally {
      releaser();
    }
  }

  async add(event: string, properties: Properties): Promise<void> {
    const releaser = await this.mutex.acquire();
    try {
      this.events.push({
        name: event,
        properties: properties
      });

      if (this.events.length > this.maxSize) {
        const events = Array.from(this.events);
        this.events = [];
        this.persist(events);
      } else {
        this.schedulePersist();
      }

    } finally {
      releaser();
    }
  }

  private async persist(events: Event[]): Promise<void> {
    try {
      if (events.length > 0) {
        await this.eventChannel.add({
          priority: 1,
          label: 'persist-event',
          createdAt: Date.now(),
          handler: 'SubmitEventWorker',
          args: {events: events} as Message
        });
      }
    } catch (ex) {
      // ignore exception
      Logger.warn('persist error', ex);
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
        // quick swap events
        const events = Array.from(this.events);
        this.events = [];
        this.persist(events);
      } finally {
        releaser();
      }
    }, this.flushInterval);
  }
}
