import {v4 as uuid} from 'uuid';
import LibConfig from '../domain/config';
import {TrackingSessionInfo} from "../domain/tracking_session_info";
import {Properties} from "../domain";


export class TrackingSessionManager {
  static readonly SESSION_KEY = 'di.tracking_session';

  static buildSessionStorageKey(sessionId: string): string {
    return `current_session_${sessionId}`;
  }

  static createSession(properties: Properties): [string, number, number] {
    const sessionId = uuid();
    const createdAt = Date.now();
    const expiredAt = createdAt + LibConfig.sessionMaxInactiveDuration;

    const sessionInfo: TrackingSessionInfo = {
      sessionId: sessionId,
      isExpired: false,
      createdAt: createdAt,
      expiredAt: expiredAt,
      lastActivityAt: Date.now(),
      properties: properties || {}
    };

    localStorage.setItem(TrackingSessionManager.SESSION_KEY, JSON.stringify(sessionInfo));
    sessionStorage.setItem(this.buildSessionStorageKey(sessionId), "1");
    return [sessionId, createdAt, expiredAt];
  }

  static updateSession(sessionId: string): void {
    const lastActivityAt = Date.now();

    const dataAsJSON = localStorage.getItem(TrackingSessionManager.SESSION_KEY)
    if (dataAsJSON) {
      let sessionInfo = JSON.parse(dataAsJSON) as TrackingSessionInfo;
      sessionInfo.lastActivityAt = lastActivityAt;
      sessionInfo.expiredAt = lastActivityAt + LibConfig.sessionMaxInactiveDuration;
      localStorage.setItem(TrackingSessionManager.SESSION_KEY, JSON.stringify(sessionInfo));
      sessionStorage.setItem(this.buildSessionStorageKey(sessionId), "1");
    }
  }

  static deleteSession() {
    const session: TrackingSessionInfo | undefined = this.getSession();
    if (session && session?.sessionId) {
      sessionStorage.removeItem(this.buildSessionStorageKey(session.sessionId));
    }
    localStorage.removeItem(TrackingSessionManager.SESSION_KEY);
  }

  static getSession(): TrackingSessionInfo | undefined {
    try {
      const dataAsJSON = localStorage.getItem(TrackingSessionManager.SESSION_KEY)
      if (dataAsJSON) {
        const trackingInfo =  JSON.parse(dataAsJSON) as TrackingSessionInfo;
        return {
          sessionId: trackingInfo.sessionId,
          isExpired: this.isExpired(trackingInfo),
          createdAt: trackingInfo.createdAt || 0,
          expiredAt: trackingInfo.expiredAt || 0,
          lastActivityAt: trackingInfo.lastActivityAt || 0,
          properties: trackingInfo.properties || {}
        }
      } else {
        return void 0;
      }
    } catch (ex) {
      return void 0;
    }
  }

  private static isExpired(sessionInfo: TrackingSessionInfo | undefined): boolean {
    if (sessionInfo) {
      return this.isSessionExpired(sessionInfo?.sessionId, sessionInfo?.expiredAt || 0)
    } else {
      return true;
    }
  }

  private static isSessionExpired(sessionId: string | undefined, expiredAt: number): boolean {
    const notInSessionStorage = !sessionStorage.getItem(this.buildSessionStorageKey(sessionId ?? ''));
    if (sessionId && expiredAt) {
      return notInSessionStorage || (Date.now() >= expiredAt)
    } else {
      return notInSessionStorage || !sessionId;
    }
  }

}
