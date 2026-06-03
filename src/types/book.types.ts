// src/types/book.types.ts

export interface Book {
  id: number;
  title: string;
  writer: string;
  active: number;
  teacher_id: number;
  teacher?: {
    id: number;
    name: string;
    email: string;
  };
  price: string;
  pages_count: number;
  imageUrl: string;
  image: {
    id: number;
    name: string;
    fullUrl: string;
    previewUrl: string;
  };
  createdAt: string;
}

export interface CreateBookRequest {
  title: string;
  writer: string;
  teacher_id: number;
  price: number;
  pages_count: number;
  image?: number;
}

export interface GetAllBooksParams {
  page?: number;
  perPage?: number;
  search?: string;
  teacher_id?: number;
  active?: boolean;
  writer?: string;

  price?: number; // 👈 بس كده
  from_date?: string;
  to_date?: string;
}