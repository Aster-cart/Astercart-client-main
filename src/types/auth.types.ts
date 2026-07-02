export interface StoreSummary {
  _id: string;
  username: string;
  profilePic: string;
  email: string;
  accountDetails: {
    accountName: String;
    accountNumber: string;
    bankName: String;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthStore {
  storeSummary: StoreSummary | null;
  storeProfile: StoreProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: SignUpData) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateStoreData: (updatedData: Partial<StoreProfile>) => Promise<boolean>;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  cacNumber?: string;
  phoneNumber?: string;
  storeDetails: {
    address: string;
    state: string;
    postalCode: string;
    lga: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  userType?: "Store";
}

export interface StoreProfile {
  storeDetails: {
    address: string;
    state: string;
    postalCode?: string;
    lga: string;
  };
  notificationPreferences: {
    newOrder: boolean,
    orderUpdates: boolean,
    paymentReceived: boolean,
    lowStock: boolean,
    outOfStock: boolean,
    promotions: boolean,
    systemAlerts: boolean
  },
  _id: string;
  name: string;
  email: string;
  userType: string;
  picture: string | null;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  resetToken: string | null;
  isOtpVerified: boolean;
  otpStep: string;
  otp: string;
  resetTokenExpiry: string | null;
  phoneNumber: string | null;
  supportingEmail: string | null;
  supportingPhone: string | null;
}
