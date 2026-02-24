// order.service.ts
import mongoose from 'mongoose';
import Order from './order.model';

import { IOrder, ICreateOrder, OrderQuery } from './order.interface';
import Product from '../products/product.model';

const generateOrderNumber = (): string => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(10000 + Math.random() * 90000);
  return `ORD-${date}-${random}`;
};

export const createOrder = async (data: ICreateOrder): Promise<IOrder> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (data.items.length === 0) throw new Error('Order must have at least one item');

    const orderItems: any[] = [];
    let subtotal = 0;

    for (const item of data.items) {
      const product = await Product.findById(item.productId).session(session);

      if (!product || !product.isActive) {
        throw new Error(`Product not found or inactive: ${item.productId}`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
      if (item.size && !product.sizes.includes(item.size)) {
        throw new Error(`Size ${item.size} not available for ${product.name}`);
      }
      if (item.color && !product.colors.includes(item.color)) {
        throw new Error(`Color ${item.color} not available for ${product.name}`);
      }

      const finalPrice = product.discountPrice && product.discountPrice < product.price
        ? product.discountPrice
        : product.price;

      orderItems.push({
        productId: product._id,
        name: product.name,
        slug: product.slug,
        price: finalPrice,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        image: product.images[0],
      });

      subtotal += finalPrice * item.quantity;

      // Reserve stock (atomic)
      await Product.findByIdAndUpdate(
        product._id,
        { $inc: { stock: -item.quantity } },
        {$inc:{sold: item.quantity}}
   
      );
    }

    const deliveryCharge = data.shippingInfo.isInsideDhaka ? 70 : 120;
    const total = subtotal + deliveryCharge;

    const newOrder = new Order({
      orderNumber: generateOrderNumber(),
      shippingInfo: data.shippingInfo,
      items: orderItems,
      subtotal,
      deliveryCharge,
      total,
      status: 'Pending',
      isActive: true,
    });

    await newOrder.save({ session });
    await session.commitTransaction();

    return newOrder;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getAllOrders = async (query: OrderQuery = {}) => {
  const { page = '1', limit = '20', status } = query;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Math.min(100, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const filter: any = { isActive: true };
  if (status) filter.status = status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

export const getOrderById = async (id: string): Promise<IOrder | null> => {

  
  return await Order.findById(id);
};

export const cancelOrder = async (id: string): Promise<IOrder> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(id).session(session);
    if (!order) throw new Error('Order not found');
    if (order.status !== 'Pending') throw new Error('Only Pending orders can be cancelled');
    if (!order.isActive) throw new Error('Order already cancelled');

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } },
        { session }
      );
    }

    order.status = 'Cancelled';
    order.isActive = false;
    await order.save({ session });

    await session.commitTransaction();
    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};