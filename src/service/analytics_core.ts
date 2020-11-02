import {Properties} from '../domain';
import {DataManager} from './data_manager';
import {trackingService} from './di_tracking.service';
import LibConfig from '../domain/config';
import AnalyticsUtils from '../analytics_utils';
import {EventStopWatch} from '../misc/event_stopwatch';
import {PersistentWorker} from './persistent_worker';
import {SystemEvents} from "../domain/system_events";

export class AnalyticsCore {
  private trackingApiKey: string;
  private globalProperties: Properties;

  private lastScreenName?: string;

  private readonly stopWatch: EventStopWatch = new EventStopWatch();
  private readonly worker: PersistentWorker = new PersistentWorker();


  constructor(trackingApiKey: string, properties: Properties) {
    this.trackingApiKey = trackingApiKey;
    let props = {
      ...DataManager.getGlobalPropertes(),
      ...properties
    };
    DataManager.setGlobalProperties(props);
    this.globalProperties = props;
    this.getTrackingId().then(() => {
      this.touchSession();
    });

    this.bindEvents();

  }

  private bindEvents() {
    document.addEventListener('readystatechange', event => {
      if (document.readyState === 'complete') {
        this.worker.start();

        window.addEventListener('unload', (event) => {
          this.touchSession();
          this.worker.stop();
        });
      }
    });
  }

  reset() {
    this.lastScreenName = '';
    this.stopWatch.clear();
    DataManager.reset();
  }

  async getTrackingId(): Promise<string> {
    const generateTrackingId = async (): Promise<string> => {
      return trackingService.genTrackId(this.trackingApiKey).then(trackingId => {
        if (!trackingId) {
          throw Error("Can't generate tracking id");
        }
        DataManager.setTrackingId(trackingId);
        return trackingId;
      });
    }

    let trackId = DataManager.getTrackingId();
    if (!trackId) {
      trackId = await generateTrackingId();
    }
    return trackId;
  }

  async register(properties: Properties) {
    let props = {
      ...this.globalProperties,
      ...properties
    };
    DataManager.setGlobalProperties(props);
    this.globalProperties = props;
  }

  async enterScreenStart(name: string) {
    this.time(SystemEvents.SCREEN_ENTER);
    this.lastScreenName = name || '';
  }

  async enterScreen(name: string, properties: Properties = {}) {
    this.time(`di_pageview_${name}`);
    properties["di_screen_name"] = name;
    this.lastScreenName = name || '';
    return this.track(SystemEvents.SCREEN_ENTER, properties);
  }

  async exitScreen(name: string, properties: Properties = {}) {
    let [startTime, duration] = this.stopWatch.stopAndPop(`di_pageview_${name}`);

    properties["di_screen_name"] = name;
    properties["di_start_time"] = startTime || 0;
    properties["di_duration"] = duration || 0;
    this.lastScreenName = '';
    return this.track(SystemEvents.PAGE_VIEW, properties);
  }

  trackSessionCreated(sessionId: string, createdAt: number) {
    let properties = {} as Properties;
    properties['di_session_id'] = sessionId;
    properties['di_time'] = createdAt;
    return this.track(SystemEvents.SESSION_CREATED, properties);
  }

  trackSessionEnd(sessionId: string, createdAt: number) {
    let properties = {} as Properties;
    properties['di_session_id'] = sessionId;
    properties['di_start_time'] = createdAt;
    properties['di_duration'] = (Date.now() - createdAt);
    return this.track(SystemEvents.SESSION_END, properties);
  }

  time(event: string) {
    this.stopWatch.add(event);
  }

  track(event: string, properties: Properties) {
    const eventProperties = this.buildTrackingProperties(event, properties);
    this.worker.enqueueEvent(this.trackingApiKey, event, eventProperties);
  }

  //TODO: Send an event to server to resolve and old event with this user id
  identify(userId: string) {
    const oldUserId = DataManager.getUserId();
    if (oldUserId && oldUserId.length !== 0 && oldUserId !== userId) {
      DataManager.reset();
    }
    DataManager.setUserId(userId);
  }

  setUserProfile(userId: string, properties: Properties): void {
    DataManager.setUserId(userId);
    this.worker.enqueueEngage(this.trackingApiKey, userId, properties);
  }


  touchSession(): void {
    const [sessionId, isExpired, createdAt, expiredAt] = DataManager.getSession();
    if (isExpired) {
      if (!sessionId) {
        this.trackSessionEnd(sessionId, createdAt);
      }
      this.createSession();
    } else {
      DataManager.updateSession(sessionId);
    }
  }

  private createSession() {
    const [sessionId, createdAt, _] = DataManager.createSession();
    this.trackSessionCreated(sessionId, createdAt);
  }


  private buildTrackingProperties(event: string, properties: Properties): Properties {
    const trackingId = DataManager.getTrackingId();
    let [sessionId, _] = DataManager.getSession();
    this.enrichScreenName(properties);
    this.enrichDuration(event, properties);
    return {
      ...this.globalProperties,
      ...properties,
      ...AnalyticsUtils.buildClientSpecifications(),
      ...AnalyticsUtils.buildPageAndReferrerInfo(properties['di_url'], properties['di_referrer']),
      'di_user_id': DataManager.getUserId() || '',
      'di_lib_platform': LibConfig.platform,
      'di_lib_version': LibConfig.version,
      'di_session_id': sessionId || properties['di_session_id'] || '',
      'di_tracking_id': trackingId || properties['di_tracking_id'] || '',
      'di_time': properties['di_time'] || Date.now(),
    };
  }

  private enrichScreenName(properties: Properties) {
    if (!properties['di_screen_name']) {
      properties['di_screen_name'] = this.lastScreenName || window.document.location.pathname;
    }
  }


  private enrichDuration(event: string, properties: Properties) {
    let [startTime, duration] = this.stopWatch.stopAndPop(event);
    if (!properties['di_start_time']) {
      properties['di_start_time'] = startTime || 0;
    }
    if (!properties['di_duration']) {
      properties['di_duration'] = duration || 0;
    }

  }


}
