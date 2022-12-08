describe('testing the client', function() {
  const apiKey = 'di_api_fee7c944-8f41-4d2c-b2fc-4900368c18a9';
  const host = 'http://cdp-di.ddns.net';
  const DiAnalytics = window.DiAnalytics;
  const expect = window.chai.expect;
  this.timeout(10000);

  it('should init client must success', function() {
    expect(!!DiAnalytics).is.true;

    DiAnalytics.init(host, apiKey, {}, false, 50, 1000);
  });

  it('should change log level', () => {
    DiAnalytics.setLoggerLevel(3);
  });

  it('should track event success', async () => {
    const trackResult = await DiAnalytics.track('test_event', {
      di_duration: 1000,
      di_screen_name: 'test_screen'
    });
    expect(trackResult).is.undefined;
  });
  it('should track 10 event is success', async () => {
    for (let i = 0; i < 50; i++) {
      await DiAnalytics.track('test_event', {
        di_duration: i,
        di_screen_name: 'test_screen_' + i
      });
    }
  });
  it('track enter screen', async () => {
    const trackResult = await DiAnalytics.enterScreen('home_screen', {
      url: 'https://datainsider.co/home',
      di_duration: 1000
    });
    expect(trackResult).is.undefined;
  });
  it('track search product success', async () => {
    const trackResult = await DiAnalytics.search('top product in month', {
      di_duration: 1000,
      di_screen_name: 'search_screen'
    });
    expect(trackResult).is.undefined;
  });
  it('track view product success', async () => {
    const trackResult = await DiAnalytics.viewProduct('product_1', 'fridge',
      '1500000', 'search_screen', {
        di_duration: 5000,
        di_screen_name: 'product_screen'
      });
    expect(trackResult).is.undefined;
  });
  it('track add to cart success', async () => {
    const trackResult = await DiAnalytics.addToCart(
      'https://datainsider.co/product/product_1',
      'VND',
      'https://datainsider.co/product/product_1.png',
      '1000',
      'product_1',
      'small_type',
      12,
      'fridge',
      'product_type_1',
      'variant_1',
      'variant_frige_1',
      undefined
    );
    expect(trackResult).is.undefined;
  });
  it("track remove from cart success", async () => {
    const trackResult = await DiAnalytics.removeFromCart(
      'https://datainsider.co/product/product_1',
      'VND',
      'https://datainsider.co/product/product_1.png',
      '1000',
      'product_1',
      'small_type',
      12,
      'fridge',
      'product_type_1',
      'variant_1',
      'variant_frige_1',
      undefined
    );
    expect(trackResult).is.undefined;
  });
  it("track checkout success", async () => {
    const trackResult = await DiAnalytics.checkout(
      'checkout_1',
      1000,
      'https://product.com/product_1',
      [
        {
          product_id: 'product_1',
          title: 'fridge',
          quantity: 10,
          price: 2000,
          category: 'product_type_1',
          properties: {
            variant: 'variant_1',
          }
        }
      ],
    )
    expect(trackResult).is.undefined;
  })
  it("track return order", async () => {
    const trackResult = await DiAnalytics.returnOrder(
      'checkout_id_1',
      'i want to return this product',
      [
        {
          product_id: 'product_1',
          title: 'fridge',
          quantity: 10,
          price: 2000,
          category: 'product_type_1',
          properties: {
            variant: 'variant_1',
          }
        }
      ],
      {
        di_duration: 1000,
      }
    );
    expect(trackResult).is.undefined;
  })
  it("track cancel order", async () => {
    const trackResult = await DiAnalytics.cancelOrder(
      'checkout_id_1',
      'i want to return this product',
      [
        {
          product_id: 'product_1',
          title: 'fridge',
          quantity: 10,
          price: 2000,
          category: 'product_type_1',
          properties: {
            variant: 'variant_1',
          }
        }
      ],
      {
        di_duration: 1000,
      }
    );
    expect(trackResult).is.undefined;
  })


  it("wait for test send data", async () => {
    await sleep(5000)
  });

})
