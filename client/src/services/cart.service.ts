import api from "./api";
export interface CartResponse {
  success: boolean;
  cart: {
    _id: string;
    userId: string;
    items: Array<{
      productId: string;
      name: string;
      price: number;
      quantity: number;
      unit: string;
      image?: string;
    }>;
    createdAt?: string;
    updatedAt?: string;
  };
  message?: string;
}
export interface AddToCartInput {
  productId: string;
  quantity: number;
}
export interface UpdateCartItemInput {
  quantity: number;
}
export const cartService = {
  getCart: async (): Promise<CartResponse["cart"]> => {
    const response = await api.get<CartResponse>("/cart");
    return response.data.cart;
  },
  addToCart: async (data: AddToCartInput): Promise<CartResponse> => {
    const response = await api.post<CartResponse>("/cart/add", data);
    return response.data;
  },
  updateCartItem: async (
    productId: string,
    data: UpdateCartItemInput
  ): Promise<CartResponse> => {
    const response = await api.put<CartResponse>(
      `/cart/items/${productId}`,
      data
    );
    return response.data;
  },
  removeFromCart: async (productId: string): Promise<CartResponse> => {
    const response = await api.delete<CartResponse>(
      `/cart/items/${productId}`
    );
    return response.data;
  },
  clearCart: async (): Promise<CartResponse> => {
    const response = await api.delete<CartResponse>("/cart/clear");
    return response.data;
  },
};
