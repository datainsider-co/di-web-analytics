import {TrackingRepository} from './tracking.repository';
import {Property} from '../domain';
import {baseClient, BaseClient} from '../service';

export class DataInsiderTrackingRepository extends TrackingRepository {

  constructor(private readonly client: BaseClient) {
    super();
  }

  engage(trackingApiKey: string, userId: string, properties: Property): Promise<string | undefined> {
    return this.client.post('/api/analytics/engage', {
      trackingApiKey: trackingApiKey,
      userId: userId,
      properties: properties
    });
  }

  genTrackId(trackingApiKey: string): Promise<string | undefined> {
    return this.client.post('/api/analytics/gen_track_id', {trackingApiKey: trackingApiKey});
  }

  track(trackingApiKey: string, event: string, properties: Property): Promise<string | undefined> {
    return this.client.post('/api/analytics/track', {
      trackingApiKey: trackingApiKey,
      event: event,
      properties: properties
    });
  }
}

export const dataInsiderTrackingRepository: TrackingRepository = new DataInsiderTrackingRepository(baseClient);
