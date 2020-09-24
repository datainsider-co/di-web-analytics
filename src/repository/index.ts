import {TrackingRepository} from './tracking.repository';
import {baseClient} from '../service';
import {DataInsiderTrackingRepository} from './data_insider_tracking.repository';

export * from './tracking.repository';

export const dataInsiderTrackingRepository: TrackingRepository = new DataInsiderTrackingRepository(baseClient);
