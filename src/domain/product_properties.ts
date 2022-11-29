import {Properties} from './properties';

export interface ProductProperties extends Properties {
  diProductId?: string;
  diProductName?: string;
  diProductPrice?: number;
  diProductCategory?: string;
}
