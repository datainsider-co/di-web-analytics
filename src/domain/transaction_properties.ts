import {EventProperties} from './event_properties';

export interface TransactionProperties extends EventProperties {
  di_transaction_id?: string;
  di_product_id?: string;
  di_customer_id?: string;
  di_total_price?: number;
  di_transaction_status?: string;
  di_quantity?: number;
  di_product_price?: number;
}
