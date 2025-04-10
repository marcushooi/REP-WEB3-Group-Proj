import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';

interface HeaderProps {
  onCartClick: () => void;
}

export default function Header({ onCartClick }: HeaderProps) {
  const { cartItems } = useCart();
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-800">
          Dyson Store
        </Link>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onCartClick}
            className="relative p-2 text-gray-800 hover:text-gray-600"
          >
            🛒 Cart ({totalItems})
          </button>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
} 