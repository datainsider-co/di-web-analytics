import {CustomerProperties, EventProperties, Properties} from '../domain';
import {AnalyticsCore} from './analytics_core';

export class DisableAnalyticsCore extends AnalyticsCore {

  constructor() {
    super();
  }

  async enterScreen(name: string, userProps?: EventProperties): Promise<void> {
  }

  enterScreenStart(name: string): void {
  }

  async exitScreen(name: string, userProps?: EventProperties): Promise<void> {
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

  async touchSession(): Promise<any> {
    return Promise.resolve(undefined);
  }

  track(event: string, properties: Properties): Promise<void> {
    return Promise.resolve(undefined);
  }

  setUserProfile(userId: string, properties: CustomerProperties): Promise<any> {
    return Promise.resolve(undefined);
  }

  destroySession(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
