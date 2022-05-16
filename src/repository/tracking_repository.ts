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
    return this.multiTrack([{eventName: event, properties: properties}]);
  }

  private static getResult(data: string): TrackingResponse {
    const response = JSON.parse(data);
    return new TrackingResponse(response.success);
  }

  private static toJson(events: Event[]): string {
    const obj = events.map(event => {
      return {
        event_name: event.eventName,
        properties: event.properties
      };
    });
    return JSON.stringify(obj);
  }
}
