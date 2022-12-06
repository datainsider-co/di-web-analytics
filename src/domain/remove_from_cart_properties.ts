import {Properties} from './properties';

export interface RemoveFromCartProperties extends Properties {
  cart_id: string;
  product_id: string;
  product_price: number;
  product_quantity: number;
}
