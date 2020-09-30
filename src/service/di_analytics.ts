import { Properties } from '../domain';
import { DataManager } from './data_manager';
import { trackingService } from './di_tracking.service';
import LibConfig from '../domain/config';

const DI_TRACKING_ID = 'di_tracking_id';
const DI_USER_ID = 'di_user_id';
const DI_PLATFORM = 'di_platform';
const DI_LIBRARY_VERSION = 'di_lib_version';
const DI_START_TIME = 'di_start_time';
const DI_DURATION = 'di_duration';
const DI_TIME = 'di_time';


export default class DiAnalytics {
  private static instance: DiAnalyticsLib;

  //TODO: Clear additional data & queue... etc
  static init(trackingApiKey: string, properties?: Properties) {

    this.instance = this.createDiAnalytics(trackingApiKey, properties)
  }

  private static createDiAnalytics(trackingApiKey: string, properties?: Properties): DiAnalyticsLib {
    let props: Properties;
    if (properties && Object.keys(properties).length !== 0) {
      props = properties;
    } else {
      props = {};
    }
    if (trackingApiKey && trackingApiKey.length !== 0) {
      return new DiAnalyticsLib(trackingApiKey, props);
    } else {
      throw new Error('DiAnalyticsLib::init:: trackingApiKey must not empty string!');
    }
  }


  static register(properties: Properties): DiAnalytics {
    this.instance.register(properties)
    return this;
  }

  static track(event: string, properties: Properties = {}): DiAnalytics {
    this.instance.track(event, properties);
    return this;
  }

  static setUserProfile(userId: string, properties: Properties = {}): DiAnalytics {
    this.instance.setUserProfile(userId, properties);
    return this;
  }

}

class DiAnalyticsLib {


  private trackingApiKey: string;
  private globalProperties: Properties;

  constructor(trackingApiKey: string, properties: Properties) {
    this.trackingApiKey = trackingApiKey;

    let props = {
      ...DataManager.getGlobalPropertes(),
      ...properties
    };
    DataManager.setGlobalProperties(props)
    this.globalProperties = props;
  }

  private async getTrackingId(): Promise<string> {
    const generateTrackingId = async (): Promise<string> => {
      return trackingService.genTrackId(this.trackingApiKey).then(trackingId => {
        if (!trackingId) {
          throw Error("Can't generate tracking id");
        }
        DataManager.setTrackId(trackingId);
        return trackingId;
      });
    }

    let trackId = DataManager.getTrackId();
    if (!trackId) {
      trackId = await generateTrackingId();
    }
    return trackId;
  }


  enrichWithGlobalProperties(properties: Properties): Properties {
    return {
      ...this.globalProperties,
      ...properties,
    };
  }

  enrichWithSystemProperties(trackingId: string, userId: string | undefined, properties: Properties): Properties {
    return {
      ...properties,
      DI_PLATFORM: LibConfig.platform,
      DI_LIBRARY_VERSION: LibConfig.version,
      DI_TRACKING_ID: trackingId,
      DI_USER_ID: userId || '',
      DI_START_TIME: 0,
      DI_DURATION: 0,
      DI_TIME: Date.now(),
    };
  }

  register(properties: Properties) {
    let props = {
      ...this.globalProperties,
      ...properties
    };
    DataManager.setGlobalProperties(props);
    this.globalProperties = props;
  }


  async track(event: string, properties: Properties) {
    let userId = DataManager.getUserId();
    return this.getTrackingId().then(trackingId => {
      let eventProperties = this.enrichWithGlobalProperties(properties)
      eventProperties = this.enrichWithSystemProperties(trackingId, userId, eventProperties)
      return trackingService.track(this.trackingApiKey, event, eventProperties);
    }).then(maybeTrackingId => {
      if (maybeTrackingId) {
        DataManager.setTrackId(maybeTrackingId);
      }
    }).catch(ex => console.error('DiAnalytics::track', ex));
  }

  async setUserProfile(userId: string, properties: Properties): Promise<void> {
    DataManager.setUserId(userId);
    return this.getTrackingId().then(trackingId => {
      let props = {
        ...properties,
        DI_TRACKING_ID: trackingId
      };
      return trackingService.engage(this.trackingApiKey, userId, props);
    }).then(maybeTrackId => {
      if (maybeTrackId) {
        DataManager.setTrackId(maybeTrackId);
      }
    }).catch(ex => console.error('DiAnalytics::setUserProfile', ex));
  }
}

