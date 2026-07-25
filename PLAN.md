# Muhlat Savdo Mini App — UI/UX Rejasi

> Holat: **qoralama** · Yaratilgan: 2026-07-25
> Manba: to'liq kod auditi (`src/**`, `index.html`, `index.css`)

---

## Maqsad

App bo'lib to'lash (muhlat) do'koni bo'lsa-da, interfeys uni oddiy katalog kabi
ko'rsatmoqda. Reja uch narsani ketma-ket hal qiladi:

1. **Sinib turgan poydevorni tuzatish** — dark mode, safe-area, Telegram xatti-harakati.
2. **"Muhlat"ni interfeys markaziga chiqarish** — oylik to'lov, kalkulyator, to'lov jadvali.
3. **Kashfiyot va sayqal** — filtr, qidiruv, sevimlilar, dizayn tizimi.

---

## Ishlash qoidalari (majburiy)

| # | Qoida |
|---|---|
| R1 | Bir bosqich to'liq yopilmaguncha keyingisiga o'tilmaydi. |
| R2 | Har bir topshiriqning **Tekshiruv** bandi bajarilmasa, topshiriq yopilmagan hisoblanadi. |
| R3 | Har bosqich oxirida `npm run build` va `npm run lint` xatosiz o'tishi shart. |
| R4 | Yangi qattiq kodlangan rang/o'lcham qo'shilmaydi — faqat `@theme` tokenlaridan foydalaniladi. |
| R5 | Foydalanuvchiga ko'rinadigan har bir matn i18n qatlamidan olinadi (B1-4 dan keyin). |
| R6 | `alert()`, `confirm()`, `document.getElementById()` ishlatish taqiqlanadi. |
| R7 | Har bir bosqich alohida branch: `feat/stage-N-<nom>`. |
| **R8** | 🚫 **Backendga o'zgartirish kiritish QAT'IYAN TAQIQLANADI.** `D:\Projects\Muhlat-Savdo` — **faqat o'qish uchun**. Bu rejadagi barcha ishlar frontend repozitoriysida bajariladi. Backend cheklovi uchraganda — yechim frontend tomonda topiladi yoki vazifa **"Backendga so'rovlar"** bo'limiga chiqariladi va **bajarilmaydi**. |

---

## Qabul qilingan qarorlar

| # | Savol | Qaror |
|---|---|---|
| Q1 | Buyurtma/to'lov API | **Yo'q.** Backendda `Order` entity umuman mavjud emas. 4-bosqich to'liq **lokal** (`localStorage`) bajariladi. |
| Q2 | Asosiy til | **`ru` default.** `uz` — qo'shimcha, profildan almashtiriladi. |
| Q3 | Sevimlilar | Faqat **qurilmada** (`localStorage`), akkauntga bog'lanmaydi. |
| Q4 | Muhlat sxemasi | **Boshlang'ich to'lov yo'q.** Birinchi to'lov — xarid kuni, keyingilari har oy **shu sanada**. Jami to'lovlar soni = `months`. Misol: 1000$ · 10 oy → bugun 100$, keyin har oy 100$. |
| Q5 | Filtr | **Qisman.** Batafsil quyidagi matritsada. |

### Muhlat hisobi — qat'iy formula

Backend `Instalment` = `{ price: BigDecimal, months: Integer }`, bunda **`price` — JAMI summa**
(`domain/Product.java:59-61`, JSON ustun sifatida saqlanadi).

```
oylikToLov   = instalment.price / instalment.months
toLovlarSoni = instalment.months
birinchiToLov= xarid sanasi (bugun)
i-toLov sanasi = xarid sanasi + i oy      // i = 0 .. months-1
ustama       = instalment.price - product.basePrice   // > 0 bo'lsa ko'rsatiladi
ustamaFoiz   = (ustama / product.basePrice) * 100
```

> ⚠️ `boshlangichToLov` degan alohida tushuncha **yo'q** — birinchi oylik to'lovning o'zi
> xarid kuni to'lanadi. Interfeysda "boshlang'ich to'lov" atamasi ishlatilmasin.

### Backend imkoniyatlari matritsasi

Manba: `Muhlat-Savdo/src/main/java/com/pro/muhlatsavdo/` (eskiroq versiya, faqat o'qildi).
Asosiy endpoint: `POST /api/v1/products/search` + `?page&size`, tanasi — `ProductSearchCriteria`.

| Imkoniyat | Holat | Izoh |
|---|---|---|
| Nom bo'yicha qidiruv | ✅ | `name` — `LIKE`, registrga bog'liq emas |
| Brend bo'yicha (ko'plik) | ✅ | `brandIds: List<Long>` → `IN` |
| Model bo'yicha (ko'plik) | ✅ | `modelIds: List<Long>` |
| Rang bo'yicha | ✅ | `colorId` (bittasi) |
| Faollik | ✅ | `isActive` |
| Narx oralig'i | ⚠️ | `minPrice`/`maxPrice` — **ikkalasi ham majburiy**. `ProductServiceImpl:460` da `if (min != null && max != null)`. Bittasini yuborish ta'sir qilmaydi. `basePrice` bo'yicha filtrlanadi (chegirmasiz) |
| Kategoriya bo'yicha | ⚠️ | `categoryId` — **faqat aniq mos kelish**. `ProductSpecification.byCategory` subkategoriyalarni olmaydi, `criteria` esa ro'yxat qabul qilmaydi. Ya'ni ota kategoriyada filtr ishlatilsa, ichki kategoriyalardagi tovarlar yo'qoladi |
| Saralash | ❌ | `search` da qattiq kodlangan `Sort.by("updatedAt").descending()`. Criteria'da `sort` maydoni yo'q |
| Oylik to'lov bo'yicha filtr | ❌ | `instalments` — `TEXT` ustunda JSON (`InstalmentConverter`). SQL'da umuman filtrlab bo'lmaydi |
| Chegirma bo'yicha filtr | ❌ | Criteria'da yo'q |
| Buyurtmalar tarixi | ❌ | `Order` entity yo'q. `POST /carts/purchase` faqat `"Request is successful"` matnini qaytaradi — buyurtma ID ham yo'q |

