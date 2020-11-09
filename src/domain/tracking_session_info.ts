import {Properties} from "@/domain/properties";
import {TrackingSessionManager} from "@/misc/tracking_session_manager";

export interface TrackingSessionInfo {
  sessionId: string;
  createdAt: number;
  expiredAt: number;
  lastActivityAt: number;
  isExpired: boolean;

  properties?: Properties;

}
