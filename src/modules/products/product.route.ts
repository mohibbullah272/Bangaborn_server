// product.route.ts
import { Router, Request, Response } from 'express';
import {
  createProduct,
  getAllProducts,
  getProductByIdentifier,
  updateProduct,
  softDeleteProduct,
  getFeaturedProducts,
  getProductsByCategory,
} from './product.service';
import { ICreateProduct, IUpdateProduct, ProductQuery } from './product.interface';

const router = Router();

// GET /api/products - full filtered, paginated, sorted list
router.get('/', async (req: Request<{}, {}, {}, ProductQuery>, res: Response) => {
  try {
    const result = await getAllProducts(req.query);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/featured
router.get('/featured', async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 8;
    const products = await getFeaturedProducts(limit);
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/category/:category
router.get('/category/:category', async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 12;
    const products = await getProductsByCategory((req.params.category as string), limit);
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/:id - supports both Mongo _id and slug
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await getProductByIdentifier(req.params.id as string);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/products - create with full validation
router.post('/', async (req: Request<{}, {}, ICreateProduct>, res: Response) => {
  try {
    const product = await createProduct(req.body);
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error: any) {
    const status = error.message.includes('already exists') ? 409 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
});

// PUT /api/products/:id - update with full validation
router.put('/:id', async (req: Request<{ id: string }, {}, IUpdateProduct>, res: Response) => {
  try {
    const product = await updateProduct(req.params.id, req.body);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error: any) {
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
});

// DELETE /api/products/:id - soft delete
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await softDeleteProduct(req.params.id as string);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Product soft-deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export const productRoute = router