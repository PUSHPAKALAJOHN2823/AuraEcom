import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { addToCart } from '../redux/cartSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const imageUrl =
    product?.image && Array.isArray(product.image) && product.image.length > 0
      ? typeof product.image[0] === 'string'
        ? product.image[0]
        : product.image[0]?.url || '/placeholder.jpg'
      : '/placeholder.jpg';

  const productName = product?.name || 'Unnamed Product';
  const productPrice = product?.price ? product.price.toFixed(2) : '0.00';
  const productId = product?._id || 'unknown';

  console.log('ProductCard Product:', product);
  console.log('Image URL:', imageUrl);
  console.log('Navigating to:', `/products/product/${productId}`); // Debug log

  return (
    <div className="bg-white shadow-md rounded-lg p-4 hover:shadow-xl transition transform hover:-translate-y-1">
      <Link to={`/products/product/${productId}`} className="block">
        <img
          src={imageUrl}
          alt={productName}
          className="w-full h-48 object-cover rounded-md mb-3"
          onError={(e) => {
            e.target.src = '/placeholder.jpg';
            console.log(`Image failed to load for ${productName}: ${imageUrl}`);
          }}
        />
        <h3 className="text-lg font-semibold text-neutral truncate">{productName}</h3>
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < Math.round(product.ratings || 0) ? 'fill-current' : 'text-gray-300'}`}
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.5 3 1.5-5.5L2 7.5l5.5-.5L10 2l2.5 5 5.5.5-4 4 1.5 5.5z" />
              </svg>
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">({product.numberOfReviews || 0})</span>
        </div>
        <p className="text-accent font-semibold mb-3">${productPrice}</p>
      </Link>
      <button
        onClick={() => dispatch(addToCart({ ...product, id: productId }))}
        className={`w-full py-2 rounded-md text-white font-medium ${
          product.stock === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-secondary'
        }`}
        disabled={product.stock === 0}
      >
        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  );
};

export default ProductCard;