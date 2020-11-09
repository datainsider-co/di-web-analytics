import {Properties} from "../domain";
import Queue from "storage-based-queue";
import {trackingService} from '../service/tracking_service';
import {DataManager} from './data_manager';
import {EventColumnIds} from '../domain/system_events';

async function getTrackingId(trackingApiKey: string): Promise<string> {
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

export class SubmitEventWorker {
  retry = 1;

  async handle(message: any): Promise<any> {
    let trackingApiKey = message.trackingApiKey;
    let event = message.event;
    let properties = message.properties as Properties;
    return getTrackingId(trackingApiKey).then(trackingId => {
      properties[EventColumnIds.TRACKING_ID] = trackingId || properties[EventColumnIds.TRACKING_ID] || '';
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


}

export class SubmitEngageWorker {
  retry = 1;

  async handle(message: any): Promise<any> {
    let trackingApiKey = message.trackingApiKey;
    let userId = message.userId;
    let properties = message.properties as Properties;
    console.info(`SubmitEngageWorker::handle: ${userId} - ${properties}`);
    return getTrackingId(trackingApiKey).then(trackingId => {
      properties[EventColumnIds.TRACKING_ID] = trackingId || properties[EventColumnIds.TRACKING_ID] || '';
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
}

Queue.workers({SubmitEventWorker, SubmitEngageWorker});
