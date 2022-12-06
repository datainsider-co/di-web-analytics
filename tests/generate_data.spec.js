const nextInt = (min = 0, max = 1000) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const pickRandom = (arr) => {
  return arr[nextInt(0, arr.length - 1)];
};

describe('Generate tracking data', function() {
  const apiKey = 'di_api_fee7c944-8f41-4d2c-b2fc-4900368c18a9';
  const host = 'http://cdp-di.ddns.net';
  const DiAnalytics = window.DiAnalytics;
  const expect = window.chai.expect;
  this.timeout(600000); // 10 minutes
  const startTime = Date.now() - 1000 * 60 * 60 * 24 * 60; // 60 days ago

  const screenNames = [
    'login_screen',
    'home_screen',
    'search_screen',
    'product_screen',
    'cart_screen',
    'checkout_screen'];
  const productNames = [
    'fridge',
    'tv',
    'laptop',
    'phone',
    'watch',
    'camera',
    'headphone',
    'speaker',
    'air conditioner',
    'fan'];
  const searchTerms = [
    'top product in month',
    'top product in year',
    'top product in week',
    'top product in day',
    'top product in hour',
    ...productNames];
  const productIds = Array.from({length: 100}, (index) => 'product_' + index);
  const productTypes = ['large', 'medium', 'small'];
  const returnReasons = [
    'not fit',
    'not good',
    'not like',
    'not good quality',
    'not good color'];
  const cancelReasons = [
    'other',
    'not fit',
    'not good',
    'not like',
    'not good quality',
    'not good color'];
  // key is session id, value is timestamp
  const timestampWithSessionIdMap = {};

  function defaultProperties(screenName) {
    const customerId = 'customer_' + nextInt(0, 100000);
    const sessionId = `${customerId}_session_${nextInt(0, 1000)}`;
    const previousTimestamp = timestampWithSessionIdMap[sessionId] || startTime;
    const currentTimestamp = previousTimestamp + nextInt(1000, 28800000); // 1s - 8 hours
    timestampWithSessionIdMap[sessionId] = currentTimestamp;
    return {
      di_duration: nextInt(1000, 10000),
      di_screen_name: screenName || pickRandom(screenNames),
      di_customer_id: customerId,
      di_session_id: sessionId,
      di_timestamp: currentTimestamp
    };
  }

  it('should init client must success', function() {
    expect(!!DiAnalytics).is.true;

    DiAnalytics.init(host, apiKey, {}, false, 2000, 5000);
  });

  it('generate track enter screen', async () => {
    const nItem = nextInt(10000, 100000);
    for (let i = 0; i < nItem; ++i) {
      const screenName = pickRandom(screenNames);
      await DiAnalytics.enterScreen(screenName, defaultProperties(screenName));
    }
  });
  it('track search product success', async () => {
    const nItem = nextInt(10000, 70000);
    for (let i = 0; i < nItem; ++i) {
      const searchTerm = pickRandom(searchTerms);

      const trackResult = await DiAnalytics.search(searchTerm,
        defaultProperties('search_screen'));
      expect(trackResult).is.undefined;
    }
  });
  it('track view product success', async () => {
    const nItem = nextInt(10000, 90000);
    for (let i = 0; i < nItem; ++i) {
      const productId = pickRandom(productIds);
      const productName = pickRandom(productNames);
      const productPrice = nextInt(100, 10000);
      const previousScreenName = pickRandom(screenNames);

      const trackResult = await DiAnalytics.viewProduct(productId, productName,
        productPrice, previousScreenName, defaultProperties('product_screen'));
      expect(trackResult).is.undefined;
    }
  });
  it('track add to cart success', async () => {
    const nItem = nextInt(20000, 80000);
    for (let i = 0; i < nItem; ++i) {
      const properties = defaultProperties('cart_screen');
      const productId = pickRandom(productIds);
      const productName = pickRandom(productNames);
      const productType = pickRandom(productTypes);
      const previousScreenName = pickRandom(screenNames);
      const trackResult = await DiAnalytics.addToCart(
        `https://datainsider.co/product/${productId}`,
        'VND',
        `https://datainsider.co/product/${productId}.png`,
        nextInt(1000, 100000),
        productId,
        productType,
        nextInt(1, 10),
        productName,
        undefined,
        undefined,
        undefined,
        previousScreenName,
        properties
      );
      expect(trackResult).is.undefined;
    }
  });
  it('track remove from cart success', async () => {
    const nItem = nextInt(20000, 60000);
    for (let i = 0; i < nItem; ++i) {
      const properties = defaultProperties('cart_screen');
      const productId = pickRandom(productIds);
      const productName = pickRandom(productNames);
      const productType = pickRandom(productTypes);
      const previousScreenName = pickRandom(screenNames);
      const trackResult = await DiAnalytics.removeFromCart(
        `https://datainsider.co/product/${productId}`,
        'VND',
        `https://datainsider.co/product/${productId}.png`,
        nextInt(1000, 100000),
        productId,
        productType,
        nextInt(1, 10),
        productName,
        undefined,
        undefined,
        undefined,
        previousScreenName,
        properties
      );
      expect(trackResult).is.undefined;
    }
  });
  it('track checkout success', async () => {
    const nItem = nextInt(10000, 60000);
    for (let i = 0; i < nItem; ++i) {
      const properties = defaultProperties('checkout_screen');
      const checkoutId = `checkout_${i + 1}`;
      const productIds = [pickRandom(productIds), pickRandom(productIds)];
      const productNames = [pickRandom(productNames), pickRandom(productNames)];
      const trackResult = await DiAnalytics.checkout(
        checkoutId,
        nextInt(1, 15),
        'VND',
        nextInt(1000, 100000),
        productIds,
        productNames,
        [],
        [],
        `https://datainsider.co/product/${checkoutId}/checkout`,
        properties
      );
      expect(trackResult).is.undefined;
    }
  });
  it('track return order', async () => {
    const nItem = nextInt(10000, 10000);
    for (let i = 0; i < nItem; ++i) {
      const checkoutId = `checkout_${nextInt(1000, 100000)}`;
      const properties = defaultProperties('return_screen');
      const trackResult = await DiAnalytics.returnOrder(
        checkoutId,
        pickRandom(returnReasons),
        properties
      );
      expect(trackResult).is.undefined;
    }
  });
  it('track cancel order', async () => {
    const nItem = nextInt(10000, 10000);
    for (let i = 0; i < nItem; ++i) {
      const checkoutId = `checkout_${nextInt(1000, 800000)}`;
      const properties = defaultProperties('cancel_screen');
      const trackResult = await DiAnalytics.cancelOrder(
        checkoutId,
        pickRandom(cancelReasons),
        properties
      );
      expect(trackResult).is.undefined;
    }
  });

  it('wait for test send data', async () => {
    await sleep(5000);
  });

});
