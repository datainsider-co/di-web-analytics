import Queue from 'storage-based-queue';
import {Message, SubmitEventWorker} from './workers';
import {Event, Properties} from '../domain';
import {Logger} from '../service/logger';
import {DataManager} from './data_manager';

Queue.workers({SubmitEventWorker});

export enum StorageType {
  LocalStorage = 'localStorage',
  IndexedDB = 'indexeddb',
  InMemory = 'inmemory',
}

export abstract class PersistentQueue {
  abstract start(): void;

  abstract stop(): void;

  abstract add(event: string, properties: Properties): void
}

export class PersistentQueueImpl extends PersistentQueue {
  private readonly bufferSize: number;
  private readonly flushInterval: number;
  private readonly eventChannel: any;
  private bufferEvents: Event[] = [];
  private currentScheduleId: number | null = null;

  /**
   * @param storageType is the storage type to use for the queue
   * @param bufferSize max size để chờ persist xuống storage
   * @param flushIntervalMs thời gian max để chờ persist, tính theo millis
   */
  constructor(storageType = StorageType.LocalStorage, bufferSize = 50, flushIntervalMs = 5000) {
    super();
    Logger.debug('init PersistentQueue', {queueSize: bufferSize, flushInterval: flushIntervalMs});
    this.bufferSize = bufferSize;
    this.flushInterval = flushIntervalMs;
    this.eventChannel = new Queue({
      storage: storageType,
      timeout: 100,
      debug: false
    }).create('event-track-channel');
  }

  start() {
    Logger.debug('PersistentQueue::start');
    this.eventChannel.start();
    this.loadTempEvents();
    Logger.debug('PersistentQueue::start completed');
  }

  private loadTempEvents(): void {
    try {
      const events: Event[] = DataManager.getTemporaryEvents();
      if (events.length > 0) {
        this.persist(events);
        DataManager.deleteTemporaryEvents();
      }
    } catch (ex) {
      Logger.error('loadTempEvents error', ex);
    }

  }

  stop() {
    try {
      DataManager.saveTemporaryEvents(this.bufferEvents);
      this.eventChannel.stop();
    } catch (ex) {
      Logger.error('PersistentQueue::stop error', ex);
    }
  }

  add(event: string, properties: Properties): void {
    this.bufferEvents.push({
      name: event,
      properties: properties
    });

    if (this.bufferEvents.length > this.bufferSize) {
      const events = Array.from(this.bufferEvents);
      this.bufferEvents = [];
      this.persist(events);
    } else {
      this.schedulePersist();
    }
  }

  private persist(events: Event[]): void {
    try {
      if (events.length > 0) {
        this.eventChannel.add({
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
      try {
        // quick swap events
        const events = Array.from(this.bufferEvents);
        this.bufferEvents = [];
        this.persist(events);
      } catch (ex) {
        Logger.error('schedulePersist error', ex);
      }
    }, this.flushInterval);
  }
}
