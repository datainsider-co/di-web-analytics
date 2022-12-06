import {Properties} from './properties';

export interface ViewProductProperties extends Properties {
  product_id: string;
  in_stock: boolean;
  product_price: number;
  product_shipping: string;
  product_name: string;
  currency: string;
  url: string;
  variant_id: string;
  supplier_id: string;
  merchant_id: string;
}
