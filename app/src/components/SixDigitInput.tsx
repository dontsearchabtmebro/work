import { useRef, useEffect, useCallback, type KeyboardEvent, type ClipboardEvent } from 'react';

interface SixDigitInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function SixDigitInput({ value, onChange, disabled }: SixDigitInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sync external value with inputs
  useEffect(() => {
    inputRefs.current.forEach((input, i) => {
      if (input) {
        input.value = value[i] || '';
      }
    });
  }, [value]);

  const handleInput = useCallback(
    (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const inputVal = e.target.value.replace(/\D/g, '').slice(0, 1);
      e.target.value = inputVal;

      const newValue = value.split('');
      newValue[index] = inputVal;
      const result = newValue.join('').slice(0, 6);
      onChange(result);

      // Auto-move to next
      if (inputVal && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [value, onChange]
  );

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        const input = inputRefs.current[index];
        if (input && !input.value && index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
      }
    },
    []
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
      if (pasted) {
        onChange(pasted);
        // Focus the next empty input or last one
        const focusIndex = Math.min(pasted.length, 5);
        setTimeout(() => inputRefs.current[focusIndex]?.focus(), 0);
      }
    },
    [onChange]
  );

  return (
    <div
      ref={containerRef}
      className="flex gap-2 justify-center"
      onPaste={handlePaste}
    >
      {Array.from({ length: 6 }, (_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          className="six-digit-box"
          onInput={(e) => handleInput(i, e as unknown as React.ChangeEvent<HTMLInputElement>)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          autoComplete="off"
        />
      ))}
    </div>
  );
}
