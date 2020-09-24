import {Property} from '../domain';

export abstract class TrackingService {
  abstract genTrackId(trackingApiKey: string): Promise<string | undefined>;

  abstract track(trackingApiKey: string, event: string, properties: Property): Promise<string | undefined>;

  abstract engage(trackingApiKey: string, userId: string, properties: Property): Promise<string | undefined>;
}
