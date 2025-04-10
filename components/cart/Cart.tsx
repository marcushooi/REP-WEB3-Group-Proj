import { useCart } from '../../context/CartContext';
import Link from 'next/link';
import { useState } from 'react';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const { cartItems, removeFromCart } = useCart();

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Your Cart</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-600 hover:text-gray-800"
        >
          ✕
        </button>
      </div>
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center border-b pb-2"
          >
            <div>
              <h3 className="text-gray-800 font-medium">{item.name}</h3>
              <p className="text-gray-600">
                ${item.price.toFixed(2)} × {item.quantity}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeFromCart(item.id)}
              className="text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold text-gray-800">Total:</span>
          <span className="text-lg font-bold text-gray-800">
            ${totalPrice.toFixed(2)}
          </span>
        </div>
        <Link
          href="/checkout"
          className="block w-full bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
} 