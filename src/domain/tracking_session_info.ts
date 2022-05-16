import {Properties} from '../domain/properties';

export interface TrackingSessionInfo {
  sessionId: string;
  createdAt: number;
  expiredAt: number;
  lastActivityAt: number;
  isExpired: boolean;

  properties?: Properties;

}
