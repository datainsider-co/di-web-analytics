import {Properties} from './properties';

export interface EventProperties extends Properties {
  di_timestamp?: number;
  di_event_name?: string;
  di_start_time?: number;
  di_duration?: number;
  di_customer_id?: string;
  di_session_id?: string;
  di_screen_name?: string;
  device_name?: string;
  device_version?: string;
  os_name?: string;
  os_version?: string;
  platform_name?: string;
  platform_version?: string;
  app_name?: string;
  app_version?: string;
  di_url?: string;
  di_path?: string;
  di_url_params?: string;
  di_referrer?: string;
  di_referrer_host?: string;
  di_referrer_params?: string;
  di_referrer_search_engine?: string;
  di_referrer_search_keyword?: string;
  di_referrer_query_params?: string;
  di_event_id?: string;
  di_client_host?: string;
  di_client_ip?: string;
  di_client_path?: string;
  di_client_params?: string;
  utm_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}
