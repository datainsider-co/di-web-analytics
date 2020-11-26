import {Properties} from '../domain';

export class ElapseDuration {
  constructor(public readonly  startTime: number, public readonly  duration: number) {
  }
}

export abstract class Stopwatch {
  abstract start(id: string): void;

  abstract stop(id: string): ElapseDuration;

  abstract clear(): void;
}

export class InMemStopwatch extends Stopwatch {
  private stopWatch: Properties = {};

  start(id: string): void {
    this.stopWatch[id] = Date.now();
  }

  stop(id: string): ElapseDuration {
    let start = this.stopWatch[id] || 0;
    let elapsed = start > 0 ? (Date.now() - start) : 0;
    this.stopWatch[id] = 0;
    delete this.stopWatch[id];
    return new ElapseDuration(start, elapsed > 0 ? elapsed : 0);
  }

  clear() {
    this.stopWatch = {};
  }
}

export class SessionStopwatch extends Stopwatch {

  start(id: string): void {
    sessionStorage.setItem(this.buildKey(id), Date.now().toString());
  }

  stop(id: string): ElapseDuration {
    const key = this.buildKey(id);

    let start = parseInt((sessionStorage.getItem(key) || '0'));
    let elapsed = start > 0 ? (Date.now() - start) : 0;
    sessionStorage.removeItem(key);
    return new ElapseDuration(start, elapsed > 0 ? elapsed : 0);
  }

  clear(): void {
    this.getStopwatchIds().forEach(key => sessionStorage.removeItem(key));
  }

  private buildKey(id: string): string {
    return `di.tracking.stopwatch.${id}`;
  }

  private getStopwatchIds(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('di.tracking.stopwatch.')) {
        keys.push(key);
      }
    }
    return keys;
  }
}


export class StopwatchFactory {
  static createStopwatch() {
    return new SessionStopwatch();
  }
}

