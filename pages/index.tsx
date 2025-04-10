import { Product } from '../types';
import { useCart } from '../context/CartContext';
import Layout from '../components/layout/Layout';

const products: Product[] = [
  {
    id: 1,
    name: 'Dyson Airwrap',
    price: 1.99,
    description: 'High-quality product with amazing features',
    image: '/products/product1.jpg',
  },
  {
    id: 2,
    name: 'Dyson Supersonic 2',
    price: 0.78,
    description: 'Advanced features and premium quality',
    image: '/products/product2.jpg',
  },
];

export default function Home() {
  const { addToCart } = useCart();

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <img
                src={product.image}
                alt={product.name}
                className="object-cover rounded-lg"
              />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {product.name}
            </h2>
            <p className="text-gray-600 mb-4">{product.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">
                ${product.price.toFixed(2)}
              </span>
              <button
                type="button"
                onClick={() => addToCart({ ...product, quantity: 1 })}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
