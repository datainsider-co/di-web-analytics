import {expect} from 'chai';
import TRACKING_SERVICE from '../src/service/tracking_service';
import LibConfig from '../src/domain/config';
import {Event} from '../src';

describe('Test tracking service', () => {
  const trackId = '"user-123456';

  const apiKey = 'di_api_fee7c944-8f41-4d2c-b2fc-4900368c18a9';
  const userId = 'test_user';
  const host = 'http://cdp-di.ddns.net';

  const defaultValues = {
    di_platform: 'web',
    di_lib_version: '0.0.1',
    di_tracking_id: trackId,
    di_user_id: userId,
    di_start_time: 0,
    di_duration: 0,
    di_time: Date.now()
  };

  LibConfig.setValue('apiKey', apiKey).setValue('host', host);

  it('Should track is success', async () => {
    const success = await TRACKING_SERVICE.track(`tracking_testing`, {
      screen_name: 'test_screen',
      os: 'linux',
      created_at: Date.now(),
      ...defaultValues
    });
    console.log('track::success::', success);
    expect(success).true;
  });

  it('should multiTrack is success', async () => {
    const events: Event[] = [];
    for (let i = 0; i < 10; i++) {
      const properties = {
        screen_name: 'test_screen_' + i,
        os: 'linux',
        created_at: Date.now(),
        ...defaultValues
      };
      events.push({name: `tracking_testing_${i}`, properties: properties});
    }
    const success = await TRACKING_SERVICE.multiTrack(events);
    console.log('multiTrack::success::', success);
    expect(success).true;
  });
});
