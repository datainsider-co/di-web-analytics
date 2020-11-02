import { Properties } from '../domain';

export class EventStopWatch {
  private stopWatch: Properties = {};

  add(id: string): EventStopWatch {
    this.stopWatch[id] = Date.now()
    return this;
  }

  stopAndPop(id: string): [number, number] {
    let start = this.stopWatch[id] || 0;
    let elapsed = start > 0 ? (Date.now() - start) : 0;
    this.stopWatch[id] = 0;
    delete this.stopWatch[id];

    return [start, elapsed > 0 ? elapsed : 0];
  }

  clear() {
    this.stopWatch = {};
  }


}


