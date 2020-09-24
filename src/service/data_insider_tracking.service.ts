import {TrackingService} from './tracking.service';
import {Property} from '../domain';

export class DataInsiderTrackingService extends TrackingService {
  engage(trackingApiKey: string, userId: string, properties: Property): Promise<string | undefined> {
    return Promise.resolve(undefined);
  }

  genTrackId(trackingApiKey: string): Promise<string | undefined> {
    return Promise.resolve(undefined);
  }

  track(trackingApiKey: string, event: string, properties: Property): Promise<string | undefined> {
    return Promise.resolve(undefined);
  }
}

