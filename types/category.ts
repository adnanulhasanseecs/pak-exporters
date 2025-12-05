/**
 * Category type definitions
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: string;
  children?: Category[];
  productCount: number;
  level: number;
  order: number;
}

export interface CategoryTree {
  categories: Category[];
  total: number;
}

