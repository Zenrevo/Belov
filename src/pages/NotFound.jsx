import { Link } from 'react-router-dom';
import { Home as HomeIcon, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        textAlign: 'center',
        padding: 'var(--space-8)',
        gap: 'var(--space-6)',
      }}
    >
      <img
        src="/full-logo.png"
        alt="BELOV"
        style={{ height: '3.5rem', opacity: 0.6, marginBottom: 'var(--space-4)' }}
      />
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(4rem, 15vw, 8rem)',
          fontWeight: 300,
          color: 'var(--on-surface-variant)',
          lineHeight: 1,
        }}
      >
        404
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
          fontWeight: 500,
          color: 'var(--on-surface)',
          fontStyle: 'italic',
        }}
      >
        This page doesn't exist yet.
      </p>
      <p
        style={{
          fontSize: '0.95rem',
          color: 'var(--on-surface-variant)',
          maxWidth: '400px',
          lineHeight: 1.6,
        }}
      >
        The page you're looking for may have moved or hasn't been created.
        Let's get you back on track.
      </p>
      <Link
        to="/"
        className="btn btn-luxury-primary btn-lg"
        style={{ marginTop: 'var(--space-4)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
      >
        <ArrowLeft size={18} /> Back to Home
      </Link>
    </section>
  );
};

export default NotFound;