**Filtr UI uchun tayyor yordamchi endpointlar:**

| Endpoint | Nima beradi |
|---|---|
| `GET /products/findAllBrandsByCategory/{categoryId}` | Kategoriyadagi brendlar ro'yxati |
| `GET /products/findAllColorsByCategoryId/{id}` | Ranglar ro'yxati |
| `GET /products/findAllModelsByCategoryId/{id}` | Modellar ro'yxati |
| `GET /products/countByCategoryId/{id}` | Kategoriyadagi jami tovarlar soni |

---

# BOSQICH 0 — Poydevor

**Maqsad:** hozir sinib turgan narsalarni tuzatish. Yangi funksiya qo'shilmaydi.
**Baho:** ~1 ish kuni · **Branch:** `fix/stage-0-foundation`

### B0-1 — `viewport-fit=cover` qo'shish

- **Fayl:** `index.html:6`
- **Amal:** `<meta name="viewport">` qiymatini `width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0` ga o'zgartirish.
- **Sabab:** hozir `env(safe-area-inset-*)` iOS'da doim `0` qaytaradi, ya'ni `index.css:45-55` va `PageLayout.tsx:55` dagi barcha safe-area hisoblari bekor.
- **Tekshiruv:** iPhone (yoki DevTools iPhone 14 Pro) da pastki navbar home-indicator ustida turadi, ostida qolmaydi.

### B0-2 — Tailwind dark variantini class-ga bog'lash

- **Fayl:** `src/index.css` (`@import "tailwindcss";` dan keyin)
- **Amal:** quyidagi qatorni qo'shish:
  ```css
  @custom-variant dark (&:where(.dark, .dark *));
  ```
- **Sabab:** Tailwind v4 da `dark:` sukut bo'yicha `prefers-color-scheme` ga bog'lanadi. `useTelegramTheme.ts:27` esa `.dark` klassini qo'yadi. Natijada loyihadagi **barcha** `dark:` klasslari Telegram temasiga reaksiya qilmaydi.
- **Tekshiruv:** DevTools'da `<html>` ga qo'lda `class="dark"` qo'yilsa, sahifa qorayadi (OS temasidan qat'i nazar).

### B0-3 — Telegram tema o'zgarishini kuzatish

- **Fayl:** `src/shared/hooks/useTelegramTheme.ts`
- **Amal:**
  - Tema qo'llash mantig'ini `applyTheme()` funksiyasiga ajratish.
  - `app.onEvent('themeChanged', applyTheme)` ga obuna bo'lish, `useEffect` cleanup'ida `offEvent` chaqirish.
  - `colorScheme` o'zgarganda `.dark` klassi ham yangilanishi shart.
- **Tekshiruv:** app ochiq turganda Telegram sozlamalarida temani almashtirilsa, interfeys darhol o'zgaradi.

### B0-4 — Telegram xatti-harakati metodlarini qo'shish

- **Fayl:** `src/app/telegram/telegram.ts`
- **Amal:** `telegram` obyektiga qo'shish:
  - `disableVerticalSwipes()` / `enableVerticalSwipes()` (Bot API 7.7)
  - `enableClosingConfirmation()` / `disableClosingConfirmation()`
  - `showAlert(message)` — `app.showAlert` bor bo'lsa o'sha, aks holda toast'ga fallback
  - `safeAreaInset` va `contentSafeAreaInset` getterlari (Bot API 8.0)
  - Har bir metod `tg()` `null` bo'lganda jim o'tishi shart (brauzer fallback).
- **Tekshiruv:** `telegram.disableVerticalSwipes()` brauzerda xato bermaydi.

### B0-5 — Swipe-to-close'ni o'chirish

- **Fayl:** `src/App.tsx` (`AppContent` ichidagi boot `useEffect`)
- **Amal:** `telegram.expand()` yonida `telegram.disableVerticalSwipes()` chaqirish.
- **Tekshiruv:** Telegram'da mahsulot ro'yxatini yuqoridan pastga surganda app yopilmaydi.

### B0-6 — Savat bo'sh bo'lmasa yopishni tasdiqlash

- **Fayl:** `src/features/orders/store/cartStore.ts` yoki `src/App.tsx`
- **Amal:** savatdagi element soniga `subscribe` bo'lib, `> 0` bo'lsa `enableClosingConfirmation()`, `=== 0` bo'lsa `disableClosingConfirmation()`.
- **Tekshiruv:** savatda tovar bor holda app yopilsa, Telegram tasdiq so'raydi.

### B0-7 — Toast tizimini haqiqatda ulash

- **Fayllar:** `src/pages/CartPage.tsx`, `src/shared/ui/ProductCard.tsx`, `src/pages/ProfilePage.tsx`, `src/pages/LoginPage.tsx`
- **Amal:**
  - `CartPage.tsx:56` — bo'sh `catch` o'rniga `toast.error(...)` va xato matnini ko'rsatish.
  - `ProductCard.tsx:28` — savatga qo'shilganda `toast.success(...)`.
  - `ProfilePage.tsx:148` va `LoginPage.tsx:60` — `alert()` o'rniga `telegram.showAlert()` yoki toast.
- **Sabab:** `toastStore` va `ToastContainer` yozilgan, lekin butun loyihada bir marta ham chaqirilmagan.
- **Tekshiruv:** tarmoqni o'chirib buyurtma berilsa, ekranda qizil toast chiqadi. Kodda `alert(` qidiruvi 0 natija beradi.

### B0-8 — Telefon raqami validatsiyasi va maskasi

