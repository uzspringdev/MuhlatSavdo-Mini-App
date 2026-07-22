import { useState } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { PageLayout } from '@/shared/ui/PageLayout';
import { telegram } from '@/app/telegram/telegram';
import { customerService } from '@/features/profile/services/customerService';
import { isRealUzPhone } from '@/shared/utils';
import { LogOut, User, Phone, Mail, Calendar, Shield, MessageCircle } from 'lucide-react';

export default function ProfilePage() {
  const { customer, logout, isAuthenticated } = useAuthStore();
  const tgUser = telegram.user;
  const [savingPhone, setSavingPhone] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);

  const displayName =
    customer?.firstName
      ? `${customer.firstName} ${customer.lastname ?? ''}`.trim()
      : tgUser?.first_name
      ? `${tgUser.first_name} ${tgUser.last_name ?? ''}`.trim()
      : 'Пользователь';

  const username = customer?.username || tgUser?.username;
  const phone = customer?.phoneNumber;
  const email = customer?.email;

  // Yangi mijoz yaratilganda phoneNumber vaqtincha Telegram username bilan to'ldiriladi —
  // bu haqiqiy telefon emas, shuning uchun uni "saqlangan raqam" sifatida ko'rsatmaymiz.
  const isRealPhone = isRealUzPhone(phone);
  const phoneDigitsForInput = isRealPhone ? phone!.slice(4) : '';

  const savePhone = async () => {
    const input = document.getElementById('phone-input') as HTMLInputElement;
    const val = input.value.replace(/\D/g, '');
    if (val.length !== 9) {
      telegram.haptic.error();
      return;
    }
    const formattedPhone = `+998${val}`;
    setSavingPhone(true);
    try {
      const updated = await customerService.updatePhone(formattedPhone);
      useAuthStore.getState().setCustomer(updated);
      telegram.haptic.success();
      setEditingPhone(false);
    } catch {
      telegram.haptic.error();
    } finally {
      setSavingPhone(false);
    }
  };

  const handleLogout = () => {
    telegram.haptic.warning();
    logout();
  };

  return (
    <PageLayout title="Профиль" showNav>
      <div className="space-y-5 pt-4 pb-6">
        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-di-red to-red-700 flex items-center justify-center shadow-lg shadow-di-red/30">
            {tgUser?.photo_url ? (
              <img
                src={tgUser.photo_url}
                alt={displayName}
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

        {/* Info cards */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm overflow-hidden">
          {isRealPhone && !editingPhone ? (
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-100 dark:border-neutral-800">
              <div className="text-neutral-400 dark:text-neutral-500">
                <Phone className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Телефон</p>
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">{phone}</p>
              </div>
              <button
                onClick={() => setEditingPhone(true)}
                className="text-xs font-bold text-di-red active:scale-95 transition-all px-2 py-1 flex-shrink-0"
              >
                O'zgartirish
              </button>
            </div>
          ) : (
            <div className="px-4 py-5 space-y-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                <Phone className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Telefon raqam</span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-400">+998</span>
                  <input
                    type="tel"
                    placeholder="00 000 00 00"
                    maxLength={12}
                    defaultValue={phoneDigitsForInput}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 focus:border-di-red outline-none text-sm font-bold transition-all"
                    id="phone-input"
                  />
                </div>
                <button
                  disabled={savingPhone}
                  onClick={savePhone}
                  className="px-4 rounded-xl bg-di-red text-white text-xs font-bold active:scale-95 transition-all disabled:opacity-50"
                >
                  {savingPhone ? '...' : 'Saqlash'}
                </button>
                {isRealPhone && (
                  <button
                    disabled={savingPhone}
                    onClick={() => setEditingPhone(false)}
                    className="px-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-xs font-bold active:scale-95 transition-all"
                  >
                    Bekor
                  </button>
                )}
              </div>

              <div className="pt-1">
                <button
                  onClick={() => {
                    telegram.haptic.medium();
                    telegram.app?.requestContact((sent) => {
                      if (sent) {
                        // Show a small alert or toast that it was sent to bot
                        alert("Raqamingiz botga yuborildi! Endi uni pastdagi maydonga kiritib saqlab qo'yishingiz mumkin.");
                      }
                    });
                  }}
                  className="w-full py-3 rounded-xl bg-[#229ED9]/10 text-[#229ED9] text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all border border-[#229ED9]/20"
                >
                  <MessageCircle className="w-4 h-4" />
                  Telegram'dan botga yuborish
                </button>
              </div>
              <p className="text-[10px] text-neutral-400 text-center px-2">
                Eslatma: Avtomatik olishda raqam botga (chatga) yuboriladi. Uni profilga saqlash uchun yuqoridagi maydonga yozib qo'ying.
              </p>
            </div>
          )}
          {email && (
            <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={email} />
          )}
          {customer?.birthDate && (
            <InfoRow
              icon={<Calendar className="w-4 h-4" />}
              label="Дата рождения"
              value={new Date(customer.birthDate).toLocaleDateString('ru-RU')}
              last
            />
          )}
        </div>

        {/* Telegram info */}
        {telegram.isInTelegram && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-[#0088cc]/10 border-b border-neutral-100 dark:border-neutral-800">
              <p className="text-xs font-semibold text-[#0088cc] uppercase tracking-wider">
                Telegram
              </p>
            </div>
            <InfoRow
              icon={<Shield className="w-4 h-4" />}
              label="Telegram ID"
              value={String(tgUser?.id ?? '—')}
              last
            />
          </div>
        )}

        {/* Logout */}
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-di-red font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            Выйти
          </button>
        )}

        {!isAuthenticated && (
          <div className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-6 text-center space-y-3">
            <User className="w-12 h-12 text-neutral-400 mx-auto" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Вы не авторизованы. Войдите через Telegram или номер телефона.
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
      <div className="text-neutral-400 dark:text-neutral-500">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
          {value}
        </p>
      </div>
    </div>
  );
}
