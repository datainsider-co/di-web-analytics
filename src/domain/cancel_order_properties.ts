import {Properties} from './properties';

export interface CancelOrderProperties extends Properties {
  checkout_id: string;
  reason: string;
  cart_id?: string;

}
