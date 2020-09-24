import {Property} from './property';

export interface TrackProperty extends Property {
  diPlatform: 'web' | 'mobile' | 'desktop',
  diLibVersion: string,
  diTrackingId: string,
  diUserId: string,
  diStartTime: number,
  diDuration: number,
  diTime: number
}
