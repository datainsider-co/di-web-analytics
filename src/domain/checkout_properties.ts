import {Properties} from './properties';

export interface CheckoutProperties extends Properties {
  checkout_id: string;
  cart_id: string;
  checkout_stage: string;
}
