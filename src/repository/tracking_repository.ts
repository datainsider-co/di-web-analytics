
import { Properties } from '../domain';
import { BaseClient } from '../service';


export abstract class TrackingRepository {
  abstract genTrackId(trackingApiKey: string): Promise<string>;

  abstract track(trackingApiKey: string, event: string, properties: Properties): Promise<string | undefined>;

  abstract engage(trackingApiKey: string, userId: string, properties: Properties): Promise<string | undefined>;
}


export class DITrackingRepository extends TrackingRepository {

  constructor(private readonly client: BaseClient) {
    super();
  }

  engage(trackingApiKey: string, userId: string, properties: Properties): Promise<string | undefined> {
    return this.client.post('/api/analytics/engage', {
      trackingApiKey: trackingApiKey,
      userId: userId,
      properties: properties
    }, {
      params: { 'tracking_api_key': trackingApiKey }
    });
  }

  genTrackId(trackingApiKey: string): Promise<string> {
    return this.client.post('/api/analytics/gen_track_id', { trackingApiKey: trackingApiKey });
  }

  track(trackingApiKey: string, event: string, properties: Properties): Promise<string | undefined> {
    return this.client.post('/api/analytics/track', {
      trackingApiKey: trackingApiKey,
      event: event,
      properties: properties
    }, {
      params: { 'tracking_api_key': trackingApiKey }
    });
  }
}
