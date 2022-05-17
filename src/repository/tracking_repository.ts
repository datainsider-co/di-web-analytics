import {Properties, Event} from '../domain';
import BaseClient from '../misc/base_client';

class TrackingResponse {
  success: boolean;

  constructor(success: boolean) {
    this.success = success;
  }
}

export abstract class TrackingRepository {
  abstract track(event: string, properties: Properties): Promise<boolean>;

  abstract multiTrack(events: Event[]): Promise<boolean>;
}


export class TrackingRepositoryImpl extends TrackingRepository {
  private readonly client: BaseClient;

  constructor(client: BaseClient) {
    super();
    this.client = client;
  }

  multiTrack(events: Event[]): Promise<boolean> {
    return this.client.post('/api/tracking/warehouse/track', {
      events: TrackingRepositoryImpl.toJson(events)
    }).then(response => TrackingRepositoryImpl.getResult(response).success);
  }

  track(event: string, properties: Properties): Promise<boolean> {
    return this.multiTrack([{name: event, properties: properties}]);
  }

  private static getResult(data: any): TrackingResponse {
    return new TrackingResponse(data.success);
  }

  private static toJson(events: Event[]): any[] {
    return events.map(event => {
      return {
        name: event.name,
        properties: event.properties
      };
    });
  }
}
