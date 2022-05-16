export enum SystemEvents {
  SCREEN_ENTER = "di_screen_enter",
  SCREEN_EXIT = "di_screen_exit",
  PAGE_VIEW = "di_pageview",
  SESSION_CREATED = "di_session_created",
  SESSION_END = "di_session_end",
  SET_USER = 'di_set_user'
}

export class EventColumnIds {
  static readonly EVENT_ID = "di_event_id"
  static readonly EVENT_NAME = "di_event"
  static readonly EVENT_DISPLAY_NAME = "di_event_display_name"
  static readonly IS_SYSTEM_EVENT = "di_system_event"
  static readonly LIB_PLATFORM = "di_lib_platform"
  static readonly LIB_VERSION = "di_lib_version"
  static readonly TRACKING_ID = "di_tracking_id"
  static readonly SESSION_ID = "di_session_id"
  static readonly USER_ID = "di_user_id"
  static readonly SCREEN_NAME = "di_screen_name"
  static readonly CLIENT_IP = "di_client_ip"
  static readonly URL = "di_url"
  static readonly PATH = "di_path"
  static readonly QUERY_PARAMS = "di_url_params"
  static readonly REFERRER = "di_referrer"
  static readonly REFERRER_HOST = "di_referrer_host"
  static readonly REFERRER_QUERY_PARAMS = "di_referrer_params"
  static readonly REFERRER_SEARCH_ENGINE = "di_referrer_search_engine"
  static readonly SEARCH_ENGINE_KEYWORD = "di_referrer_search_keyword"
  static readonly OS = "di_os"
  static readonly OS_VERSION = "di_os_version"
  static readonly OS_VERSION_NAME = "di_os_version_name"
  static readonly BROWSER = "di_browser"
  static readonly BROWSER_VERSION = "di_browser_version"
  static readonly BROWSER_USER_AGENT = "di_browser_ua"
  static readonly BROWSER_PREFERRED_LANG = "di_browser_preffered_lang"
  static readonly BROWSER_LANGUAGES = "di_browser_languages"
  static readonly PLATFORM = "di_platform"
  static readonly PLATFORM_MODEL = "di_platform_model"
  static readonly PLATFORM_VENDOR = "di_platform_vendor"
  static readonly START_TIME = "di_start_time"
  static readonly DURATION = "di_duration"
  static readonly TIME = "di_time"
  static readonly TIME_MS = "di_time_ms"
}
