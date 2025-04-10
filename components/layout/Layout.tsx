import Header from './Header';
import Cart from '../cart/Cart';
import { ReactNode, useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onCartClick={toggleCart} />
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <main className="container mx-auto p-4">{children}</main>
    </div>
  );
} 