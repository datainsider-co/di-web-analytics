
import {DITrackingRepository, TrackingRepository} from '../repository';
import {baseClient} from '../misc/base_client';
import {Properties} from '../domain';

export abstract class TrackingService {
  abstract genTrackId(url: string, trackingApiKey: string): Promise<string>;

  abstract track(url: string, trackingApiKey: string, event: string, properties: Properties): Promise<string | undefined>;

  abstract engage(url: string, trackingApiKey: string, userId: string, properties: Properties): Promise<string | undefined>;
}


export class DITrackingService extends TrackingService {
  private readonly trackingRepository: TrackingRepository;

  constructor(repository: TrackingRepository) {
    super();
    this.trackingRepository = repository;
  }

  genTrackId(url: string, trackingApiKey: string): Promise<string> {
    return this.trackingRepository.genTrackId(url, trackingApiKey);
  }

  track(url: string, trackingApiKey: string, event: string, properties: Properties): Promise<string | undefined> {
    return this.trackingRepository.track(url, trackingApiKey, event, properties);
  }

  engage(url: string, trackingApiKey: string, userId: string, properties: Properties): Promise<string | undefined> {
    return this.trackingRepository.engage(url, trackingApiKey, userId, properties);
  }
}

export const trackingService: TrackingService = new DITrackingService(new DITrackingRepository(baseClient));