- **Fayllar:** `src/pages/CartPage.tsx`, `src/pages/ProfilePage.tsx`
- **Amal:**
  - `src/shared/ui/PhoneInput.tsx` komponentini yaratish: `+998` prefiksi qat'iy, `## ### ## ##` maskasi, faqat raqam qabul qiladi, `inputMode="numeric"`.
  - Ikkala sahifada ham shu komponentga o'tish.
  - Yuborishdan oldin `isRealUzPhone()` bilan tekshirish; noto'g'ri bo'lsa maydon ostida qizil xato matni.
- **Tekshiruv:** `123` kiritib buyurtma berib bo'lmaydi, aniq xato matni ko'rinadi.

### B0-9 — Profildagi imperativ DOM'ni olib tashlash

- **Fayl:** `src/pages/ProfilePage.tsx:32`
- **Amal:** `document.getElementById('phone-input')` o'rniga controlled `useState`.
- **Tekshiruv:** kodda `getElementById` qidiruvi 0 natija beradi.

### B0-10 — Typography plaginini o'rnatish

- **Fayllar:** `package.json`, `src/index.css`
- **Amal:** `@tailwindcss/typography` o'rnatish va `@plugin "@tailwindcss/typography";` qatorini qo'shish.
- **Sabab:** `ProductDetailPage.tsx:360` `prose prose-sm dark:prose-invert` ishlatadi, plagin yo'q — tavsif HTML'i stilsiz chiqadi.
- **Tekshiruv:** `<ul>` va `<h3>` bo'lgan tavsifli mahsulot ochilsa, ro'yxat nuqtalari va sarlavha farqlanadi.

### B0-11 — Ko'rinadigan mayda xatolar

