import {expect} from 'chai';
import AnalyticsUtils, {SearchEngine} from '../src/misc/analytics_utils';

describe('URL Parser', () => {


  it('Get url info success', async () => {
    let url = new URL("https://www.youtube.com/watch?v=7CaIOrzTVGE&t=1414&duration=400");

    console.log("Protocol: " + url.protocol);
    console.log("Host: " + url.host);
    console.log("Host name: " + url.hostname);
    console.log("Path: " + url.pathname);
    console.log("Port: " + url.port);
    console.log("Username: " + url.username);
    console.log("Search: " + url.search);

  });

  it('Get query param success', async () => {
    let url = new URL("https://www.youtube.com/watch?v=7CaIOrzTVGE&t=1414&duration=400");
    let params = AnalyticsUtils.getQueryParams(url.search);

    expect(params['v']).equal('7CaIOrzTVGE');
    expect(params['t']).equal('1414');
    expect(params['duration']).equal('400');

  });


  it('Get search engine success', async () => {

    expect(AnalyticsUtils.getSearchEngine('https://www.google.com/')).equal(SearchEngine.GOOGLE);
    expect(AnalyticsUtils.getSearchEngine('https://www.bing.com/')).equal(SearchEngine.BING);
    expect(AnalyticsUtils.getSearchEngine('https://www.yahoo.com/')).equal(SearchEngine.YAHOO);
    expect(AnalyticsUtils.getSearchEngine('https://www.duckduckgo.com/')).equal(SearchEngine.DUCKDUCKGO);
    expect(AnalyticsUtils.getSearchEngine('https://www.coccoc.com/')).equal(SearchEngine.COCCOC);
    expect(AnalyticsUtils.getSearchEngine('https://www.yandex.com/')).equal(SearchEngine.YANINDEX);
    expect(AnalyticsUtils.getSearchEngine('https://dictionary.cambridge.org/')).equal(SearchEngine.UNKNOWN);

  });


  it('Get keyword from search engine success', async () => {

    expect(AnalyticsUtils.getSearchKeyword('https://www.google.com/search?sxsrf=ALeKk0129wwsaMIhjEcoBQK7BsJlObd4nQ%3A1602155162754&source=hp&ei=mvJ-X-3JK4jAoASJsIKwAQ&q=cat&oq=cat&gs_lcp=CgZwc3ktYWIQAzILCAAQsQMQyQMQkQIyBQguELEDMgUIABCxAzIFCAAQsQMyAgguMggIABCxAxCDATIICC4QxwEQowIyBQgAELEDMgUIABCxAzICCAA6BAgjECc6BwgAEMkDEEM6CwguELEDEMcBEKMCOg0IABCxAxCDARAUEIcCOgsILhCxAxDHARCvAVD9MFibM2C2NmgAcAB4AIABrAGIAYUDkgEDMC4zmAEAoAEBqgEHZ3dzLXdpeg&sclient=psy-ab&ved=0ahUKEwjt_uSK7aTsAhUIIIgKHQmYABYQ4dUDCAc&uact=5')).equal('cat');
    expect(AnalyticsUtils.getSearchKeyword('https://www.bing.com/search?q=flowers&qs=EP&pq=flo&sc=8-3&cvid=0AD5A1A969F342B9AAA102D0E951F522&FORM=QBLH&sp=1')).equal('flowers');
    expect(AnalyticsUtils.getSearchKeyword('https://vn.search.yahoo.com/search?p=car&fr=yfp-t&fr=yfp-t-s&fp=1&toggle=1&cop=mss&ei=UTF-8')).equal('car');
    expect(AnalyticsUtils.getSearchKeyword('https://duckduckgo.com/?q=time&t=hk&ia=web')).equal('time');
    expect(AnalyticsUtils.getSearchKeyword('https://coccoc.com/search?query=trump')).equal('trump');
    expect(AnalyticsUtils.getSearchKeyword('https://yandex.com/search/?text=time&lr=10553&redircnt=1602155471.1')).equal('time');

  });


  it('Get Device Platform from user agent success', async () => {
    let userAgents = [
      'Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
    ];

    expect(AnalyticsUtils.getDevicePlatform(userAgents[0]).type).equal('mobile');
    expect(AnalyticsUtils.getDevicePlatform(userAgents[0]).model).equal('');
    expect(AnalyticsUtils.getDevicePlatform(userAgents[0]).vendor).equal('Nexus');

    expect(AnalyticsUtils.getDevicePlatform(userAgents[1]).type).equal('desktop');
    expect(AnalyticsUtils.getDevicePlatform(userAgents[1]).model).equal('');
    expect(AnalyticsUtils.getDevicePlatform(userAgents[1]).vendor).equal('Apple');

    expect(AnalyticsUtils.getDevicePlatform(userAgents[2]).type).equal('desktop');
    expect(AnalyticsUtils.getDevicePlatform(userAgents[2]).model).equal('');
    expect(AnalyticsUtils.getDevicePlatform(userAgents[2]).vendor).equal('');

    expect(AnalyticsUtils.getDevicePlatform(userAgents[3]).type).equal('desktop');
    expect(AnalyticsUtils.getDevicePlatform(userAgents[3]).model).equal('');
    expect(AnalyticsUtils.getDevicePlatform(userAgents[3]).vendor).equal('Apple');


    expect(AnalyticsUtils.getDevicePlatform(userAgents[4]).type).equal('mobile');
    expect(AnalyticsUtils.getDevicePlatform(userAgents[4]).model).equal('iPhone');
    expect(AnalyticsUtils.getDevicePlatform(userAgents[4]).vendor).equal('Apple');

  });

  it('Get OS from user agent success', async () => {
    let userAgents = [
      'Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
      'Mozilla/5.0 CK={} (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
    ];

    expect(AnalyticsUtils.getOS(userAgents[0]).name).equal('Android');
    expect(AnalyticsUtils.getOS(userAgents[0]).version).equal('4.0.4');
    expect(AnalyticsUtils.getOS(userAgents[0]).versionName).equal('Ice Cream Sandwich');

    expect(AnalyticsUtils.getOS(userAgents[1]).name).equal('macOS');
    expect(AnalyticsUtils.getOS(userAgents[1]).version).equal('10.15.7');
    expect(AnalyticsUtils.getOS(userAgents[1]).versionName).equal('Catalina');

    expect(AnalyticsUtils.getOS(userAgents[2]).name).equal('Windows');
    expect(AnalyticsUtils.getOS(userAgents[2]).version).equal('NT 6.1');
    expect(AnalyticsUtils.getOS(userAgents[2]).versionName).equal('7');

    expect(AnalyticsUtils.getOS(userAgents[3]).name).equal('Windows');
    expect(AnalyticsUtils.getOS(userAgents[3]).version).equal('NT 10.0');
    expect(AnalyticsUtils.getOS(userAgents[3]).versionName).equal('10');

    expect(AnalyticsUtils.getOS(userAgents[4]).name).equal('iOS');
    expect(AnalyticsUtils.getOS(userAgents[4]).version).equal('12.2');
    expect(AnalyticsUtils.getOS(userAgents[4]).versionName).equal('');

  });

  it('Get Browser from user agent success', async () => {
    let userAgents = [
      'Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
      'Mozilla/5.0 CK={} (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
    ];

    expect(AnalyticsUtils.getBrowser(userAgents[0]).name).equal('Chrome');
    expect(AnalyticsUtils.getBrowser(userAgents[0]).version).equal('18.0.1025.133');

    expect(AnalyticsUtils.getBrowser(userAgents[1]).name).equal('Chrome');
    expect(AnalyticsUtils.getBrowser(userAgents[1]).version).equal('85.0.4183.121');

    expect(AnalyticsUtils.getBrowser(userAgents[2]).name).equal('Internet Explorer');
    expect(AnalyticsUtils.getBrowser(userAgents[2]).version).equal('11.0');

    expect(AnalyticsUtils.getBrowser(userAgents[3]).name).equal('Chrome');
    expect(AnalyticsUtils.getBrowser(userAgents[3]).version).equal('74.0.3729.169');

    expect(AnalyticsUtils.getBrowser(userAgents[4]).name).equal('Safari');
    expect(AnalyticsUtils.getBrowser(userAgents[4]).version).equal('12.1');

    expect(AnalyticsUtils.getBrowser(userAgents[5]).name).equal('Safari');
    expect(AnalyticsUtils.getBrowser(userAgents[5]).version).equal('');

  });

  it("test get utm params", () => {
    const url = "https://rocket-bi.ddns.net?utm_source=google&utm_medium=banner&utm_campaign=banner_1&utm_id=123456&utm_term=spring_sales&utm_content=hello123";
    const campaign = AnalyticsUtils.getCampaignInfo(url);
    console.log('campaign', campaign);
    expect(campaign.utm_campaign).equal("banner_1");
    expect(campaign.utm_content).equal("hello123");
    expect(campaign.utm_id).equal("123456");
    expect(campaign.utm_medium).equal("banner");
    expect(campaign.utm_source).equal("google");
    expect(campaign.utm_term).equal("spring_sales");
  });

  it("test get utm params with utm_source & utm_medium", () => {
    const url = "https://rocket-bi.ddns.net?utm_source=google&utm_medium=banner";
    const campaign = AnalyticsUtils.getCampaignInfo(url);
    console.log('campaign', campaign);
    expect(campaign.utm_campaign).be.true;
    expect(campaign.utm_content).is.undefined;
    expect(campaign.utm_id).is.undefined;
    expect(campaign.utm_medium).equal("banner");
    expect(campaign.utm_source).equal("google");
    expect(campaign.utm_term).is.undefined;
  });



});


