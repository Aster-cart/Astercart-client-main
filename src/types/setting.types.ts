export interface BusinessFormProps {
    businessName: string;
    emailAddress: string;
    phoneNumber: string;
    businessAddress: string;
    supportingEmail: string;
    supportingPhone: string;
    state: string;
    lga: string;
    password?: string;
    newPassword?: string;
    profilePhoto?: string;
    description?: string;
  }
  export interface NotificationPreferences {
    newOrder: boolean;
    orderUpdates: boolean;
    paymentReceived: boolean;
    lowStock: boolean;
    outOfStock: boolean;
    promotions: boolean;
    systemAlerts: boolean;
  }
  