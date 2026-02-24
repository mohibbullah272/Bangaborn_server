// order.interface.ts
import { Document, Types } from 'mongoose';

export interface IOrderItem {
  productId: Types.ObjectId;
  name: string;
  slug: string;
  price: number;           // snapshot price at order time (discountPrice or price)
  size?: string;
  color?: string;
  quantity: number;
  image?: string;
}

export interface IShippingInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  isInsideDhaka: boolean;   // determines delivery charge (70 / 120 TK)
}

export interface IOrder extends Document {
  orderNumber: string;
  shippingInfo: IShippingInfo;
  items: IOrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Input from client (NEVER trust prices/stock from frontend)
export interface ICreateOrderItem {
  productId: string;
  size?: string;
  color?: string;
  quantity: number;
}

export interface ICreateOrder {
  shippingInfo: IShippingInfo;
  items: ICreateOrderItem[];
}

export interface OrderQuery {
  page?: string;
  limit?: string;
  status?: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
}