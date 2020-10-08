import Bowser from 'bowser';
import { Properties } from '../dist/domain/properties';

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
  static readonly SE_GOOGLE = 'google';
  static readonly SE_BING = 'bing';
  static readonly SE_YAHOO = 'yahoo';
  static readonly SE_DUCKDUCKGO = 'duckduckgo';
  static readonly SE_COCCOC = 'coccoc';
  static readonly SE_YANINDEX = 'yandex';
  static readonly SE_UNKNOWN = '';

  static readonly QUERY_PARAM_REGEXP = new RegExp('[\\?&]?(\\w+)=([^&#]*)', 'g');

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
      return AnalyticsUtils.SE_GOOGLE;
    } else if (referrer.search('https?://(.*)bing.com') === 0) {
      return AnalyticsUtils.SE_BING;
    } else if (referrer.search('https?://(.*)yahoo.com') === 0) {
      return AnalyticsUtils.SE_YAHOO;
    } else if (referrer.search('https?://(.*)duckduckgo.com') === 0) {
      return AnalyticsUtils.SE_DUCKDUCKGO;
    } else if (referrer.search('https?://(.*)coccoc.com') === 0) {
      return AnalyticsUtils.SE_COCCOC;
    } else if (referrer.search('https?://(.*)yandex.com') === 0) {
      return AnalyticsUtils.SE_YANINDEX;
    } else {
      return AnalyticsUtils.SE_UNKNOWN;
    }
  }

  static getSearchKeyword(referrer: string): string {
    let searchEngine = this.getSearchEngine(referrer);
    let params = this.getQueryParams(referrer);

    if (searchEngine === this.SE_YAHOO) {
      return params['p'] || '';
    } else if (searchEngine === this.SE_COCCOC) {
      return params['query'] || '';
    } else if (searchEngine === this.SE_YANINDEX) {
      return params['text'] || '';
    } else if (searchEngine != this.SE_UNKNOWN) {
      return params['q'] || '';
    } else {
      return '';
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
