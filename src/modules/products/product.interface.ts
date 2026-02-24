// product.interface.ts
import { Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  gender: 'Men' | 'Women' | 'Kids' | 'Unisex';
  material?: string;
  sizes: string[];
  colors: string[];
  images: string[];
  stock: number;
  sold: number;
  rating: number;
  numReviews: number;
  isFeatured: boolean;
  isActive: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateProduct {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  gender: 'Men' | 'Women' | 'Kids' | 'Unisex';
  material?: string;
  sizes: string[];
  colors: string[];
  images: string[];
  stock: number;
  isFeatured?: boolean;
  tags?: string[];
}

export interface IUpdateProduct extends Partial<ICreateProduct> {}

export interface ProductQuery {
  category?: string;
  gender?: string;
  minPrice?: string;
  maxPrice?: string;
  size?: string;
  color?: string;
  search?: string;
  page?: string;
  limit?: string;
  sortBy?: 'createdAt' | 'price' | 'rating' | 'sold' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}