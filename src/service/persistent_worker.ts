
import { Properties } from "../domain";
import Queue from "storage-based-queue";
import { trackingService } from './di_tracking.service';
import { DataManager } from './data_manager';

export class PersistentWorker {
    private readonly queue = new Queue({
        storage: 'localstorage'
    });
    private readonly eventChannel = this.queue.create('event-channel');
    private readonly engageChannel = this.queue.create('engage-channel');

    start() {
        this.eventChannel.start();
        this.engageChannel.start();
    }

    stop() {
        this.eventChannel.stop();
        this.engageChannel.stop();
    }

    enqueueEvent(trackingApiKey: string, event: string, properties: Properties) {
        this.eventChannel.add({
            label: 'SubmitEventWorker',
            handler: 'SubmitEventWorker',
            args: { trackingApiKey: trackingApiKey, event: event, properties: properties },
        });
    }

    enqueueEngage(trackingApiKey: string, userId: string, properties: Properties) {
        this.engageChannel.add({
            label: 'SubmitEngageWorker',
            handler: 'SubmitEngageWorker',
            args: { trackingApiKey: trackingApiKey, userId: userId, properties: properties },
        });
    }
}

class SubmitEventWorker {
    retry = 1;

    async handle(message: any) {
        let trackingApiKey = message.trackingApiKey;
        let event = message.event;
        let properties = message.properties as Properties;
        console.log(`SubmitTrackingEventWorker::handle: ${event} - ${properties}`);
        return this.getTrackingId(trackingApiKey).then(trackingId => {
            properties['di_tracking_id'] = trackingId || properties['di_tracking_id'] || '';
            return trackingService.track(trackingApiKey, event, properties);
        }).then(newTrackingId => {
            if (newTrackingId) {
                DataManager.setTrackingId(newTrackingId);
                return true;
            } else {
                return false;
            }
        }).catch(ex => console.error('SubmitEventWorker::track', ex));
    }


    async getTrackingId(trackingApiKey: string): Promise<string> {
        const generateTrackingId = async (): Promise<string> => {
            return trackingService.genTrackId(trackingApiKey).then(trackingId => {
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
}


class SubmitEngageWorker {
    retry = 1;

    async handle(message: any) {
        let trackingApiKey = message.trackingApiKey;
        let userId = message.userId;
        let properties = message.properties as Properties;
        return this.getTrackingId(trackingApiKey).then(trackingId => {
            properties['di_tracking_id'] = trackingId || properties['di_tracking_id'] || '';
            return trackingService.engage(trackingApiKey, userId, properties);
        }).then(newTrackingId => {
            if (newTrackingId) {
                DataManager.setTrackingId(newTrackingId);
                return true;
            } else {
                return false;
            }
        }).catch(ex => console.error('DiAnalytics::setUserProfile', ex));
    }


    async getTrackingId(trackingApiKey: string): Promise<string> {
        const generateTrackingId = async (): Promise<string> => {
            return trackingService.genTrackId(trackingApiKey).then(trackingId => {
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
}

Queue.workers({ SubmitEventWorker, SubmitEngageWorker });