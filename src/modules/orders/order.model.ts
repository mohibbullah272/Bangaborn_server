// order.model.ts
import mongoose, { Schema } from 'mongoose';
import { IOrder } from './order.interface';

const orderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  size: String,
  color: String,
  quantity: { type: Number, required: true, min: 1 },
  image: String,
});

const orderSchema: Schema<IOrder> = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
    
    },
    shippingInfo: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      isInsideDhaka: { type: Boolean, required: true },
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(v: any[]) => v.length > 0, 'Order must contain at least one item'],
    },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryCharge: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes for fast queries (very common in BD e-commerce)
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1, isActive: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model<IOrder>('Order', orderSchema);

export default Order;