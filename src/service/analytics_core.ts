import { Properties } from '../domain';
import { DataManager } from './data_manager';
import { trackingService } from './di_tracking.service';
import LibConfig from '../domain/config';
import AnalyticsUtils from '../analytics_utils';
import { EventStopWatch } from './event_stopwatch';
import { PersistentWorker } from './persistent_worker';

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
                    let [sessionId, createdAt, _] = DataManager.getSession();
                    DataManager.deleteSession();
                    if (sessionId && createdAt) {
                        this.worker.stop();
                        this.trackSessionEnd(sessionId, createdAt);
                    }
                })
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
        this.time('di_screen_enter');
        this.lastScreenName = name || '';
    }

    async enterScreen(name: string, properties: Properties = {}) {
        this.time(`di_pageview_${name}`);
        properties["di_screen_name"] = name;
        this.lastScreenName = name || '';
        return this.track("di_screen_enter", properties);
    }

    async exitScreen(name: string, properties: Properties = {}) {
        let [startTime, duration] = this.stopWatch.stopAndPop(`di_pageview_${name}`);

        properties["di_screen_name"] = name;
        properties["di_start_time"] = startTime || 0;
        properties["di_duration"] = duration || 0;
        this.lastScreenName = '';
        return this.track("di_pageview", properties);
    }

    trackSessionCreated(sessionId: string, createdAt: number) {
        let properties = {} as Properties;
        properties['di_session_id'] = sessionId;
        properties['di_time'] = createdAt;
        return this.track('di_session_created', properties);
    }

    trackSessionEnd(sessionId: string, createdAt: number) {
        let properties = {} as Properties;
        properties['di_session_id'] = sessionId;
        properties['di_start_time'] = createdAt;
        properties['di_duration'] = (Date.now() - createdAt);
        return this.track('di_session_end', properties);
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
        let [sessionId, createdAt, expiredAt] = DataManager.getSession();
        if (!sessionId) {
            this.createSession();
        } else if (Date.now() >= expiredAt) {
            this.trackSessionEnd(sessionId, createdAt);
            this.createSession();
        } else {
            DataManager.updateSession(sessionId);
        }
    }

    private createSession() {
        let [sessionId, createdAt, _] = DataManager.createSession();
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
            ...AnalyticsUtils.buildPageAndReferrerInfo(),
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
