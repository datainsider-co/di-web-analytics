import {v4 as uuid} from 'uuid';
import LibConfig from '../domain/config';
import {TrackingSessionInfo} from "../domain/tracking_session_info";
import {Properties} from "../domain";

export class TrackingSessionManager {
  static readonly SESSION_KEY = 'di.tracking_session';

  static createSession(properties: Properties): [string, number, number] {
    let sessionId = uuid();
    let createdAt = Date.now();
    let expiredAt = createdAt + LibConfig.sessionMaxInactiveDuration;

    const sessionInfo: TrackingSessionInfo = {
      sessionId: sessionId,
      isExpired: false,
      createdAt: createdAt,
      expiredAt: expiredAt,
      lastActivityAt: Date.now(),
      properties: properties || {}
    };

    localStorage.setItem(TrackingSessionManager.SESSION_KEY, JSON.stringify(sessionInfo));
    sessionStorage.setItem(`current_session_${sessionId}`, "1");
    return [sessionId, createdAt, expiredAt];
  }

  static updateSession(sessionId: string): void {
    const lastActivityAt = Date.now();
    let expiredAt = lastActivityAt + LibConfig.sessionMaxInactiveDuration;

    const dataAsJSON = localStorage.getItem(TrackingSessionManager.SESSION_KEY)
    if (dataAsJSON) {
      let sessionInfo = JSON.parse(dataAsJSON) as TrackingSessionInfo;
      sessionInfo.lastActivityAt = lastActivityAt;
      sessionInfo.expiredAt = expiredAt;
      localStorage.setItem(TrackingSessionManager.SESSION_KEY, JSON.stringify(sessionInfo));
      sessionStorage.setItem(`current_session_${sessionId}`, "1");
    }
  }

  static deleteSession() {
    localStorage.removeItem(TrackingSessionManager.SESSION_KEY);
  }

  static getSession(): TrackingSessionInfo {
    const dataAsJSON = localStorage.getItem(TrackingSessionManager.SESSION_KEY)
    let sessionInfo: TrackingSessionInfo | undefined;
    if (dataAsJSON) {
      sessionInfo = JSON.parse(dataAsJSON) as TrackingSessionInfo;
    }

    return {
      sessionId: sessionInfo?.sessionId,
      isExpired: this.isExpired(sessionInfo),
      createdAt: sessionInfo?.createdAt || 0,
      expiredAt: sessionInfo?.expiredAt || 0,
      lastActivityAt: sessionInfo?.lastActivityAt || 0,
      properties: sessionInfo?.properties || {}
    } as TrackingSessionInfo;
  }

  private static isExpired(sessionInfo: TrackingSessionInfo | undefined): boolean {
    if (sessionInfo) {
      return this.isSessionExpired(sessionInfo?.sessionId, sessionInfo?.expiredAt || 0)
    } else {
      return true;
    }
  }

  private static isSessionExpired(sessionId: string | undefined, expiredAt: number): boolean {
    const notInSessionStorage = !sessionStorage.getItem(`current_session_${sessionId}`);
    if (sessionId && expiredAt) {
      return notInSessionStorage || (Date.now() >= expiredAt)
    } else {
      return notInSessionStorage || !sessionId;
    }
  }

}
