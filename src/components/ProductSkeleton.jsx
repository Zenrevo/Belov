import Skeleton from './Skeleton';

const ProductSkeleton = () => {
  return (
    <div className="product-card">
      <div className="product-image-container">
        <Skeleton type="rect" height="100%" borderRadius="var(--radius-xl)" />
      </div>
      <div className="product-info mt-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 mr-4">
            <Skeleton type="text" width="40%" height="0.7rem" className="mb-2" />
            <Skeleton type="text" width="80%" height="1.1rem" />
          </div>
          <Skeleton type="text" width="60px" height="1.1rem" />
        </div>
        <div className="flex gap-2 mt-3">
          <Skeleton type="text" width="40px" height="1.5rem" borderRadius="var(--radius-full)" />
          <Skeleton type="text" width="40px" height="1.5rem" borderRadius="var(--radius-full)" />
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
