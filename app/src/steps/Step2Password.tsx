import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../store/authStore';
import gsap from 'gsap';

export default function Step2Password() {
  const { goToStep, updateData, goBack, data, setError, error } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const stepRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (stepRef.current) {
      gsap.fromTo(
        stepRef.current,
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const validate = (value: string): boolean => {
    if (!value.trim()) {
      setLocalError('Enter your password');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setError(null);

    if (!validate(password)) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    updateData({ password });
    setIsLoading(false);

    if (stepRef.current) {
      gsap.to(stepRef.current, {
        opacity: 0,
        x: -30,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => goToStep('step3-phone'),
      });
    }
  };

  const handleBack = () => {
    if (stepRef.current) {
      gsap.to(stepRef.current, {
        opacity: 0,
        x: 30,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => goBack(),
      });
    }
  };

  return (
    <div ref={stepRef}>
      <button className="back-btn" onClick={handleBack} type="button" aria-label="Go back">
        &#8249;
      </button>

      <h1 className="step-heading" style={{ paddingTop: 8 }}>
        Hi {data.firstName || 'there'}, please enter your password
      </h1>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label className="amazon-label" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`amazon-input ${localError || error ? 'error' : ''}`}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setLocalError('');
                setError(null);
              }}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#565959] hover:text-[#0F1111] text-xs"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {(localError || error) && (
            <p className="error-text">{localError || error}</p>
          )}
        </div>
        <button type="submit" className="btn-amazon" disabled={isLoading}>
          {isLoading ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Continue'}
        </button>
      </form>

      <div className="mt-3">
        <a href="#" className="amazon-link text-[12px]" onClick={(e) => e.preventDefault()}>
          Forgot your password?
        </a>
      </div>
    </div>
  );
}
