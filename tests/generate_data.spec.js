/**
 * random number between min and max
 * @param min
 * @param max
 * @return {number}
 */
const nextInt = (min = 0, max = 1000) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const pickRandom = (arr) => {
  return arr[nextInt(0, arr.length - 1)];
};

describe('Generate tracking data', function() {
  const apiKey = 'di_api_486e270b-201c-4445-b55c-5cb333e41832';
  const host = 'https://tvc12.datainsider.co';
  // const apiKey = 'di_api_fee7c944-8f41-4d2c-b2fc-4900368c18a9';
  // const host = 'http://cdp-di.ddns.net';
  const DiAnalytics = window.DiAnalytics;
  const expect = window.chai.expect;
  this.timeout(600000); // 10 minutes
  function getStartTime() {
    return Date.now() - 1000 * 60 * 60 * 24 * 0; // 3 months
  }

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
    'laptop',
    'laptop',
    'phone',
    'phone',
    'phone',
    'phone',
    'watch',
    'watch',
    'camera',
    'headphone',
    'headphone',
    'speaker',
    'speaker',
    'speaker',
    'speaker',
    'air conditioner',
    'air conditioner',
    'fan'];
  const searchTerms = [
    'top product in month',
    'top product in year',
    'top product in week',
    'top product in day',
    'top product in hour',
    ...productNames
  ];
  const productIds = Array.from({length: 1000}, (index) => `product_${index}`);
  const productCategories = [
    'home appliance',
    'home appliance',
    'home appliance',
    'home appliance',
    'home appliance',
    'electronics',
    'electronics',
    'electronics',
    'electronics',
    'electronics',
    'fashion',
    'fashion',
    'health & beauty',
    'sports & outdoors',
    'sports & outdoors',
    'baby & kids',
    'furniture',
    'furniture',
    'furniture',
    'furniture',
    'furniture',
    'furniture',
    'furniture',
    'automotive',
    'toys & games',
    'food & beverage',
    'food & beverage',
    'home & living',
    'books & stationery',
    'pets',
    'others'
  ];
  const returnReasons = [
    'not fit',
    'not good',
    'not good',
    'not good',
    'not like',
    'not like',
    'not good quality',
    'not good color'];
  const cancelReasons = [
    'other',
    'not fit',
    'not fit',
    'not fit',
    'not good',
    'not like',
    'not good quality',
    'not good color'];
  // key is session id, value is timestamp
  const timestampWithSessionIdMap = {};
  const firstNames = [
    'John',
    'Mary',
    'Peter',
    'Alice',
    'Bob',
    'Tom',
    'Jerry',
    'Mickey',
    'Donald',
    'Minnie',
    'Goofy',
    'Minnie',
    'Donald',
    'Tigger',
    'Eeyore',
    'Piglet',
    'Pooh',
    'Rabbit',
    'Rafiki',
    'Mufasa',
    'Simba',
    'Scar',
    'Nala',
    'Timon',
    'Pumbaa',
    'Zazu'
  ]
  const lastNames = [
    'Smith',
    'Brown',
    'White',
    'Black',
    'Green',
    'Red',
    'Blue',
    'Pink',
    'Yellow',
    'Orange',
    'Purple',
    'Gray',
    'Gold',
    'Silver',
    'Diamond',
    'Ruby',
    'Sapphire',
    'Emerald',
    'Pearl',
    'Amethyst',
    'Topaz',
    'Citrine',
    'Garnet',
    'Onyx',
    'Jade',
    'Quartz',
    'Opal',
    'Sugilite',
    'Lapis',
    'Malachite',
    'Azurite',
    'Agate',
    'Tiger Eye',
    'Sodalite',
    'Carnelian',
    'Chrysocolla',
    'Turquoise',
    'Aventurine',
    'Jasper',
    'Obsidian',
    'Hematite',
    'Chalcedony',
    'Rhodonite',
    'Iolite',
    'Bloodstone',
    'Hematite',
    'Fluorite',
    'Kunzite',
    'Heliodor',
    'Chrysoprase',
    'Chrysoberyl',
    'Coral',
    'Moonstone',
    'Goshenite',
    'Beryl',
    'Garnet',
    'Spinel',
    'Peridot',
    'Tourmaline',
    'Sapphire',
    'Zircon',
    'Alexandrite',
    'Cubic Zirconia',
    'Tanzanite',
    'Sphene',
    'Amber',
    'Chrysoberyl',
    'Coral',
    'Moonstone',
    'Goshenite',
    'Beryl',
    'Garnet',
    'Spinel',
    'Peridot',
    'Tourmaline',
    'Sapphire',
    'Zircon',
    'Alexandrite',
    'Cubic Zirconia',
    'Tanzanite',
    'Sphene',
    'Amber',
    'Chrysoberyl',
    'Coral',
    'Moonstone',
    'Goshenite',
    'Beryl',
    'Garnet',
    'Spinel',
    'Peridot',
    'Tourmaline',
    'Sapphire',
    'Zircon',
    'Alexandrite',
    'Cubic Zirconia',
    'Tanzanite',
  ]


  function defaultProperties(screenName) {
    const customer = generateCustomer(nextInt(0, 10000));
    const sessionId = `${customer.di_customer_id}_session_${nextInt(0, 5)}`;
    const previousTimestamp = timestampWithSessionIdMap[sessionId] || getStartTime();
    const currentTimestamp = previousTimestamp + nextInt(60000, 1000 * 60 * 60 * 8); // 60 - 8 hours
    timestampWithSessionIdMap[sessionId] = currentTimestamp;
    return {
      di_duration: nextInt(1000, 100000),
      di_screen_name: screenName || pickRandom(screenNames),
      di_customer_id: customer.di_customer_id,
      di_session_id: sessionId,
      di_start_time: currentTimestamp,
      di_timestamp: currentTimestamp,
      utm_campaign: pickRandom([
        'sales_t1',
        'sales_t2',
        'sales_t3',
        'hot_fan',
        'winter_sale',
        'winter_sale',
        'winter_sale',
        undefined,
        undefined]),
      utm_source: pickRandom(
        [
          'facebook', 'google', 'google',
          'google', 'twitter', 'instagram', undefined, undefined]),
      utm_medium: pickRandom(
        [
          'organic', 'organic',
          'organic', 'cpc', 'cpc', 'cpm', 'cpa', undefined, undefined]),
      ...customer
    };
  }

  function generateProducts(checkoutId, productIds, screenName) {
    return productIds.map((productId) => {
      return {
        checkout_id: checkoutId,
        product_id: productId,
        title: pickRandom(productNames),
        category: pickRandom(productCategories),
        quantity: nextInt(1, 50),
        price: nextInt(1000, 10000),
        properties: defaultProperties(screenName)
      };
    });
  }

  function generateCustomer(id) {
      const firstName = pickRandom(firstNames);
      const lastName = pickRandom(lastNames);
      const email = `${firstName}_${lastName}_${id}@gmail.com`.toLowerCase();
      const birthday = new Date(nextInt(1980, 2010), nextInt(0, 11), nextInt(1, 28)); // 1980 - 2000
      const customer = {
        di_customer_id: `customer_${id}`,
        di_customer_first_name: firstName,
        di_customer_last_name: lastName,
        di_customer_phone_number: `+84${nextInt(100000000, 999999999)}`,
        di_customer_email: email,
        di_customer_avatar_url: `https://randomuser.me/api/portraits/women/${nextInt(0, 99)}.jpg`,
        di_customer_dob: birthday.getTime(),
        di_customer_gender: nextInt(0, 1)
      }
      return customer;
  }

  it('should init client must success', function() {
    expect(!!DiAnalytics).is.true;

    DiAnalytics.init(host, apiKey, {}, false, 500, 1000);
  });


  // it('generate track enter screen', async () => {
  //   const nItem = nextInt(10000, 20000);
  //   for (let i = 0; i < nItem; ++i) {
  //     const screenName = pickRandom(screenNames);
  //     await DiAnalytics.enterScreen(screenName, defaultProperties(screenName));
  //   }
  // });
  // it('track search product success', async () => {
  //   const nItem = nextInt(20000, 40000);
  //   for (let i = 0; i < nItem; ++i) {
  //     const searchTerm = pickRandom(searchTerms);
  //
  //     const trackResult = await DiAnalytics.search(searchTerm, defaultProperties('search_screen'));
  //     expect(trackResult).is.undefined;
  //   }
  // });
  // it('track view product success', async () => {
  //   for (let i = 0; i < 50000; ++i) {
  //     const productId = pickRandom(productIds);
  //     const productName = pickRandom(productNames);
  //     const productPrice = nextInt(100, 10000);
  //     const previousScreenName = pickRandom(screenNames);
  //
  //     const trackResult = await DiAnalytics.viewProduct(productId, productName,
  //       productPrice, previousScreenName, defaultProperties('product_screen'));
  //     expect(trackResult).is.undefined;
  //   }
  // });
  // it('track add to cart success', async () => {
  //   for (let i = 0; i < 30000; ++i) {
  //     const properties = defaultProperties('cart_screen');
  //     const productId = pickRandom(productIds);
  //     const productName = pickRandom(productNames);
  //     const productType = pickRandom(productCategories);
  //     const previousScreenName = pickRandom(screenNames);
  //     const trackResult = await DiAnalytics.addToCart(
  //       `https://datainsider.co/product/${productId}`,
  //       'VND',
  //       `https://datainsider.co/product/${productId}.png`,
  //       nextInt(1000, 100000),
  //       productId,
  //       productType,
  //       nextInt(1, 10),
  //       productName,
  //       undefined,
  //       undefined,
  //       undefined,
  //       previousScreenName,
  //       properties
  //     );
  //     expect(trackResult).is.undefined;
  //   }
  // });
  // it('track remove from cart success', async () => {
  //   for (let i = 0; i < 40000; ++i) {
  //     const properties = defaultProperties('cart_screen');
  //     const productId = pickRandom(productIds);
  //     const productName = pickRandom(productNames);
  //     const productType = pickRandom(productCategories);
  //     const previousScreenName = pickRandom(screenNames);
  //     const trackResult = await DiAnalytics.removeFromCart(
  //       `https://datainsider.co/product/${productId}`,
  //       'VND',
  //       `https://datainsider.co/product/${productId}.png`,
  //       nextInt(1000, 100000),
  //       productId,
  //       productType,
  //       nextInt(1, 10),
  //       productName,
  //       undefined,
  //       undefined,
  //       undefined,
  //       previousScreenName,
  //       properties
  //     );
  //     expect(trackResult).is.undefined;
  //   }
  // });
  it('track checkout success', async () => {
    for (let i = 0; i < nextInt(80000, 100000); ++i) {
      const properties = defaultProperties('checkout_screen');
      const checkoutId = `checkout_${nextInt(i, 1000000)}`;
      const currentProductIds = [
        pickRandom(productIds),
        pickRandom(productIds),
        pickRandom(productIds),
        pickRandom(productIds),
        pickRandom(productIds),
        pickRandom(productIds)
      ];
      const products = generateProducts(checkoutId, currentProductIds,
        'checkout_screen');
      const trackResult = await DiAnalytics.checkout(
        checkoutId,
        nextInt(1, 100000),
        `https://checkout.datainsider.co/${checkoutId}`,
        products,
        properties
      );
      expect(trackResult).is.undefined;
    }
  });
  // it('track return order', async () => {
  //   for (let i = 0; i < 10000; ++i) {
  //     const checkoutId = `checkout_${nextInt(i, 80000)}`;
  //     const properties = defaultProperties('return_screen');
  //     const currentProductIds = [
  //       pickRandom(productIds),
  //       pickRandom(productIds)];
  //     const products = generateProducts(checkoutId, currentProductIds,
  //       'return_screen');
  //     const trackResult = await DiAnalytics.returnOrder(
  //       checkoutId,
  //       pickRandom(returnReasons),
  //       products,
  //       properties
  //     );
  //     expect(trackResult).is.undefined;
  //   }
  // });
  // it('track cancel order', async () => {
  //   for (let i = 0; i < 8000; ++i) {
  //     const checkoutId = `checkout_${nextInt(i, 80000)}`;
  //     const properties = defaultProperties('cancel_screen');
  //     const currentProductIds = [
  //       pickRandom(productIds),
  //       pickRandom(productIds)];
  //     const products = generateProducts(checkoutId, currentProductIds,
  //       'cancel_screen');
  //     const trackResult = await DiAnalytics.cancelOrder(
  //       checkoutId,
  //       pickRandom(cancelReasons),
  //       products,
  //       properties
  //     );
  //     expect(trackResult).is.undefined;
  //   }
  // });

  it('wait for test send data', async () => {
    await sleep(5000);
  });

});
