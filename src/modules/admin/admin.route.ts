import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Admin from './admin.model';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'bangaborn-admin-secret-change-in-prod';
const JWT_EXPIRES = '7d';

// POST /api/admin/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id, email: admin.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES,
    });

    res.status(200).json({
      success: true,
      token,
      admin: { _id: admin._id, email: admin.email },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Login failed';
    res.status(500).json({ success: false, message });
  }
});

// POST /api/admin/seed  ← run once to create your admin account
router.post('/seed', async (req: Request, res: Response) => {
  try {
    const existing = await Admin.findOne({});
    if (existing) {
      return res.status(409).json({ success: false, message: 'Admin already exists' });
    }
    const { email, password } = req.body as { email: string; password: string };
    const admin = await Admin.create({ email, password });
    res.status(201).json({ success: true, message: 'Admin created', email: admin.email });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Seed failed';
    res.status(400).json({ success: false, message });
  }
});

// GET /api/admin/verify  ← verify JWT token
router.get('/verify', async (req: Request, res: Response) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const token = auth.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    res.status(200).json({ success: true, admin: { email: decoded.email } });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
});

// PATCH /api/orders/:id/status  ← update order status
router.patch('/orders/:id/status', async (req: Request, res: Response) => {
  // Import dynamically to avoid circular deps
  const OrderModel = (await import('../orders/order.model')).default;
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const token = auth.slice(7);
    jwt.verify(token, JWT_SECRET);

    const { status } = req.body as { status: string };
    const order = await OrderModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed';
    res.status(400).json({ success: false, message });
  }
});

export const adminRoute = router;