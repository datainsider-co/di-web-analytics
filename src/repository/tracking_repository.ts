
import { Properties } from '../domain';
import { BaseClient } from '../service';


export abstract class TrackingRepository {
  abstract genTrackId(url: string, trackingApiKey: string): Promise<string>;

  abstract track(url: string, trackingApiKey: string, event: string, properties: Properties): Promise<string | undefined>;

  abstract engage(url: string, trackingApiKey: string, userId: string, properties: Properties): Promise<string | undefined>;
}


export class DITrackingRepository extends TrackingRepository {

  constructor(private readonly client: BaseClient) {
    super();
  }

  engage(url: string, trackingApiKey: string, userId: string, properties: Properties): Promise<string | undefined> {
    return this.client.post(`${url}/api/tracking/engage`, {
      trackingApiKey: trackingApiKey,
      userId: userId,
      properties: properties
    }, {
      params: { 'tracking_api_key': trackingApiKey }
    });
  }

  genTrackId(url: string, trackingApiKey: string): Promise<string> {
    return this.client.post(`${url}/api/tracking/gen_track_id`, { trackingApiKey: trackingApiKey });
  }

  track(url: string, trackingApiKey: string, event: string, properties: Properties): Promise<string | undefined> {
    return this.client.post(`${url}/api/tracking/track`, {
      trackingApiKey: trackingApiKey,
      event: event,
      properties: properties
    }, {
      params: { 'tracking_api_key': trackingApiKey }
    });
  }
}
