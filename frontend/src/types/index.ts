export interface User {
  id: number;
  name: string;
  email: string;
  role: 'client' | 'business' | 'rider';
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  available: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: number;
  client_id: number;
  rider_id?: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'on_the_way' | 'delivered' | 'cancelled';
  delivery_address: string;
  payment_method: string;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  name: string;
}

export interface RiderLocation {
  orderId: number;
  lat: number;
  lng: number;
}
