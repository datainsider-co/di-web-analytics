import { Properties } from '../domain';

export class EventStopWatch {
  private stopWatch: Properties = {};

  add(id: string): EventStopWatch {
    this.stopWatch[id] = Date.now()
    return this;
  }

  stopAndPop(id: string): [number, number] {
    let start = this.stopWatch[id] || Date.now();
    let elapsed = Date.now() - start;
    delete this.stopWatch[id];

    return [start, elapsed > 0 ? elapsed : 0];
  }

  clear() {
    this.stopWatch = {};
  }


}


