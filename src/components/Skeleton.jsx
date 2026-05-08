import './Skeleton.css';

const Skeleton = ({ type = 'text', width, height, borderRadius, className = '' }) => {
  const style = {
    width: width || '100%',
    height: height || (type === 'text' ? '1rem' : '100%'),
    borderRadius: borderRadius || (type === 'circle' ? '50%' : 'var(--radius-md)')
  };

  return (
    <div 
      className={`skeleton skeleton-${type} ${className}`} 
      style={style}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
