import { trackingService } from '../src/service';
import { expect } from 'chai';

describe('Test tracking service', () => {
  const trackId = 'trace_id_test';

  const apiKey = 'test_api_key';
  const userId = 'test_user';

  const defaultValues = {
    diPlatform: 'web',
    diLibVersion: '0.0.1',
    diTrackingId: trackId,
    diUserId: userId,
    diStartTime: 0,
    diDuration: 0,
    diTime: Date.now()
  };

  const defaultEngageValues = {
    diPlatform: 'web',
    diLibVersion: '0.0.1',
    diTrackingId: trackId,
    diUserId: userId,
    diStartTime: 0,
    diDuration: 0,
    diTime: Date.now(),
    birthDate: 0
  };

  // it('Should generate api key success', async () => {
  //   const trackId = await trackingService.genTrackId(apiKey);
  //   console.log('track::trackId::', trackId);
  //   expect(trackId).not.undefined;
  // });

  it('Should track is success', async () => {
    const trackId = await trackingService.track(apiKey, 'product_purchased', {
      productName: 'Laptop',
      category: 'Computer',
      price: 10000,
      unit: 'USD',
      color: 'Red',
      connectivity: ['3G', '4G', '5G', 'Ethernet'],
      ...{ diUserId: userId },
      createdAt: Date.now(),
      ...defaultValues
    });
    console.log('track::trackId::', trackId);
    expect(trackId).not.undefined;
  });

  it('Should engage is success', async () => {
    const trackId = await trackingService.engage(apiKey, userId, {
      displayName: 'Vi Chi Thien',
      firstName: 'Thien',
      lastName: 'Thien',
      age: 18,
      email: 'tvc12@gmail.com',
      gender: 'male',
      countryCode: 'vn',
      updatedTime: Date.now(),
      createdTime: Date.now(),
      ...defaultEngageValues
    });
    console.log('engage::trackId::', trackId);
    expect(trackId).not.undefined;
  });
});
