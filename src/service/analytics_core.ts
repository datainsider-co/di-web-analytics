import {CustomerProperties, EventProperties, Properties} from '../domain';


export abstract class AnalyticsCore {

  abstract getTrackingId(): string

  abstract setGlobalConfig(properties: Properties): void

  abstract enterScreenStart(name: string): void

  abstract enterScreen(name: string, userProps?: EventProperties): Promise<void>

  abstract exitScreen(name: string, userProps?: EventProperties): Promise<void>

  abstract touchSession(): Promise<void>

  abstract time(event: string): void

  abstract identify(customerId: string): void

  abstract setUserProfile(customerId: string, properties: CustomerProperties): Promise<void>

  abstract track(event: string, properties: Properties | EventProperties): Promise<void>

  /**
   * end current session
   */
  abstract destroySession(): Promise<void>;
}
