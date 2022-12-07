import {Properties} from './properties';

export interface CheckoutProduct {
  product_id: string;
  product_title: string;
  product_category: string;
  quantity: number;
  product_price: number;

  properties?: Properties;
}

export enum Status {
  Complete = 'complete',
  Return = 'return',
  Cancel = 'cancel'
}
