import {Properties} from './properties';

export interface AddToCartProperties extends Properties {
  cart_id: string;
  product_id: string;
  product_price: number;
  product_discount?: number;

}
