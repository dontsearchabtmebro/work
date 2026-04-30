import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../store/authStore';
import gsap from 'gsap';
import SixDigitInput from '../components/SixDigitInput';

export default function Step4Wallet() {
  const { goToStep, updateData, goBack, setError, error } = useAuth();
  const [passcode, setPasscode] = useState('');
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
    if (value.length !== 6) {
      setLocalError('Enter all 6 digits of your wallet passcode');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setError(null);

    if (!validate(passcode)) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    updateData({ walletPasscode: passcode });
    setIsLoading(false);

    if (stepRef.current) {
      gsap.to(stepRef.current, {
        opacity: 0,
        x: -30,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => goToStep('step5-govid'),
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
        Enter your 6-digit wallet passcode
      </h1>
      <p className="step-subtext">
        This passcode is used for secure transactions within the warehouse system. it's normally created when you made your wallet
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <SixDigitInput
            value={passcode}
            onChange={(val) => {
              setPasscode(val);
              setLocalError('');
              setError(null);
            }}
            disabled={isLoading}
          />
          {(localError || error) && (
            <p className="error-text text-center mt-2">{localError || error}</p>
          )}
        </div>
        <button type="submit" className="btn-amazon" disabled={isLoading}>
          {isLoading ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Continue'}
        </button>
      </form>
    </div>
  );
}
