import { useEffect, useState } from 'react';
import { pageTaglines } from '../data/experienceCopy';
import './PageTagline.css';

const PageTagline = ({ page, align = 'center', compact = false }) => {
  const copy = pageTaglines[page] || pageTaglines.collections;
  const [index, setIndex] = useState(0);
  const frame = copy.frames[index];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % copy.frames.length);
    }, 4200);

    return () => clearInterval(timer);
  }, [copy.frames.length]);

  return (
    <div className={`page-tagline page-tagline-${align} ${compact ? 'compact' : ''}`}>
      <span className="page-tagline-eyebrow">{copy.eyebrow}</span>
      <h2 key={`${page}-${index}-title`} className="page-tagline-title">
        {frame.title}
      </h2>
      <p key={`${page}-${index}-body`} className="page-tagline-body">
        {frame.body}
      </p>
      <div className="page-tagline-dots" aria-hidden="true">
        {copy.frames.map((_, dotIndex) => (
          <span key={dotIndex} className={dotIndex === index ? 'active' : ''} />
        ))}
      </div>
    </div>
  );
};

export default PageTagline;
