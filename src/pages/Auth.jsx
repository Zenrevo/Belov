import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Phone, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import './Auth.css';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState(initialMode);
  const [channel, setChannel] = useState('email');
  const [destination, setDestination] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [step, setStep] = useState('request');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { requestOtp, verifyOtp } = useAuth();

  const payload = useMemo(() => ({
    channel,
    purpose: mode,
    ...(channel === 'email' ? { email: destination } : { phone: destination })
  }), [channel, destination, mode]);

  const handleRequestOtp = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await requestOtp(payload);
      setDevOtp(response.devOtp || '');
      setStep('verify');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyOtp({ ...payload, otp, name: mode === 'register' ? name : undefined });
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-shell container">
        <div className="auth-story">
          <Link to="/" className="auth-brand">BELOV</Link>
          <span className="label-caps text-accent">Marketplace access</span>
          <h1>{mode === 'register' ? 'Create your fit passport.' : 'Login to your fit passport.'}</h1>
          <p>Use email OTP or mobile OTP. Your profile then powers brand ranking, cart, checkout, recommendations, and orders.</p>
          <div className="auth-proof-grid">
            <span><ShieldCheck size={16} /> Signed API token</span>
            <span><Mail size={16} /> Email OTP</span>
            <span><Phone size={16} /> Mobile OTP</span>
          </div>
        </div>

        <form className="auth-card" onSubmit={step === 'request' ? handleRequestOtp : handleVerifyOtp}>
          <div className="auth-mode-toggle">
            <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
            <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
          </div>

          <div className="auth-channel-toggle">
            <button type="button" className={channel === 'email' ? 'active' : ''} onClick={() => setChannel('email')}>
              <Mail size={16} /> Email
            </button>
            <button type="button" className={channel === 'phone' ? 'active' : ''} onClick={() => setChannel('phone')}>
              <Phone size={16} /> Mobile
            </button>
          </div>

          {mode === 'register' && (
            <label className="auth-field">
              Name
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
            </label>
          )}

          <label className="auth-field">
            {channel === 'email' ? 'Email address' : 'Mobile number'}
            <input
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              placeholder={channel === 'email' ? 'you@email.com' : '+91 98765 43210'}
              type={channel === 'email' ? 'email' : 'tel'}
              required
            />
          </label>

          {step === 'verify' && (
            <label className="auth-field">
              OTP
              <input value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="6 digit OTP" required />
            </label>
          )}

          {devOtp && (
            <div className="auth-dev-otp">
              Local dev OTP: <strong>{devOtp}</strong>
            </div>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button className="btn btn-luxury-primary w-full" disabled={loading}>
            {loading ? 'Please wait...' : step === 'request' ? 'Send OTP' : 'Verify and continue'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default Auth;
