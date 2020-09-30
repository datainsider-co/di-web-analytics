import {Properties} from '../domain';

export abstract class TrackingRepository {
  abstract genTrackId(trackingApiKey: string): Promise<string>;

  abstract track(trackingApiKey: string, event: string, properties: Properties): Promise<string | undefined>;

  abstract engage(trackingApiKey: string, userId: string, properties: Properties): Promise<string | undefined>;
}