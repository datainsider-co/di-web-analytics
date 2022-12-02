import {EventProperties} from './event_properties';

export interface SearchProperties extends EventProperties {
  search_text?: string;
  url?: string;
  category_detect?: string;
  promo_detect?: string;
  result_url?: string;
}
