import {expect} from 'chai';
import TRACKING_SERVICE from '../src/service/tracking_service';
import LibConfig from '../src/domain/config';

describe('Test tracking service', () => {
  const trackId = '"user-123456';

  const apiKey = '"c2c09332-14a1-4eb1-8964-2d85b2a561c8';
  const userId = 'test_user';
  const host = 'http://dev.datainsider.co'

  const defaultValues = {
    diPlatform: 'web',
    diLibVersion: '0.0.1',
    diTrackingId: trackId,
    diUserId: userId,
    diStartTime: 0,
    diDuration: 0,
    diTime: Date.now()
  };

  LibConfig.setValue('apiKey', apiKey).setValue('host', host)

  it('Should track is success', async () => {
    const success = await TRACKING_SERVICE.track('product_purchased', {
      productName: 'Laptop',
      category: 'Computer',
      price: 10000,
      unit: 'USD',
      color: 'Red',
      connectivity: ['3G', '4G', '5G', 'Ethernet'],
      ...{diUserId: userId},
      createdAt: Date.now(),
      ...defaultValues
    });
    console.log('track::success::', success);
    expect(success).true;
  });

});
