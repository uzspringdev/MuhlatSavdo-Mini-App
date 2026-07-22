// ─── API Response wrapper types ───────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

// Backend /api/v1/auth/customers/... javobi — tekis UserDto + token.
// Mijozning to'liq profili (phoneNumber bilan) alohida GET /customers/me orqali olinadi.
export interface AuthResponse {
  token?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  telegramId?: string;
}

export interface CustomerLoginDto {
  phoneNumber: string;
  otp: string;
}

// ─── Image ────────────────────────────────────────────────────────────────────

export interface ImageDto {
  id: number;
  name: string;
  contentType: string;
  size: number;
  url: string;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface CategoryDto {
  id: number;
  name: string;
  parentCategoryId?: number;
  image?: ImageDto;
  icon?: ImageDto;
  imageUrl?: string;
  iconUrl?: string;
  children?: CategoryDto[];
  products?: ProductDto[];
}

export interface CategorySearchCriteria {
  keyword?: string;
}

// ─── Brand ────────────────────────────────────────────────────────────────────

export interface BrandDto {
  id: number;
  name: string;
  image?: ImageDto;
}

// ─── Color ────────────────────────────────────────────────────────────────────

export interface ColorDto {
  id: number;
  name: string;
  heh: string; // hex color code
  createdAt?: string;
  updatedAt?: string;
}

// ─── Attribute ────────────────────────────────────────────────────────────────

export interface AttributeDto {
  id: number;
  name: string;
}

export interface ProductAttributeDto {
  attributeId: number;
  name: string;
  value: string;
}

// ─── Discount ─────────────────────────────────────────────────────────────────

export interface DiscountDto {
  id: number;
  name: string;
  value: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// ─── Badge ────────────────────────────────────────────────────────────────────

export interface BadgeDto {
  id?: number;
  displayName: string;
  heh: string; // hex/color
}

// ─── Instalment ───────────────────────────────────────────────────────────────

export interface Instalment {
  price: number;
  months: number;
}

// ─── Model ────────────────────────────────────────────────────────────────────

export interface ModelDto {
  id: number;
  productName: string;
  code?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Product ──────────────────────────────────────────────────────────────────

export type Currency = 'UZS' | 'USD' | 'RUB';

export interface ProductDto {
  id: number;
  name: string;
  modelId?: number;
  description?: string;
  colorId?: number;
  color?: ColorDto;
  basePrice: number;
  price: number;
  discountId?: number;
  discount?: DiscountDto;
  quantity: number;
  instalments?: Instalment[];
  categoryId?: number;
  category?: CategoryDto;
  brandId?: number;
  brand?: BrandDto;
  collectionId?: number;
  isActive: boolean;
  images: ImageDto[];
  currency: Currency;
  attributes?: ProductAttributeDto[];
  badgeIds?: number[];
  badges?: BadgeDto[];
  model?: ModelDto;
}

export interface ProductSearchCriteria {
  name?: string;
  categoryId?: number;
  brandIds?: number[];
  modelIds?: number[];
  colorId?: number;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
}

// ─── Collection ───────────────────────────────────────────────────────────────

export type StatusType = 'ENABLE' | 'DISABLE' | 'BLOCKED';

export interface CollectionDto {
  id: number;
  title: string;
  status: StatusType;
  order: number;
}

// ─── Banner ───────────────────────────────────────────────────────────────────

export interface BannerDto {
  id: number;
  name: string;
  pcImageDto?: ImageDto;
  tabImageDto?: ImageDto;
  mobImageDto?: ImageDto;
}

// ─── News ─────────────────────────────────────────────────────────────────────

export interface NewsDto {
  id: number;
  title: string;
  shortInfo: string;
  url: string;
  content: string;
  image?: ImageDto;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Hot Deal ─────────────────────────────────────────────────────────────────

export interface HotDealDto {
  id: number;
  title: string;
  productIds: number[];
  image?: ImageDto;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Customer ─────────────────────────────────────────────────────────────────

export interface CustomerDto {
  id: number;
  username?: string;
  phoneNumber?: string;
  firstName?: string;
  lastname?: string;
  middleName?: string;
  birthDate?: string;
  email?: string;
  status?: string;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: number;
  product?: ProductDto;
  quantity: number;
  selectedInstalmentMonths?: number;
}

export interface Cart {
  items: CartItem[];
  totalPrice: number;
}

export interface PurchaseItemDto {
  productId: number;
  quantity: number;
  instalmentMonths?: number;
}

export interface BuyingProductsDto {
  name: string;
  phoneNumber: string;
  items: PurchaseItemDto[];
}

export interface GuestDto {
  name: string;
  phoneNumber: string;
  productId: number;
}

// ─── Submenu ──────────────────────────────────────────────────────────────────

export interface SubmenuItemDto {
  id: number;
  itemOrder: number;
  name: string;
  categoryId: number;
}

// ─── Telegram ─────────────────────────────────────────────────────────────────

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    start_param?: string;
    auth_date: number;
    hash: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  MainButton: TelegramMainButton;
  BackButton: TelegramBackButton;
  HapticFeedback: TelegramHapticFeedback;
  expand(): void;
  close(): void;
  ready(): void;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  sendData(data: string): void;
  openLink(url: string): void;
  openTelegramLink(url: string): void;
  requestContact(callback?: (sent: boolean) => void): void;
}

export interface TelegramMainButton {
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isActive: boolean;
  isProgressVisible: boolean;
  setText(text: string): TelegramMainButton;
  onClick(callback: () => void): TelegramMainButton;
  offClick(callback: () => void): TelegramMainButton;
  show(): TelegramMainButton;
  hide(): TelegramMainButton;
  enable(): TelegramMainButton;
  disable(): TelegramMainButton;
  showProgress(leaveActive: boolean): TelegramMainButton;
  hideProgress(): TelegramMainButton;
}

export interface TelegramBackButton {
  isVisible: boolean;
  onClick(callback: () => void): TelegramBackButton;
  offClick(callback: () => void): TelegramBackButton;
  show(): TelegramBackButton;
  hide(): TelegramBackButton;
}

export interface TelegramHapticFeedback {
  impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
  notificationOccurred(type: 'error' | 'success' | 'warning'): void;
  selectionChanged(): void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}
