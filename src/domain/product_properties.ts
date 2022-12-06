import {Properties} from './properties';

export interface ProductProperties extends Properties {
  di_product_id?: string;
  di_product_name?: string;
  di_product_price?: number;
  di_product_category?: string;
}

