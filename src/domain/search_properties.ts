import {EventProperties} from './event_properties';

export interface SearchProperties extends EventProperties {
  di_search_string?: string;
  di_product_category?: string;
}
