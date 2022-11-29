import {Properties} from './properties';

export interface TransactionProperties extends Properties {
  diProductId?: string;
  diCustomerId?: string;
  diTotalPrice?: number;
  diTransactionStatus?: string;
  diQuantity?: number;
  diProductPrice?: number;
}
