export interface UploadedImage {
  url: string;
  position: number;
  title: string;
}
interface IName {
  en: string;
  ar: string;
}
export interface IAPI_KEY {
  id: number;
  api_key: string;
  created_at: string;
  updated_at: string;
  name: string | null;
  email: string | null;
  phone_number: string | null;
  is_active: boolean;
}

interface ItemAd extends IBaseItem {
  main_item_id: number;
  category_id: number;
  category_name?: IName;
  subcategory_id: number;
  subcategory_name?: IName;
  category_model_id?: number | null;
  price: number;
  currency: string;
  item_for: "sale" | "rent" | "trade" | "service";
  reserved: boolean;
  discount: number;
  date_end_discount: string;
}

// MOBILES SQL Interface.
interface IMobileDetails extends IBaseItem {
  storage_capacity?: number;
  ram?: number;
  operating_system?: string;
  screen_size?: number;
  battery_capacity?: number;
  camera_resolution?: string;
  color?: string;
  condition?: "new" | "used" | "refurbished";
  network_type?: string;
}

// PROPERTIES SQL Interface.
interface IPropertyDetails extends IBaseItem {
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  year_built?: number;
  is_furnished?: boolean;
}

// CARS SQL Interface.
interface ICarDetails extends IBaseItem {
  type_id?: number;
  fuel_type_id?: number;
  mileage?: number;
  series?: string;
  year?: number;
  transmission_type: "Manual" | "Automatic" | "Manual + Automatic";
}

// JOBS SQL Interface.
export interface JobItem {
  main_item_id: number;
  category_id: number;
  subcategory_id: number;
  currency: string;
  ended: boolean;
  job_type?: string | null;
  experience_level?: string | null;
  education_level?: string | null;
  skills_required?: string | null;
  application_deadline?: Date | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  company_name?: string | null;
  company_website?: string | null;
  remote_job: boolean;
  benefits?: string | null;
  uuid: string;
  need: boolean;
}

export interface IBaseItem {
  id: number;
  main_items_id: number;
  user_id: number;
  title: string;
  title_filtered?: string | null;
  description: string;
  ai_description?: string | null;
  description_filtered?: string | null;
  archived: boolean;
  is_active: "active" | "pending" | "blocked";
  item_as: "shop" | "used" | "job";
  section: 1 | 2;
  images: { posistion: number; title: string; url: string }[]; // JSONB field, adjust as needed
  thumbnail?: string | null;
  activated_at: Date;
  deleted_at?: Date | null;
  created_at: Date;
  updated_at: Date;
  favorite_at: Date | null;
  review_count: number;
  average_rating: number;
  view_count: number;
  location_id: number;
  uuid: string;
  latitude: number;
  longitude: number;
  state: string;
  city: string;
  address: string;
  delivery_available: boolean;
  status_note?: string | null;
  contact_whatsapp: string | null;
  installment: boolean;
  obo: boolean;
}

export interface ICreatMainItem
  extends IBaseItem,
    ItemAd,
    ICarDetails,
    IPropertyDetails,
    IMobileDetails,
    JobItem {
  client_details?: IUser;
  account_type: "individual" | "business";
  model_name: { en: string; ar: string };
  uuid_client: string;
}
export interface Pagination {
  total: number;
  current_page: number;
  total_pages: number;
  limit_page: number;
  has_more: boolean;
}
export interface IResultAndPagination {
  result: ICreatMainItem[];
  pagination: Pagination;
}

export interface ISignup {
  identifier: string;
  password: string;
}
export interface ILogin extends ISignup {}
export interface IVerifyOtp {
  otp_code: string;
  identifier: string;
}
export interface ISendOTP {
  identifier: string;
}
export interface IRequestResetPassword {
  identifier: string;
  otp_code: string;
  new_password: string;
}

