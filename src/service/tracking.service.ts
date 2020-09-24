import {Property} from '../domain';
import {TrackProperty} from '../domain/track_property';

export abstract class TrackingService {
  abstract genTrackId(trackingApiKey: string): Promise<string | undefined>;

  abstract track(trackingApiKey: string, event: string, properties: TrackProperty): Promise<string | undefined>;

  abstract engage(trackingApiKey: string, userId: string, properties: TrackProperty): Promise<string | undefined>;
}
