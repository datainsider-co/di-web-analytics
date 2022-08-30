import Bowser from 'bowser';
import {Properties} from '../domain/properties';
import {EventColumnIds} from '../domain/system_events';

export enum SearchEngine {
  GOOGLE = 'google',
  BING = 'bing',
  YAHOO = 'yahoo',
  DUCKDUCKGO = 'duckduckgo',
  COCCOC = 'coccoc',
  YANINDEX = 'yandex',
  UNKNOWN = ''
}

export class PlatformInfo {
  readonly type: string;
  readonly model: string;
  readonly vendor: string;

  constructor(type: string, model: string, vendor: string) {
    this.type = type;
    this.model = model;
    this.vendor = vendor;
  }

  isValid(): boolean {
    return this.type != null && this.type != undefined && this.type.length > 0;
  }
}

export class OSInfo {
  readonly name: string;
  readonly version: string;
  readonly versionName: string;

  constructor(name: string, version: string, versionName: string) {
    this.name = name;
    this.version = version;
    this.versionName = versionName;
  }

  isValid(): boolean {
    return this.name != null && this.name != undefined && this.name.length > 0;
  }
}

export class BrowserInfo {
  readonly name: string;
  readonly version: string;

  constructor(name: string, version: string) {
    this.name = name;
    this.version = version;
  }

  isValid(): boolean {
    return this.name != null && this.name != undefined && this.name.length > 0;
  }
}

export default class AnalyticsUtils {

  static readonly QUERY_PARAM_REGEXP = new RegExp('[\\?&]?(\\w+)=([^&#]*)', 'g');


  static buildPageAndReferrerInfo(currentUrl?: string, referrerUrl?: string): Properties {
    const url = new URL(currentUrl ?? window.document.URL);
    const properties = {} as Properties;

    properties[EventColumnIds.URL] = url.href;
    properties[EventColumnIds.PATH] = `${url.hostname}${url.pathname}`;
    properties[EventColumnIds.QUERY_PARAMS] = AnalyticsUtils.getQueryParamsAsJson(url.search);

    if (referrerUrl ?? window.document.referrer) {
      const referrer = new URL(referrerUrl ?? window.document.referrer);
      properties[EventColumnIds.REFERRER_HOST] = referrer.host;
      properties[EventColumnIds.REFERRER] = referrer.href;
      properties[EventColumnIds.REFERRER_SEARCH_ENGINE] = AnalyticsUtils.getSearchEngine(referrer.href);
      properties[EventColumnIds.SEARCH_ENGINE_KEYWORD] = AnalyticsUtils.getSearchKeyword(referrer.href);
      properties[EventColumnIds.REFERRER_QUERY_PARAMS] = AnalyticsUtils.getQueryParamsAsJson(referrer.search);
    }
    return properties;
  }

  static buildClientSpecifications(): Properties {
    const devicePlatform = AnalyticsUtils.getDevicePlatform(navigator.userAgent);
    const deviceOS = AnalyticsUtils.getOS(navigator.userAgent);
    const deviceBrowser = AnalyticsUtils.getBrowser(navigator.userAgent);

    const properties: Properties = {};

    properties[EventColumnIds.DEVICE_NAME] = devicePlatform.type;
    properties[EventColumnIds.DEVICE_VERSION] = devicePlatform.model;
    properties[EventColumnIds.OS] = deviceOS.name;
    properties[EventColumnIds.OS_VERSION] = deviceOS.version;

    properties[EventColumnIds.PLATFORM] = deviceBrowser.name;
    properties[EventColumnIds.PLATFORM_VERSION] = deviceBrowser.version;
    // properties[EventColumnIds.BROWSER_VERSION] = deviceBrowser.version;

    // properties[EventColumnIds.BROWSER] = deviceBrowser.name;
    // properties[EventColumnIds.BROWSER_VERSION] = deviceBrowser.version;
    // properties[EventColumnIds.BROWSER_USER_AGENT] = navigator.userAgent || '';
    // properties[EventColumnIds.BROWSER_PREFERRED_LANG] = navigator.language || '';
    // properties[EventColumnIds.BROWSER_LANGUAGES] = JSON.stringify(navigator.languages || []);

    // properties[EventColumnIds.PLATFORM_VENDOR] = devicePlatform.vendor;
    return properties;

  }


  static getQueryParamsAsJson(query: string): string {
    return JSON.stringify(this.getQueryParams(query));
  }

  static getQueryParams(query: string): Properties {
    let params = {} as Properties;

    let result: RegExpExecArray | any;
    while (result = AnalyticsUtils.QUERY_PARAM_REGEXP.exec(query)) {
      if (result) {
        params[result[1]] = result[2];
      }
    }
    return params;
  }

  static getSearchEngine(referrer: string): string {
    if (referrer.search('https?://(.*)google.([^/?]*)') === 0) {
      return SearchEngine.GOOGLE;
    } else if (referrer.search('https?://(.*)bing.com') === 0) {
      return SearchEngine.BING;
    } else if (referrer.search('https?://(.*)yahoo.com') === 0) {
      return SearchEngine.YAHOO;
    } else if (referrer.search('https?://(.*)duckduckgo.com') === 0) {
      return SearchEngine.DUCKDUCKGO;
    } else if (referrer.search('https?://(.*)coccoc.com') === 0) {
      return SearchEngine.COCCOC;
    } else if (referrer.search('https?://(.*)yandex.com') === 0) {
      return SearchEngine.YANINDEX;
    } else {
      return SearchEngine.UNKNOWN;
    }
  }

  static getSearchKeyword(referrer: string): string {
    let searchEngine = this.getSearchEngine(referrer);
    let params = this.getQueryParams(referrer);

    if (searchEngine === SearchEngine.YAHOO) {
      return params['p'] || '';
    } else if (searchEngine === SearchEngine.COCCOC) {
      return params['query'] || '';
    } else if (searchEngine === SearchEngine.YANINDEX) {
      return params['text'] || '';
    } else if (searchEngine != SearchEngine.UNKNOWN) {
      return params['q'] || '';
    } else {
      return params['q'] || '';
    }
  }

  static getOS(userAgent: string): OSInfo {
    let browser = Bowser.getParser(userAgent);
    let os = browser.getOS();
    return new OSInfo(os.name || '', os.version || '', os.versionName || '');
  }

  static getBrowser(userAgent: string): BrowserInfo {
    let browser = Bowser.getParser(userAgent).getBrowser();
    return new BrowserInfo(browser.name || '', browser.version || '');
  }

  static getDevicePlatform(userAgent: string): PlatformInfo {
    let platform = Bowser.getParser(userAgent).getPlatform();
    return new PlatformInfo(platform.type || '', platform.model || '', platform.vendor || '');
  }
}
