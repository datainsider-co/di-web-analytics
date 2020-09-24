import {Property} from '../domain';
import {DataManager} from './data_manager';
import {trackingService} from './data_insider_tracking.service';
import {TrackProperty} from '../domain/track_property';


export class DiAnalytics {
  private trackingApiKey: string | undefined;
  private defaultProperty: Property | undefined;

  static init(trackingApiKey: string, property: Property | undefined = void 0): DiAnalytics {
    if (trackingApiKey && trackingApiKey.length !== 0) {
      DataManager.setApiKey(trackingApiKey);
      _analytics.trackingApiKey = trackingApiKey;
      if (property && Object.keys(property).length !== 0) {
        DataManager.setDefaultProperty(property);
        _analytics.defaultProperty = property;
      }

      return _analytics;
    } else {
      throw new Error('DiAnalytics::init:: trackingApiKey must not empty string!');
    }
  }

  static register(property: Property): DiAnalytics {
    DataManager.setDefaultProperty(property);
    _analytics.defaultProperty = property;
    return _analytics;
  }

  static track(event: string, property: Property = {}): DiAnalytics {
    _analytics.ensureTrackingApiKeyExists();
    _analytics.track(event, property);

    return _analytics;
  }

  static setUserProfile(userId: string, property: Property = {}): DiAnalytics {
    _analytics.ensureTrackingApiKeyExists();
    _analytics.setUserProfile(userId, property);
    return _analytics;
  }

  static getDiProperty(trackingId: string): TrackProperty {
    return {
      diPlatform: 'web',
      diLibVersion: '0.0.1',
      diTime: Date.now(),
      diDuration: 0,
      diStartTime: 0,
      diTrackingId: trackingId
    };
  }

  private ensureTrackingApiKeyExists(): void {
    const localKey = DataManager.getApiKey();
    if (!this.trackingApiKey && !localKey) {
      throw new Error('DiAnalytics must init before use');
    } else {
      this.trackingApiKey = this.trackingApiKey || DataManager.getApiKey();
    }
  }

  private getDefaultProperty(): Property {
    if (!this.defaultProperty) {
      this.defaultProperty = DataManager.getDefaultProperty();
    }
    return {
      ...this.defaultProperty,
      ...{diUserId: DataManager.getUserId()}
    };
  }

  private getApiKey(): string {
    return this.trackingApiKey!;
  }

  private async loadTrackingId(): Promise<string> {
    let trackId = DataManager.getTrackId();
    if (trackId) {
      trackId = await trackingService.genTrackId(this.getApiKey());
    }
    if (trackId) {
      return trackId;
    } else {
      return Promise.reject(Error('Can\'t generate tracking id'));
    }
  }

  private async setUserProfile(userId: string, property: Property): Promise<void> {
    DataManager.setUserId(userId);

    return _analytics.loadTrackingId().then(trackId => {
      DataManager.setTrackId(trackId);
      const finalProperty: TrackProperty = {
        ...property,
        ...{diUserId: userId},
        ...DiAnalytics.getDiProperty(trackId)
      };
      return trackingService.engage(_analytics.getApiKey(), userId, finalProperty);
    }).then(maybeTrackId => {
      if (maybeTrackId) {
        DataManager.setTrackId(maybeTrackId);
      }
    }).catch(ex => console.error('DiAnalytics::setUserProfile', ex));
  }

  private async track(event: string, property: Property) {
    return _analytics.loadTrackingId().then(trackId => {
      DataManager.setTrackId(trackId);
      const finalProperty: TrackProperty = {
        ...property,
        ..._analytics.getDefaultProperty(),
        ...DiAnalytics.getDiProperty(trackId)
      };

      return trackingService.track(_analytics.getApiKey(), event, finalProperty);
    }).then(maybeTrackId => {
      if (maybeTrackId) {
        DataManager.setTrackId(maybeTrackId);
      }
    }).catch(ex => console.error('DiAnalytics::track', ex));
  }
}

let _analytics = new DiAnalytics();
