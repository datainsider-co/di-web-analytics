import {TrackingRepository, TrackingRepositoryImpl} from '../repository';
import {Event, Properties} from '../domain';
import {BASE_CLIENT} from '../misc/base_client';

export abstract class TrackingService {
  abstract track(event: string, properties: Properties): Promise<boolean>;

  abstract multiTrack(events: Event[]): Promise<boolean>;
}


export class TrackingServiceImpl extends TrackingService {
  private readonly trackingRepository: TrackingRepository;

  constructor(trackingRepository: TrackingRepository) {
    super();
    this.trackingRepository = trackingRepository;
  }

  multiTrack(events: Event[]): Promise<boolean> {
    return this.trackingRepository.multiTrack(events);
  }

  track(event: string, properties: Properties): Promise<boolean> {
    return this.trackingRepository.track(event, properties);
  }
}

const TRACKING_SERVICE: TrackingService = new TrackingServiceImpl(new TrackingRepositoryImpl(BASE_CLIENT));

export default TRACKING_SERVICE;
