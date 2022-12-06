import {ProductProperties} from './product_properties';

export interface ProductPurchaseProperties extends ProductProperties {
  di_transaction_id?: string;
  di_customer_id?: string;
  di_quantity?: number;

}
