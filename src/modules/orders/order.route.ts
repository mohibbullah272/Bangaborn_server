// order.route.ts
import { Router, Request, Response } from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  cancelOrder,
} from './order.service';
import { ICreateOrder, OrderQuery } from './order.interface';

const router = Router();

// POST /api/orders
router.post('/', async (req: Request<{}, {}, ICreateOrder>, res: Response) => {
  try {
    const order = await createOrder(req.body);
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/orders
router.get('/', async (req: Request<{}, {}, {}, OrderQuery>, res: Response) => {
  try {
    const result = await getAllOrders(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const order = await getOrderById(req.params.id as string);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/orders/:id  →  Cancels order + restores stock (industry standard)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const order = await cancelOrder(req.params.id as string);
    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully. Stock restored.',
      order,
    });
  } catch (error: any) {
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
});

export  const orderRouter = router