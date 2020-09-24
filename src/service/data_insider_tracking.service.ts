import {TrackingService} from './tracking.service';
import {Property} from '../domain';
import {TrackingRepository} from '../repository';

export class DataInsiderTrackingService extends TrackingService {
  constructor(private readonly trackingRepository: TrackingRepository) {
    super();
  }

  engage(trackingApiKey: string, userId: string, properties: Property): Promise<string | undefined> {
    return this.trackingRepository.engage(trackingApiKey, userId, properties);
  }

  genTrackId(trackingApiKey: string): Promise<string | undefined> {
    return this.trackingRepository.genTrackId(trackingApiKey);
  }

  track(trackingApiKey: string, event: string, properties: Property): Promise<string | undefined> {
    return this.trackingRepository.track(trackingApiKey, event, properties);
  }
}

