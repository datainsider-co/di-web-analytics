import {CustomerProperties, EventProperties, Properties} from '../domain';
import {AnalyticsCore} from './analytics_core';

export class DisableAnalyticsCore extends AnalyticsCore {

  constructor() {
    super();
  }

  enterScreen(name: string, userProps?: EventProperties): void {
  }

  enterScreenStart(name: string): void {
  }

  exitScreen(name: string, userProps?: EventProperties): void {
  }

  getTrackingId(): string {
    return '';
  }

  identify(userId: string): void {
  }

  setGlobalConfig(properties: Properties): void {
  }

  time(event: string): void {
  }

  touchSession(): void {

  }

  track(event: string, properties: Properties): void {
  }

  setUserProfile(userId: string, properties: CustomerProperties): void {
  }

  destroySession(): void {
  }
}
