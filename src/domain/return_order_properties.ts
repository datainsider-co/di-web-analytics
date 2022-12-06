import {Properties} from './properties';

export interface ReturnOrderProperties extends Properties {
  checkout_id: string;
  reason: string;
  cart_id?: string;

}