export interface IBusinessAccount {
  user_id?: number;
  banner_image?: string | null;
  business_name?: string;
  business_description?: string | null;
  business_address?: string | null;
  business_phone_number?: string | null;
  account_verified?: boolean | null;
  business_email?: string | null;
  business_type?: { ar: string; en: string } | null;
  business_type_id?: string | null;
  website_url?: string | null;
  tax_number?: string | null;
  register_phone_number?: string | null;
}

export interface IUser {
  token: string;
  id: number;
  username: string | null;
  email: string | null;
  password_hash?: string;
  first_name: string | null;
  last_name: string | null;
  image: string | null;
  phone_number: string | null;
  phone_verified: boolean;
  account_verified: boolean;
  blocked: boolean;
  birth_date: Date | null;
  roles: string[];
  otp_code: string;
  contact_data: string;
  firebase_token: string | null;
  account_type: "individual" | "business";
  password_reset_token: string | null;
  password_reset_expires: Date | null;
  password_reset_code: string | null;
  deleted_at: Date | null;
  deleted: boolean;
  created_at: Date;
  updated_at: Date;
  uuid: string;
  user_id?: number;
  banner_image?: string | null;
  business_name?: string;
  business_description?: string | null;
  business_address?: string | null;
  business_phone_number?: string | null;
  business_email?: string | null;
  business_type?: { ar: string; en: string } | null;
  website_url?: string | null;
  tax_number?: string | null;
  business_account?: IBusinessAccount;
}
export interface IChatMessage {
  chat?: string;
  image?: string;
  sent_at: Date;
  sender_id: number;
}

export interface Business {
  banner_image: string | null;
  business_name: string | null;
  business_type: { en: string; ar: string } | null;
  client_uuid: string;
  account_verified: boolean;
  items_count: number;
}

export interface BusinessesList {
  pagination: Pagination;
  result: Business[];
}

export interface IMessageThread {
  id: number;
  buyer_id: number;
  seller_id: number;
  main_items_id: number;
  content?: IChatMessage[];
  last_chat: IChatMessage;
  sent_at: Date;
  uuid: string;
  status: "unread" | "read";
  title: string;
  first_name: string;
  last_name: string;
  last_name_buyer: string;
  last_name_seller: string;
  first_name_buyer: string;
  first_name_seller: string;
  item_as: "job" | "new" | "used";
  thumbnail: string | null;
  images: string[];
  main_items_uuid: string;
  archived: boolean;
  reserved: boolean;
}

export interface ICreateMessageInput {
  buyer_id: number;
  seller_id: number;
  main_items_id: number;
  content: Array<
    | {
        chat: string;
      }
    | { image: string }
  >;
}

export interface IResultAndPaginationMessages {
  result: IMessageThread[];
  pagination: Pagination;
}

export interface IObjectToken {
  id: number;
  uuid: string;
  email: string;
  phone_number: string;
  account_type: string;
  phone_verified: boolean;
  roles: string[];
}

export interface IEditedUserData {
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
  firebase_token?: string | null;
  contact_data?: string | null;
  account_type?: string;
  business_account?: IBusinessAccount;
  image?: string | null;
}

export interface ItemForSale {
  title: string;
  description: string;
  price: number;
  currency: string;
  item_for: "sale" | "rent" | "trade" | "service";
  condition?: "new" | "used" | "refurbished";
  city: string;
  state: string;
  address: string;
  delivery_available: boolean;
  category?: {
    en: string;
    ar: string;
  };
  subcategory?: {
    en: string;
    ar: string;
  };
  images?: Array<{
    url: string;
  }>;
  client_details?: {
    username: string | null;
  };
  // Mobile specific
  storage_capacity?: number;
  ram?: number;
  operating_system?: string;
  screen_size?: number;
  color?: string;
  // Property specific
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  is_furnished?: boolean;
  // Car specific
  mileage?: number;
  year?: number;
  transmission_type?: "Manual" | "Automatic" | "Manual + Automatic";
  fuel_type_id?: number;
}
export interface CountriesInfo {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}
