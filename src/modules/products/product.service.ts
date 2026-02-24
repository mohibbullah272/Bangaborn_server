// product.service.ts
import Product from './product.model';
import { IProduct, ICreateProduct, IUpdateProduct, ProductQuery } from './product.interface';
import mongoose from 'mongoose';
// Pure helper - slug generator (used as fallback)
const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

// CREATE - full business validation
export const createProduct = async (data: ICreateProduct): Promise<IProduct> => {
  // Business rules for clothing store
  if (data.price <= 0) throw new Error('Price must be greater than 0');
  if (data.stock < 0) throw new Error('Stock cannot be negative');
  if (data.discountPrice !== undefined && data.discountPrice >= data.price) {
    throw new Error('Discount price must be lower than regular price');
  }
  if (data.sizes.length === 0) throw new Error('At least one size is required');
  if (data.colors.length === 0) throw new Error('At least one color is required');
  if (data.images.length === 0) throw new Error('At least one image URL is required');

  const productPayload = {
    ...data,
    slug: generateSlug(data.name),
    sold: 0,
    rating: 0,
    numReviews: 0,
    isActive: true,
    isFeatured: data.isFeatured ?? false,
    tags: data.tags ?? [],
  };

  const product = new Product(productPayload);
  return await product.save();
};

// READ ALL - full filtering, pagination, sorting (A-Z business logic)
export const getAllProducts = async (query: ProductQuery = {}) => {
  const {
    category,
    gender,
    minPrice,
    maxPrice,
    size,
    color,
    search,
    page = '1',
    limit = '12',
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Math.min(100, Number(limit))); // cap at 100
  const skip = (pageNum - 1) * limitNum;

  const filter: any = { isActive: true };

  if (category) filter.category = category;
  if (gender) filter.gender = gender;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (size) filter.sizes = { $in: [size] };
  if (color) filter.colors = { $in: [color] };

  if (search) {
    filter.$text = { $search: search }; // uses text index
  }

  // Sorting logic
  let sort: Record<string, 1 | -1> = {};
  const order = sortOrder === 'asc' ? 1 : -1;

  if (sortBy === 'popularity' || sortBy === 'sold') {
    sort = { sold: -1 };
  } else if (sortBy === 'rating') {
    sort = { rating: -1 };
  } else if (sortBy === 'price') {
    sort = { price: order };
  } else {
    sort = { [sortBy]: order };
  }

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limitNum),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

// READ ONE - support both Mongo _id and slug (common UX)
export const getProductByIdentifier = async (identifier: string): Promise<IProduct | null> => {
  let product: IProduct | null = null;

  // Try as ObjectId first
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    product = await Product.findById(identifier);
  }

  // Fallback to slug
  if (!product) {
    product = await Product.findOne({ slug: identifier });
  }

  if (product && !product.isActive) return null;

  return product;
};

// UPDATE - full business validation + slug regeneration
export const updateProduct = async (id: string, data: IUpdateProduct): Promise<IProduct | null> => {
  if (data.price !== undefined && data.price <= 0) throw new Error('Price must be greater than 0');
  if (data.stock !== undefined && data.stock < 0) throw new Error('Stock cannot be negative');
  if (data.discountPrice !== undefined && data.price !== undefined && data.discountPrice >= data.price) {
    throw new Error('Discount price must be lower than regular price');
  }
  if (data.sizes && data.sizes.length === 0) throw new Error('At least one size is required');
  if (data.colors && data.colors.length === 0) throw new Error('At least one color is required');
  if (data.images && data.images.length === 0) throw new Error('At least one image URL is required');

  const updatePayload: any = { ...data };

  // Regenerate slug when name changes
  if (data.name) {
    updatePayload.slug = generateSlug(data.name);
  }

  const updated = await Product.findByIdAndUpdate(
    id,
    { $set: updatePayload },
    { new: true, runValidators: true }
  );

  return updated;
};

// DELETE - SOFT DELETE (best practice for e-commerce)
export const softDeleteProduct = async (id: string): Promise<boolean> => {
  const result = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
  return !!result;
};

// Extra business helpers (very useful for clothing store frontend)
export const getFeaturedProducts = async (limit = 8): Promise<IProduct[]> => {
  return await Product.find({ isActive: true, isFeatured: true })
    .sort({ createdAt: -1 })
    .limit(limit);
};

export const getProductsByCategory = async (category: string, limit = 12): Promise<IProduct[]> => {
  return await Product.find({ category, isActive: true })
    .sort({ createdAt: -1 })
    .limit(limit);
};