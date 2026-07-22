import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ShieldCheck, MessageCircle } from 'lucide-react';
import { PageLayout } from '@/shared/ui/PageLayout';
import { telegram } from '@/app/telegram/telegram';
import { useLoginWithOTP, useSendOTP, useTelegramAuth } from '@/features/auth/hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');

  const sendOtpMutation = useSendOTP();
  const loginMutation = useLoginWithOTP();

  const handleSendOTP = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (phoneNumber.length < 9) return;
    
    // Format: +998XXXXXXXXX
    const fullPhone = phoneNumber.startsWith('+') ? phoneNumber : `+998${phoneNumber}`;
    
    sendOtpMutation.mutate(fullPhone, {
      onSuccess: () => {
        setStep('otp');
        telegram.haptic.success();
      },
    });
  };

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (otp.length < 4) return;

    const fullPhone = phoneNumber.startsWith('+') ? phoneNumber : `+998${phoneNumber}`;
    
    loginMutation.mutate({ phoneNumber: fullPhone, otp }, {
      onSuccess: () => {
        navigate(from, { replace: true });
      },
    });
  };

  const { mutate: telegramAuth, isPending: isTgPending } = useTelegramAuth();

  const handleTelegramContact = () => {
    telegram.haptic.medium();
    if (telegram.isInTelegram) {
      telegramAuth(undefined, {
        onSuccess: () => {
          navigate(from, { replace: true });
        },
      });
    } else {
      // Fallback or alert if not in Telegram
      alert('Пожалуйста, откройте приложение через Telegram бот @taklifnomachi_bot');
    }
  };

  return (
    <PageLayout showNav={false} noPadding>
      <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950 px-6 pt-20 pb-10">
        {/* Header Icon */}
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-di-red to-red-700 flex items-center justify-center shadow-2xl shadow-di-red/30 mb-6 rotate-3">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight mb-2 uppercase">
            Вход в аккаунт
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium max-w-[240px]">
            {step === 'phone' 
              ? 'Введите ваш номер телефона для входа в Muhlat Savdo' 
              : `Мы отправили код подтверждения на номер ${phoneNumber}`}
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 max-w-sm mx-auto w-full">
          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-neutral-400 group-focus-within:text-di-red transition-colors">
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">+998</span>
                  <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800" />
                </div>
                <input
                  type="tel"
                  placeholder="00 000 00 00"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  className="w-full pl-20 pr-4 h-16 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border-2 border-transparent focus:border-di-red focus:bg-white dark:focus:bg-neutral-950 transition-all outline-none text-lg font-bold tracking-wider text-neutral-900 dark:text-white"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={phoneNumber.length < 9 || sendOtpMutation.isPending}
                className="w-full h-16 rounded-2xl bg-di-red text-white font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-di-red/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
              >
                {sendOtpMutation.isPending ? (
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Получить код
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-100 dark:border-neutral-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white dark:bg-neutral-950 text-neutral-400 font-bold uppercase tracking-widest">или</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTelegramContact}
                disabled={isTgPending}
                className="w-full h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isTgPending ? (
                  <div className="w-6 h-6 border-3 border-di-red border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5 text-[#229ED9]" />
                    Войти через Telegram
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="relative group">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full px-4 h-16 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border-2 border-transparent focus:border-di-red focus:bg-white dark:focus:bg-neutral-950 transition-all outline-none text-3xl font-black text-center tracking-[1em] text-neutral-900 dark:text-white"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={otp.length < 4 || loginMutation.isPending}
                className="w-full h-16 rounded-2xl bg-di-red text-white font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-di-red/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
              >
                {loginMutation.isPending ? (
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Подтвердить
                    <ShieldCheck className="w-5 h-5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full py-4 text-xs text-neutral-500 font-bold uppercase tracking-widest hover:text-di-red transition-colors"
              >
                Изменить номер
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto text-center space-y-4">
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 leading-relaxed max-w-[280px] mx-auto uppercase tracking-wider font-bold">
            Продолжая, вы соглашаетесь с условиями оферты и политикой конфиденциальности Muhlat Savdo
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
