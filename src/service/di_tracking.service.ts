import { TrackingService } from './tracking.service';
import { Properties } from '../domain';
import { DITrackingRepository, TrackingRepository } from '../repository';
import { baseClient } from './base_client';

export class DITrackingService extends TrackingService {
  private readonly trackingRepository: TrackingRepository;

  constructor(repository: TrackingRepository) {
    super();
    this.trackingRepository = repository;
  }

  genTrackId(trackingApiKey: string): Promise<string> {
    return this.trackingRepository.genTrackId(trackingApiKey);
  }

  track(trackingApiKey: string, event: string, properties: Properties): Promise<string | undefined> {
    return this.trackingRepository.track(trackingApiKey, event, properties);
  }

  engage(trackingApiKey: string, userId: string, properties: Properties): Promise<string | undefined> {
    return this.trackingRepository.engage(trackingApiKey, userId, properties);
  }
}

export const trackingService: TrackingService = new DITrackingService(new DITrackingRepository(baseClient));

