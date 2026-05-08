import { fitPromiseItems } from '../data/experienceCopy';
import './FitPromiseStrip.css';

const FitPromiseStrip = ({ compact = false }) => (
  <div className={`fit-promise-strip ${compact ? 'compact' : ''}`}>
    {fitPromiseItems.map((item, index) => (
      <div className="fit-promise-item" key={item.title}>
        <span className="fit-promise-index">{String(index + 1).padStart(2, '0')}</span>
        <div>
          <strong>{item.title}</strong>
          <p>{item.body}</p>
        </div>
      </div>
    ))}
  </div>
);

export default FitPromiseStrip;
