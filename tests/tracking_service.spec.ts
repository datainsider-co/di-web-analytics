import {expect} from 'chai';
import TRACKING_SERVICE from '../src/service/tracking_service';
import LibConfig from '../src/domain/config';
import {Event} from '../src';

describe('Test tracking service', () => {
  const apiKey = 'di_api_fee7c944-8f41-4d2c-b2fc-4900368c18a9';
  const customerId = 'test_user';
  const host = 'http://cdp-di.ddns.net';

  const defaultProperties = {
    di_customer_id: customerId,
    os_name: 'linux',
    os_version: 'ubuntu-22.04',
    di_referrer: 'https://google.com',
    utm_source: 'google',
    utm_medium: 'organic',
  };

  LibConfig.setValue('apiKey', apiKey).setValue('host', host);

  it('Should track is success', async () => {
    const success = await TRACKING_SERVICE.track(`tracking_testing`, {
      di_event_id: 'event_id_1',
      di_event_name: 'tracking_testing',
      di_screen_name: 'test_screen',
      di_timestamp: Date.now(),
      ...defaultProperties
    });
    console.log('track::success::', success);
    expect(success).true;
  });

  it('should multiTrack is success', async () => {
    const events: Event[] = [];
    for (let i = 1; i <= 2; i++) {
      const properties = {
        di_event_name: 'tracking_testing',
        di_screen_name: 'test_screen_' + i,
        ...defaultProperties
      };
      events.push({name: `tracking_testing_${i}`, properties: properties});
    }
    const success = await TRACKING_SERVICE.multiTrack(events);
    console.log('multiTrack::success::', success);
    expect(success).true;
  });

  it('should track user is success', async () => {
    const success = await TRACKING_SERVICE.track('di_customers', {
      'di_customer_id': 'up-d47a7e4c-3d08-4aa6-a7af-5024672500ab',
      'di_customer_email': 'meomeocf98@gmail.com',
      'di_customer_full_name': 'Vi Thien',
      'di_customer_first_name': 'Vi',
      'di_customer_last_name': 'Thien',
      'di_customer_phone_number': '0987654321',
      'di_customer_avatar_url': 'https://tvc12.com/my-avatar.png',
      'di_customer_dob': '1622956800000',
      'di_customer_gender': 1
    });
    console.log('track user is success::', success);
    expect(success).true;
  });
});
