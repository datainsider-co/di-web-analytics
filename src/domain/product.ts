import {Properties} from './properties';

export interface CheckoutProduct {
  product_id: string;
  title: string;
  category: string;
  quantity: number;
  price: number;

  properties?: Properties;
}

export enum Status {
  Complete = 'complete',
  Return = 'return',
  Cancel = 'cancel'
}
