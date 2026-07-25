import { useState } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { PageLayout } from '@/shared/ui/PageLayout';
import { PhoneInput } from '@/shared/ui/PhoneInput';
import { telegram } from '@/app/telegram/telegram';
import { customerService } from '@/features/profile/services/customerService';
import { isRealUzPhone } from '@/shared/utils';
import { toast } from '@/shared/store/toastStore';
import { useT, useLangStore, type Lang } from '@/shared/i18n';
import { clsx } from 'clsx';
import { LogOut, User, Phone, Mail, Calendar, Shield, MessageCircle } from 'lucide-react';

const LANGUAGES: Lang[] = ['ru', 'uz'];

export default function ProfilePage() {
  const t = useT();
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  const { customer, logout, isAuthenticated } = useAuthStore();
  const tgUser = telegram.user;
  const [savingPhone, setSavingPhone] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const displayName =
    customer?.firstName
      ? `${customer.firstName} ${customer.lastname ?? ''}`.trim()
      : tgUser?.first_name
      ? `${tgUser.first_name} ${tgUser.last_name ?? ''}`.trim()
      : t('profile.defaultUser');

  const username = customer?.username || tgUser?.username;
  const phone = customer?.phoneNumber;
  const email = customer?.email;

  // Yangi mijoz yaratilganda phoneNumber vaqtincha Telegram username bilan to'ldiriladi —
  // bu haqiqiy telefon emas, shuning uchun uni "saqlangan raqam" sifatida ko'rsatmaymiz.
  const isRealPhone = isRealUzPhone(phone);
  const [phoneDigits, setPhoneDigits] = useState(isRealPhone ? phone!.slice(4) : '');
  const [phoneError, setPhoneError] = useState('');

  const savePhone = async () => {
    if (phoneDigits.length !== 9) {
      setPhoneError(t('cart.phoneIncomplete'));
      telegram.haptic.error();
      return;
    }
    setPhoneError('');
    const formattedPhone = `+998${phoneDigits}`;
    setSavingPhone(true);
    try {
      const updated = await customerService.updatePhone(formattedPhone);
      useAuthStore.getState().setCustomer(updated);
      telegram.haptic.success();
      toast.success(t('profile.phoneSaved'));
      setEditingPhone(false);
    } catch {
      telegram.haptic.error();
      toast.error(t('profile.phoneSaveError'));
    } finally {
      setSavingPhone(false);
    }
  };

  const handleLogout = () => {
    telegram.haptic.warning();
    logout();
  };

  return (
    <PageLayout title={t('profile.title')} showNav>
      <div className="space-y-5 pt-4 pb-6">
        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-di-red to-red-700 flex items-center justify-center shadow-lg shadow-di-red/30">
            {tgUser?.photo_url && !avatarFailed ? (
              <img
                src={tgUser.photo_url}
                alt={displayName}
                width={80}
                height={80}
                onError={() => setAvatarFailed(true)}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-3xl font-black text-white">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
              {displayName}
            </h2>
            {username && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                @{username}
              </p>
            )}
          </div>
        </div>

        {/* Language switcher */}
        <div className="bg-white dark:bg-neutral-900 rounded-card shadow-sm px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('profile.language')}
          </span>
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-el p-1">
            {LANGUAGES.map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={clsx(
                  'px-4 min-h-[36px] rounded-el text-xs font-bold uppercase transition-colors',
                  lang === l
                    ? 'bg-di-red text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400',
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Info cards */}
        <div className="bg-white dark:bg-neutral-900 rounded-card shadow-sm overflow-hidden">
          {isRealPhone && !editingPhone ? (
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-100 dark:border-neutral-800">
              <div className="text-neutral-500 dark:text-neutral-400">
                <Phone className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{t('profile.phone')}</p>
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">{phone}</p>
              </div>
              <button
                onClick={() => setEditingPhone(true)}
                className="text-xs font-bold text-di-red active:scale-95 transition-all px-2 min-h-[44px] flex-shrink-0"
              >
                {t('profile.change')}
              </button>
            </div>
          ) : (
            <div className="px-4 py-5 space-y-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                <Phone className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">{t('profile.phoneNumberLabel')}</span>
              </div>
              <div className="flex gap-2 items-start">
                <div className="flex-1">
                  <PhoneInput
                    id="phone-input"
                    value={phoneDigits}
                    onChange={(digits) => {
                      setPhoneDigits(digits);
                      if (phoneError) setPhoneError('');
                    }}
                    error={phoneError}
                  />
                </div>
                <button
                  disabled={savingPhone}
                  onClick={savePhone}
                  className="px-4 min-h-[44px] rounded-el bg-di-red text-white text-xs font-bold active:scale-95 transition-all disabled:opacity-50"
                >
                  {savingPhone ? '...' : t('profile.save')}
                </button>
                {isRealPhone && (
                  <button
                    disabled={savingPhone}
                    onClick={() => setEditingPhone(false)}
                    className="px-3 min-h-[44px] rounded-el bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-xs font-bold active:scale-95 transition-all"
                  >
                    {t('profile.cancel')}
                  </button>
                )}
              </div>

              <div className="pt-1">
                <button
                  onClick={() => {
                    telegram.haptic.medium();
                    telegram.app?.requestContact((sent) => {
                      if (sent) {
                        telegram.showAlert(t('profile.contactSentAlert'));
                      }
                    });
                  }}
                  className="w-full py-3 min-h-[44px] rounded-el bg-[#229ED9]/10 text-[#229ED9] text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all border border-[#229ED9]/20"
                >
                  <MessageCircle className="w-4 h-4" />
                  {t('profile.sendFromTelegram')}
                </button>
              </div>
              <p className="text-caption text-neutral-500 dark:text-neutral-400 text-center px-2">
                {t('profile.phoneHint')}
              </p>
            </div>
          )}
          {email && (
            <InfoRow icon={<Mail className="w-4 h-4" />} label={t('profile.email')} value={email} />
          )}
          {customer?.birthDate && (
            <InfoRow
              icon={<Calendar className="w-4 h-4" />}
              label={t('profile.birthDate')}
              value={new Date(customer.birthDate).toLocaleDateString(lang === 'uz' ? 'uz-UZ' : 'ru-RU')}
              last
            />
          )}
        </div>

        {/* Telegram info */}
        {telegram.isInTelegram && (
          <div className="bg-white dark:bg-neutral-900 rounded-card shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-[#0088cc]/10 border-b border-neutral-100 dark:border-neutral-800">
              <p className="text-xs font-semibold text-[#0088cc] uppercase tracking-wider">
                {t('profile.telegramSection')}
              </p>
            </div>
            <InfoRow
              icon={<Shield className="w-4 h-4" />}
              label={t('profile.telegramId')}
              value={String(tgUser?.id ?? '—')}
              last
            />
          </div>
        )}

        {/* Logout */}
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-4 min-h-[44px] rounded-card bg-red-50 dark:bg-red-900/20 text-di-red font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            {t('profile.logout')}
          </button>
        )}

        {!isAuthenticated && (
          <div className="bg-neutral-50 dark:bg-neutral-900 rounded-card p-6 text-center space-y-3">
            <User className="w-12 h-12 text-neutral-400 mx-auto" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {t('profile.notAuthenticated')}
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

function InfoRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 ${
        !last ? 'border-b border-neutral-100 dark:border-neutral-800' : ''
      }`}
    >
      <div className="text-neutral-500 dark:text-neutral-400">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
          {value}
        </p>
      </div>
    </div>
  );
}