- `src/pages/ProductDetailPage.tsx:401` — `ДОБАВИТЬ В КОРЗИНU` → `ДОБАВИТЬ В КОРЗИНУ` (lotin `U` → kiril `У`).
- `src/pages/ProductDetailPage.tsx:143` — `object-cover` → `object-contain` (oq fonli rasmlar kesilmasin).
- `src/pages/ProductDetailPage.tsx:153` — Telegram ichida ishlaganda suzuvchi "orqaga" tugmasi ko'rsatilmasin (`!telegram.isInTelegram` sharti).
- `src/pages/CatalogPage.tsx:131` — `products.length` o'rniga sahifa javobidagi `totalElements`.
- `src/shared/ui/ProductCard.tsx:52` va `src/shared/ui/CategoryCard.tsx:31` — `hover:` → `group-active:` (touch'da yopishib qolmasin).
- **Tekshiruv:** har biri qurilmada ko'z bilan tasdiqlanadi.

### B0-12 — O'lik fayllarni o'chirish

- **Amal:** `src/App.css`, `src/assets/react.svg`, `src/assets/vite.svg`, `src/assets/hero.png` o'chiriladi.
- **Sabab:** hech qayerda import qilinmagan (Vite shabloni qoldig'i).
- **Tekshiruv:** `npm run build` xatosiz o'tadi.

**✅ Bosqich 0 yopilish sharti:** 12 ta topshiriq bajarilgan · `npm run build` va `npm run lint` toza · haqiqiy Telegram mijozida iOS va Android'da qo'lda sinovdan o'tgan.

---

# BOSQICH 1 — Dizayn tizimi

**Maqsad:** vizual qoidalarni bittaga keltirish. Yangi ekran qo'shilmaydi.
**Baho:** ~2 ish kuni · **Branch:** `feat/stage-1-design-system`

### B1-1 — Tipografik shkalani qat'iylashtirish

- **Fayl:** `src/index.css` (`@theme`)
- **Amal:** shkalani token sifatida e'lon qilish:
  `--text-caption: 11px` · `--text-body: 13px` · `--text-base: 15px` · `--text-lg: 17px` · `--text-xl: 22px` · `--text-2xl: 28px`
- **Qoida:** `text-[10px]` ishlatish taqiqlanadi. `font-black` faqat narx va sahifa sarlavhasida. `tracking-widest` + `uppercase` juftligi faqat bo'lim yorliqlarida, hech qachon asosiy matnda.
- **Sabab:** hozir `text-[10px] font-black uppercase tracking-widest` 30+ joyda — kirill matni bunday ko'rinishda o'qilmaydi, asosiy auditoriya esa 35+ yosh.
- **Tekshiruv:** `rg "text-\[10px\]" src/` → 0 natija.

### B1-2 — Rang kontrastini WCAG AA ga keltirish

- **Amal:** `text-neutral-400` (oq fonda ≈2.9:1) barcha **matn** ishlatilishida `text-neutral-500` yoki `text-neutral-600` ga almashtiriladi. Ikonkalarda qolishi mumkin.
- **Tekshiruv:** asosiy 6 ekranda hech bir matn kontrasti 4.5:1 dan past emas (DevTools yoki Stark).

### B1-3 — Radius va soyalarni ikki darajaga tushirish

- **Amal:** `--radius-el: 12px` (tugma, input, chip) va `--radius-card: 20px` (karta, panel) tokenlari. `rounded-3xl` va `rounded-[2rem]` ishlatilishi olib tashlanadi.
- **Tekshiruv:** `rg "rounded-\[2rem\]|rounded-3xl" src/` → 0 natija.

### B1-4 — i18n qatlami (uz / ru)

- **Fayllar:** `src/shared/i18n/` (`index.ts`, `uz.json`, `ru.json`)
- **Amal:**
  - Kutubxonasiz yengil yechim: `t(key)` + Zustand store'da joriy til.
  - **Default til — `ru`** (qaror Q2). `uz` faqat foydalanuvchi qo'lda tanlaganda yoqiladi; `language_code` avtomatik aniqlash **ishlatilmaydi**.
  - Barcha ekrandagi matnlar JSON'ga ko'chiriladi. `ru.json` — asosiy, to'liq. `uz.json` — kalit topilmasa `ru` ga fallback.
- **Sabab:** hozir interfeys aralash — `ProfilePage` da `Телефон` yorlig'i ostida `Saqlash` tugmasi turibdi.
- **Tekshiruv:** `rg "[А-Яа-я]" src/pages src/shared/ui` → faqat i18n JSON'larida natija.

### B1-5 — Til almashtirgichi

- **Fayl:** `src/pages/ProfilePage.tsx`
- **Amal:** profil yuqorisida `UZ / RU` segmentli tugma, tanlov `localStorage`ga saqlanadi.
- **Tekshiruv:** til almashtirilib, app qayta ochilsa, tanlov saqlanib qoladi.

### B1-6 — Header'larni birlashtirish

- **Fayl:** `src/shared/ui/PageLayout.tsx` + yangi `src/shared/ui/AppHeader.tsx`
- **Amal:** `variant: 'brand' | 'title' | 'search'` bilan bitta header komponenti. `HomePage:95`, `CatalogPage:94`, `SearchPage:36` dagi mustaqil header'lar olib tashlanadi.
- **Sabab:** hozir 4 xil header, balandligi va safe-area ishlovi har xil.
- **Tekshiruv:** to'rt ekranda header balandligi bir xil, scroll'da bir xil xatti-harakat.

### B1-7 — Teginish nishonlarini kattalashtirish

- **Amal:** barcha bosiladigan elementlar minimal `44×44px` (vizual o'lchami kichik bo'lsa, `::before` bilan kengaytirish). Ayniqsa: `CartPage.tsx:155` miqdor tugmalari (hozir 28px), karusel nuqtalari.
- **Tekshiruv:** DevTools'da har bir tugmaning hit-box'i ≥44px.

### B1-8 — Matn belgilashni qaytarish

- **Fayl:** `src/index.css:42-43`
- **Amal:** `user-select: none` ni `body`dan olib, faqat `button, nav, [role="button"]` ga qo'llash.
- **Tekshiruv:** mahsulot nomi va narxini nusxa olish mumkin.

### B1-9 — Fokus holatlari

- **Amal:** global `:focus-visible` uslubi (`outline: 2px solid var(--color-di-red); outline-offset: 2px`). Input'lardagi `outline-none` faqat `:focus-visible` bilan birga ishlatiladi.
- **Tekshiruv:** klaviatura bilan Tab bosilganda har bir interaktiv element ko'rinadi.

### B1-10 — Ikonka tugmalariga `aria-label`

- **Amal:** `aria-label`siz barcha ikonka-tugmalarga qo'shish: detail'dagi orqaga, karusel o'qlari va nuqtalari, qidiruvni tozalash, savatdan o'chirish.
- **Tekshiruv:** `rg "<button" src/` natijalarida matnsiz tugmalar `aria-label`ga ega.

**✅ Bosqich 1 yopilish sharti:** 10 ta topshiriq bajarilgan · dizayn tokenlari `index.css` da markazlashgan · rus/o'zbek aralashmasi yo'q.

---

# BOSQICH 2 — Muhlat-markazli interfeys

**Maqsad:** app'ning asosiy qiymat taklifini interfeys markaziga chiqarish.
**Baho:** ~3 ish kuni · **Branch:** `feat/stage-2-instalment-first`

### B2-1 — Karta narx ierarxiyasini teskari qilish

- **Fayl:** `src/shared/ui/ProductCard.tsx:100-117`
- **Amal:** narx blokini quyidagi tartibda qayta qurish:
  - **Asosiy (katta, qizil, `font-black`):** `285 000 so'm/oy`
  - **Ikkinchi darajali (kichik, kulrang):** `12 oy · jami 3 420 000 so'm`
  - Chegirma lentasi joyida qoladi.
  - Muhlat mavjud bo'lmasa — eski ko'rinish (to'liq narx katta).
- **Sabab:** hozir oylik to'lov kartadagi eng kichik va eng past kontrastli element (`text-[10px] text-neutral-400`), holbuki do'kon aynan shu bilan ajralib turadi.
- **Tekshiruv:** bosh sahifa gridida oylik to'lov birinchi bo'lib ko'zga tashlanadi.

### B2-2 — To'lov jadvali generatori (util)

- **Fayl:** `src/shared/utils/instalment.ts` (yangi)
- **Amal:** yuqoridagi **qat'iy formula** bo'yicha sof funksiyalar:
  ```ts
  getMonthlyPayment(instalment): number         // price / months
  getOverpayment(instalment, basePrice)         // { amount, percent }
  buildPaymentSchedule(instalment, startDate)   // Payment[] — months ta element
  ```
  - `Payment = { index, date, amount, status }`
  - `index === 0` → `date = startDate` (**bugun to'lanadi**), keyingilari `startDate + i oy`.
  - Oy oxiri holati: 31-yanvardan keyingi to'lov 30/28 kunlik oyga tushsa, o'sha oyning **oxirgi kuni** olinadi.
- **Tekshiruv:** unit testlar — `{price: 1000, months: 10}` uchun 10 ta to'lov, har biri 100, birinchisi bugungi sana; 31-yanvar + 1 oy → 28/29-fevral.

### B2-3 — Muhlat kalkulyatori

- **Fayl:** yangi `src/features/products/ui/InstalmentCalculator.tsx`, `ProductDetailPage.tsx:326-352` o'rniga
- **Amal:** mavjud rejalar bo'yicha segmentli tanlov + tanlangan reja uchun jonli hisob:
  - **Oylik to'lov** (eng katta element)
  - `Bugun to'lanadi: <oylik to'lov>` — app'ning asosiy savdo argumenti
  - Muddat (oy) va jami to'lov summasi
  - **Ustama:** `+520 000 so'm (+18%)` — `instalment.price − basePrice` dan
  - Ustama `≤ 0` bo'lsa, ustama qatori chiqmaydi
- **Sabab:** hozir foydalanuvchi 6 oy va 12 oyni solishtira olmaydi — ortiqcha to'lov ko'rsatilmaydi.
- **Tekshiruv:** rejalar almashtirilganda barcha qiymatlar darhol yangilanadi; hisob B2-2 utilidan olinadi, komponent ichida hisoblanmaydi.

### B2-4 — Mahsulot sahifasida jadval ko'rinishi

- **Fayl:** `InstalmentCalculator.tsx` ichida
- **Amal:** "To'lov jadvalini ko'rish" tugmasi → pastdan chiqadigan panelda `buildPaymentSchedule()` natijasi:
  `1-to'lov · bugun · 100 $` / `2-to'lov · 25-avgust · 100 $` ...
- **Sabab:** sotib olishdan **oldin** aniq sanalarni ko'rish ishonch beradi va operatorga qo'ng'iroqlarni kamaytiradi.
- **Tekshiruv:** 10 oylik reja uchun 10 qator chiqadi, birinchisi "bugun" deb belgilangan.

### B2-5 — Tanlangan muhlat savatga o'tishi

- **Fayllar:** `src/features/orders/store/cartStore.ts`, `src/pages/CartPage.tsx`
- **Amal:**
  - Savat elementida `selectedInstalmentMonths` ko'rsatiladi (hozir saqlanadi, lekin hech qayerda ko'rinmaydi).
  - Savat ichida muhlatni o'zgartirish imkoni.
  - Yakuniy blokda uch qator: `Jami naqd` · `Muhlat bilan jami` · **`Bugun to'lanadi`**.
  - `Bugun to'lanadi` = savatdagi har bir tovarning birinchi oylik to'lovi yig'indisi.
- **Tekshiruv:** detail'da 12 oy tanlangan tovar savatda ham 12 oy bilan ko'rinadi; "bugun to'lanadi" summasi qo'lda hisoblanganga teng.

### B2-6 — Bosh sahifada muhlat sharti bloki

- **Fayl:** `src/pages/HomePage.tsx`
- **Amal:** kategoriyalar ustida uch ikonkali qisqa blok: `Birinchi to'lov — xarid kunida` · `3–12 oy` · `Ortiqcha hujjatsiz`.
- **⚠️ Matn qoidasi:** "boshlang'ich to'lov" (`первоначальный взнос`) atamasi **ishlatilmasin** — sxemada bunday tushuncha yo'q (qaror Q4). To'g'ri ifoda: "birinchi to'lov xarid kunida".
- **Tekshiruv:** yangi foydalanuvchi birinchi ekranda do'kon shartini tushunadi; `rg -i "первоначальн|boshlang'ich to'lov" src/` → 0 natija.

**✅ Bosqich 2 yopilish sharti:** 6 ta topshiriq bajarilgan · muhlat ma'lumoti karta → detail → savat zanjirining har bir bo'g'inida ko'rinadi · B2-2 utili testlar bilan qoplangan.

---

# BOSQICH 3 — Kashfiyot

**Maqsad:** foydalanuvchi kerakli tovarni topa olishi.
**Baho:** ~4 ish kuni · **Branch:** `feat/stage-3-discovery`

> ⚠️ **Bu bosqich backend cheklovlari bilan chegaralangan.** Quyidagi topshiriqlar
> faqat backend **hozir qo'llab-quvvatlaydigan** narsalarni qamraydi. Qo'llab-quvvatlanmaydigan
> filtrlar (oylik to'lov, chegirma) va saralash — "Backendga so'rovlar" bo'limiga chiqarildi
> va **bu bosqichda bajarilmaydi**.

### B3-1 — Filtr paneli (faqat qo'llab-quvvatlanadigan filtrlar)

- **Fayl:** yangi `src/features/products/ui/FilterSheet.tsx`
- **Amal:** pastdan chiqadigan panel (bottom sheet):
  - **Narx oralig'i** — ikki tomonlama slayder. ⚠️ Backend `min` va `max` ni **birga** talab qiladi (`ProductServiceImpl:460`), shuning uchun so'rovda doim ikkalasi yuboriladi: `min` ko'rsatilmasa `0`, `max` ko'rsatilmasa kategoriyadagi eng yuqori narx.
  - **Brend** — checkbox ro'yxati, `GET /products/findAllBrandsByCategory/{categoryId}` dan to'ldiriladi.
  - **Rang** — `findAllColorsByCategoryId/{id}` dan. ⚠️ Backend faqat **bitta** `colorId` qabul qiladi, ko'plik emas — UI ham bitta tanlovli bo'lsin (radio, checkbox emas).
  - "Tozalash" va "Qo'llash" tugmalari; faol filtrlar soni katalog header'ida badge sifatida.
- **⛔ Bu bosqichga KIRMAYDI:** oylik to'lov bo'yicha filtr (`instalments` — `TEXT` ustunda JSON, SQL'da filtrlab bo'lmaydi), chegirma bo'yicha filtr (criteria'da yo'q), "faqat mavjudlari" (`quantity` criteria'da yo'q).
- **Tekshiruv:** filtr qo'llangach URL query'ga yozildi va sahifa yangilanganda saqlanib qoladi; DevTools Network'da `POST /products/search` tanasida `minPrice` va `maxPrice` **doim birga** ketadi.

### B3-2 — Filtr rejimida kategoriya cheklovini boshqarish

- **Fayl:** `src/pages/CatalogPage.tsx`
- **Muammo:** `POST /products/search` da `categoryId` — **aniq mos kelish**
  (`ProductSpecification.byCategory` subkategoriyalarni olmaydi, criteria ro'yxat qabul qilmaydi).
  Oddiy ko'rishda ishlatiladigan `findAllProductsByCategoryId` esa subkategoriyalarni ham oladi.
  Ya'ni **ota kategoriyada filtr yoqilsa, ichki kategoriyalardagi tovarlar yo'qoladi.**
- **Amal:**
  - Filtr tugmasi **faqat barg (leaf) kategoriyalarda** faol bo'ladi.
  - Ota kategoriyada filtr bosilsa — avval subkategoriya tanlash taklif qilinadi (panel ichida ro'yxat), tanlangach filtr ochiladi.
  - Filtr faol holatda kategoriya almashtirilsa, filtr saqlanib qoladi.
- **Sabab:** aks holda foydalanuvchi filtrni qo'llaydi va tovarlarning katta qismi sababsiz yo'qoladi — bu "app buzuq" degan taassurot beradi.
- **Tekshiruv:** ota kategoriyada filtr tugmasi o'chirilgan/tushuntirishli holatda; barg kategoriyada natijalar to'g'ri.

### B3-3 — Katalog navigatsiyasini tuzatish

- **Fayl:** `src/pages/CatalogPage.tsx:86-89`
- **Amal:**
  - Breadcrumb qo'shish: `Elektronika › Telefonlar`
  - Ichki kategoriya tanlanganda ota kategoriya slayderda faol holatda qoladi (hozir tanlov "yo'qoladi").
  - "Barchasi" chipi — ota kategoriyaning to'liq ro'yxatiga qaytish uchun.
- **Tekshiruv:** uch darajali kategoriyada foydalanuvchi qayerdaligini har doim biladi.

### B3-4 — Sevimlilar

- **Fayllar:** yangi `src/features/favorites/store/favoritesStore.ts`, `src/pages/FavoritesPage.tsx`
- **Amal:**
  - Kartada va detail sahifada yurak tugmasi.
  - `localStorage`da saqlanadi (backend tayyor bo'lgach sinxronlashtiriladi).
  - Pastki navigatsiyaga qo'shiladi (5 ta element) yoki profil ichida alohida bo'lim.
- **Sabab:** 2–10 mln so'mlik tovar bir zarbda olinmaydi — foydalanuvchi ko'radi, o'ylaydi, qaytadi.
- **Tekshiruv:** sevimliga qo'shilgan tovar app qayta ochilganda joyida turadi.

### B3-5 — Qidiruv tajribasi

- **Fayl:** `src/pages/SearchPage.tsx`
- **Amal:**
  - Qidiruv tarixi (oxirgi 5 ta, `localStorage`, o'chirish imkoni bilan)
  - Ommabop so'rovlar chiplari
  - Natija topilmasa — o'xshash tovarlar yoki kategoriya takliflari
  - `debounce` 500ms → 300ms
- **Tekshiruv:** bo'sh qidiruv ekrani endi bo'sh emas.

**✅ Bosqich 3 yopilish sharti:** 5 ta topshiriq bajarilgan · katalogda filtr URL'da saqlanadi ·
saralash **ataylab qoldirilgan** (backend qo'llab-quvvatlamaydi, "Backendga so'rovlar" ga chiqarilgan).

---

# BOSQICH 4 — Buyurtma va to'lov jadvali

**Maqsad:** sotib olgandan keyingi hayotni ta'minlash.
**Baho:** ~4 ish kuni · **Branch:** `feat/stage-4-orders`

> ⛔ **Backend yo'q — bu bosqich to'liq lokal bajariladi (qaror Q1).**
> Tekshirildi: `domain/` papkasida `Order` entity **umuman mavjud emas**.
> `POST /api/v1/carts/purchase` faqat `"Request is successful"` matnini qaytaradi — **buyurtma ID ham bermaydi**.
> Demak buyurtmalar tarixi va to'lov jadvali `localStorage` da yuritiladi.
>
> **Lokal yechim qoidalari (majburiy):**
> | # | Qoida |
> |---|---|
> | L1 | Buyurtma `purchase()` **muvaffaqiyatli** qaytgandan keyingina lokal yoziladi. Xato bo'lsa — yozilmaydi. |
> | L2 | Buyurtma ID lokal generatsiya qilinadi: `MS-{YYMMDD}-{4 xonali random}`. Foydalanuvchiga "ichki raqam" sifatida ko'rsatiladi. |
> | L3 | Holat (`Qabul qilindi`, `Tasdiqlandi`...) **avtomatik o'zgarmaydi** — backend bilmaydi. Faqat `Qabul qilindi` ko'rsatiladi. Soxta progress ko'rsatish **taqiqlanadi**. |
> | L4 | To'lov holati (`to'landi`/`kutilmoqda`) — **sanadan** kelib chiqib hisoblanadi, foydalanuvchi qo'lda belgilamaydi. |
> | L5 | Har bir ekranda ochiq eslatma: *"Ma'lumot shu qurilmada saqlanadi. Aniq holat uchun menejerga murojaat qiling."* |
> | L6 | Ma'lumot tuzilishi versiyalanadi (`{ v: 1, orders: [...] }`) — keyin backendga ko'chirish uchun. |

### B4-1 — Bosqichli checkout

- **Fayl:** `src/pages/CartPage.tsx` → `src/features/orders/ui/CheckoutFlow.tsx`
- **Amal:** uch qadam, Telegram MainButton bilan boshqariladi:
  1. **Savat** — tovarlar, miqdor, o'chirish
  2. **Muhlat** — reja tanlash, jami hisob
  3. **Aloqa** — ism, telefon, izoh, tasdiq
  - Har qadamda MainButton matni o'zgaradi; BackButton oldingi qadamga qaytaradi.
- **Sabab:** hozir tovarlar, forma va yakun bitta ustunga tiqilgan.
- **Tekshiruv:** har qadamda faqat kerakli ma'lumot ko'rinadi; orqaga qaytganda kiritilganlar yo'qolmaydi.

### B4-2 — Lokal buyurtma ombori

- **Fayl:** yangi `src/features/orders/store/ordersStore.ts` (Zustand + `persist`)
- **Amal:** L1–L6 qoidalari asosida:
  ```ts
  type LocalOrder = {
    id: string;               // MS-260725-4821  (L2)
    createdAt: string;        // ISO
    items: { productId, name, image, qty, price, instalmentMonths }[];
    contact: { name, phone };
    totalCash: number;
    totalWithInstalment: number;
    schedule: Payment[];      // B2-2 utilidan
  }
  ```
  - `purchase()` muvaffaqiyatli bo'lgandagina `addOrder()` chaqiriladi (L1).
  - `schedule` **xarid paytida bir marta** hisoblanadi va saqlanadi — keyin qayta hisoblanmaydi (sanalar siljib ketmasligi uchun).
- **Tekshiruv:** buyurtmadan keyin `localStorage` da `{ v: 1, orders: [...] }` tuzilishi paydo bo'ladi; tarmoq xatosida hech nima yozilmaydi.

### B4-3 — Buyurtma tasdiq ekrani

- **Amal:** `CartPage.tsx:64-86` dagi `success` holatini alohida ekranga chiqarish:
  ichki buyurtma raqami, tanlangan muhlat, **birinchi to'lov summasi va sanasi**, "Buyurtmalarim" tugmasi.
- **Tekshiruv:** buyurtmadan keyin foydalanuvchi keyingi qadamni aniq biladi.

### B4-4 — Buyurtmalar tarixi

- **Fayl:** yangi `src/pages/OrdersPage.tsx` (`/orders`)
- **Amal:** lokal buyurtmalar ro'yxati: sana, tovarlar, summa, ichki raqam.
  - Holat sifatida **faqat `Qabul qilindi`** ko'rsatiladi (L3) — soxta bosqichlar chizilmaydi.
  - Ro'yxat tepasida L5 eslatmasi.
  - Buyurtmani lokal o'chirish imkoni (tasdiq bilan).
- **Tekshiruv:** profil sahifasidan kirish mumkin; bo'sh holat uchun `EmptyState`; `rg "Yo'lda|Topshirildi" src/` → 0 natija.

### B4-5 — To'lov jadvali

- **Fayl:** yangi `src/features/orders/ui/PaymentSchedule.tsx`
- **Amal:** har bir muhlatli buyurtma uchun saqlangan `schedule` asosida:
  - Progress bar: `4 / 10 to'lov muddati o'tdi` (⚠️ "to'landi" emas — L3/L4: haqiqiy to'lov faktini app bilmaydi)
  - **Keyingi to'lov:** sana + summa; sana o'tib ketgan bo'lsa qizil "muddati o'tgan"
  - Qolgan summa (sanadan hisoblab)
  - To'liq jadval ro'yxati, bugungi/o'tgan/kelgusi holatlar ranglar bilan
  - Pastda L5 eslatmasi
- **Sabab:** bo'lib to'lash do'konida foydalanuvchi eng ko'p qaraydigan ekran — hozir umuman yo'q.
- **Tekshiruv:** buyurtmasi bor foydalanuvchi keyingi to'lov sanasini ikki bosishda ko'radi; sana hisobi B2-2 utilidan oladi.

### B4-6 — To'lov eslatmasi (qurilma ichida)

- **Amal:** keyingi to'lovga 3 kun qolganda yoki muddati o'tganda — app ochilganda bosh sahifada
  yopiladigan banner: `Keyingi to'lov: 25-avgust · 100 $`.
- **⛔ Kirmaydi:** bot orqali push-eslatma — bu backend/bot tomonida bajariladi, alohida vazifa
  ("Backendga so'rovlar" ga chiqarilgan).
- **Tekshiruv:** sanani qo'lda o'zgartirib sinaladi; banner yopilgach o'sha kuni qayta chiqmaydi.

**✅ Bosqich 4 yopilish sharti:** 6 ta topshiriq bajarilgan · L1–L6 qoidalari qat'iy bajarilgan ·
hech bir ekranda soxta holat/progress ko'rsatilmayapti.

---

# BOSQICH 5 — Sayqal va tezlik

**Maqsad:** tajribani "yaxshi"dan "silliq"ga ko'tarish.
**Baho:** ~3 ish kuni · **Branch:** `feat/stage-5-polish`

### B5-1 — Mahsulot galereyasi

- **Fayl:** `src/pages/ProductDetailPage.tsx:136-197`
- **Amal:** swipe bilan almashtirish, pastda thumbnail lenta, bosilganda to'liq ekran + zoom.
- **Tekshiruv:** telefonda barmoq bilan surib rasm almashadi; rasm kattalashtiriladi.

### B5-2 — Tavsiya bloklari

- **Amal:** detail sahifa oxirida `O'xshash mahsulotlar` va `Shu brenddan` gorizontal ro'yxatlari.
- **Sabab:** hozir tavsifdan keyin sahifa "o'lik" tugaydi.
- **Tekshiruv:** har bir mahsulot sahifasidan kamida 2 ta boshqa mahsulotga o'tish yo'li bor.

### B5-3 — Skeleton'larni haqiqiy tartibga moslash

- **Fayllar:** `src/App.tsx:45`, `src/app/router/AppRouter.tsx:14`
- **Amal:** boot ekrani va `PageLoader` bosh sahifa tuzilishini (header + banner + kategoriya gridi) takrorlasin.
- **Tekshiruv:** yuklanish tugaganda kontent "sakramaydi".

### B5-4 — Shriftni optimallashtirish

- **Fayl:** `src/index.css:2`, `index.html`
- **Amal:** CSS ichidagi `@import` olib tashlanadi. Yo self-host (`woff2`), yo `index.html`da `preconnect` + `link`. Og'irliklar 6 tadan 3 tagacha qisqartiriladi (400, 600, 800). `font-display: swap`.
- **Tekshiruv:** Lighthouse'da render-blocking resurslar ro'yxatida shrift yo'q.

### B5-5 — Rasm optimallashtirish

- **Amal:** barcha `<img>` ga `width`/`height` (CLS uchun), grid rasmlari uchun `srcset`, `loading="lazy"` (birinchi ekrandan tashqari), rasm yuklanmasa ko'rinadigan placeholder.
- **Tekshiruv:** Lighthouse CLS < 0.1.

### B5-6 — Meta teglar

- **Fayl:** `index.html`
- **Amal:** `<meta name="theme-color">` (light/dark uchun ikkitasi), `description`, `og:*` teglari.
- **Tekshiruv:** Telegram'da havola ulashilganda to'g'ri preview chiqadi.

### B5-7 — Mikro-animatsiyalar

- **Amal:** sahifalararo o'tish (fade+slide), savatga qo'shishda "uchish" animatsiyasi, navbar badge pulsatsiyasi. Barchasi `prefers-reduced-motion` ni hurmat qilishi shart.
- **Tekshiruv:** OS'da "harakatni kamaytirish" yoqilsa, animatsiyalar o'chadi.

**✅ Bosqich 5 yopilish sharti:** 7 ta topshiriq bajarilgan · Lighthouse (mobile) Performance ≥ 85, Accessibility ≥ 95.

---

## Umumiy jadval

| Bosqich | Nomi | Topshiriqlar | Baho | Bog'liqlik |
|---|---|---|---|---|
| 0 | Poydevor | 12 | ~1 kun | — |
| 1 | Dizayn tizimi | 10 | ~2 kun | 0 |
| 2 | Muhlat-markazli | 6 | ~3 kun | 1 |
| 3 | Kashfiyot | 5 | ~3 kun | 1 |
| 4 | Buyurtma va to'lov (lokal) | 6 | ~4 kun | 2 |
| 5 | Sayqal | 7 | ~3 kun | 1 |
| | **Jami** | **46** | **~16 kun** | |

Bosqich 3 va 5 — 1-bosqichdan keyin **parallel** ketishi mumkin.
Hech bir bosqich backend o'zgarishini kutmaydi.

---

## Backendga so'rovlar — 🚫 BAJARILMAYDI, faqat ma'lumot uchun

> **R8 qoidasi:** backend kodiga tegilmaydi. Quyidagi ro'yxat — **topshiriq emas**.
> Bu shunchaki aniqlangan cheklovlar hujjati: backend egasi kerak deb topsa,
> **o'zi hal qiladi**. Bu rejani bajaruvchi ularni **qilmaydi** va kutmaydi ham.
>
> Ro'yxat nima uchun kerak: frontendda nimadir "yetishmayotgani" ko'ringanda,
> u kamchilik emas — **ongli ravishda chetlab o'tilgan cheklov** ekanini ko'rsatish uchun.

Muhimlik tartibida, har biri uchun aniq texnik izoh bilan.

### S1 — Saralash (eng ko'p ta'sirli)
`ProductSearchCriteria` ga `sortBy` (`price` · `createdAt` · `name`) va `sortDirection` qo'shish.
Hozir `ProductServiceImpl:436` da `Sort.by("updatedAt").descending()` qattiq kodlangan.
→ Ochadi: **B3-2 saralash** ("arzon → qimmat" — elektronika do'koni uchun majburiy).

### S2 — Kategoriya bo'yicha filtr subkategoriyalarni qamrashi
`ProductSpecification.byCategory` aniq mos kelishni tekshiradi.
Yechim: criteria'ga `categoryIds: List<Long>` qo'shish yoki `search` ichida
`categoryService.findAllCategoryIds()` ni chaqirish (`findAllProductsByCategoryId` da allaqachon shunday qilingan).
→ Ochadi: **B3-2 dagi cheklovni butunlay olib tashlaydi** (filtr har qanday kategoriyada ishlaydi).

### S3 — Narx filtri bitta chegara bilan ishlashi
`ProductServiceImpl:460` — `if (min != null && max != null)` → `if (min != null || max != null)`.
Spetsifikatsiyaning o'zi (`ProductSpecification:83-94`) allaqachon bitta chegarani qo'llab-quvvatlaydi.
**Bu bir qatorlik tuzatish.**
→ Ochadi: "500 000 so'mgacha" tipidagi tabiiy filtr.

### S4 — Buyurtmalar API (4-bosqichni haqiqiy qiladi)
`Order` / `OrderItem` entity, `POST /orders`, `GET /orders/my`.
`POST /carts/purchase` kamida **buyurtma ID** qaytarishi kerak (hozir `"Request is successful"` matni).
→ Ochadi: **B4-2…B4-5 ni lokal `localStorage` dan haqiqiy serverga ko'chirish**, L1–L6 qoidalari bekor bo'ladi.

### S5 — Muhlat ma'lumotini filtrlanadigan qilish
`instalments` hozir `TEXT` ustunda JSON (`InstalmentConverter`) — SQL'da filtrlab bo'lmaydi.
Alohida `product_instalment` jadvali kerak.
→ Ochadi: **"oylik to'lov bo'yicha filtr"** — asosiy auditoriya aynan shu bo'yicha qidiradi.

### S6 — Chegirma va mavjudlik bo'yicha filtr
`ProductSearchCriteria` ga `hasDiscount: Boolean` va `inStockOnly: Boolean`.
→ Ochadi: aksiya bo'limi va "faqat mavjudlari" filtri.

### S7 — To'lov eslatmalari (bot)
To'lovga 3 kun qolganda va to'lov kunida bot orqali xabar.
Backend/bot tomonida cron; frontendda faqat yoqish/o'chirish sozlamasi.
→ Ochadi: **B4-6 ni qurilma ichidagi bannerdan haqiqiy push-eslatmaga ko'taradi.**

---

**Eslatma:** yuqoridagilarning hech biri bu rejaga kirmaydi (R8).
Agar kelajakda backend tomonda S1–S3 bajarilsa, 3-bosqichdagi cheklovlar o'z-o'zidan yo'qoladi
va `FilterSheet` ni kengaytirish kifoya — arxitektura o'zgartirilmaydi.
Shu sababli B3-1 da filtr holati alohida saqlanadi va so'rov qurilishi bitta joyga jamlanadi.
