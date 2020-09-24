import {TrackingService} from './tracking.service';
import {DataInsiderTrackingService} from './data_insider_tracking.service';

export * from './tracking.service';
export * from './cookie_manager';
export * from './base_client';

export const trackingService: TrackingService = new DataInsiderTrackingService();
