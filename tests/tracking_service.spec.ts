import {trackingService} from '../src/service';
import {expect} from 'chai';

describe('Test tracking api key', () => {
  const trackId = 'trace_id_test';

  const apiKey = 'test_api_key';
  const userId = 'test_user';

  it('Should generate api key success', async () => {
    const trackId = await trackingService.genTrackId(apiKey);
    console.log('track::trackId::', trackId);
    expect(trackId).not.undefined;
  });

  it('Should track is success', async () => {
    const trackId = await trackingService.track(apiKey, 'product_purchased', {
      productName: 'Laptop',
      category: 'Computer',
      price: 10000,
      unit: 'USD',
      color: 'Red',
      connectivity: ['3G', '4G', '5G', 'Ethernet'],
      diUserId: userId,
      createdAt: Date.now().toString()
    });
    console.log('track::trackId::', trackId);
    expect(trackId).not.undefined;
  });

  it('Should engage is success', async () => {
    const trackId = await trackingService.engage(apiKey, userId, {
      name: 'Vi Chi Thien',
      age: 18,
      languageCode: 'vi',
      countryCode: 'vn',
      location: 'HCM city',
      updatedAt: Date.now().toString()
    });
    console.log('track::trackId::', trackId);
    expect(trackId).not.undefined;
  });
});
