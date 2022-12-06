import {Properties} from './properties';

export enum DiCustomerGender {
  Other = -1,
  Female = 0,
  Male = 1
}

export interface CustomerProperties extends Properties {
  di_customer_id?: string
  di_customer_first_name?: string
  di_customer_last_name?: string
  di_customer_phone_number?: string
  di_customer_email?: string
  di_customer_avatar_url?: string
  di_customer_dob?: number
  di_customer_gender?: DiCustomerGender
}
