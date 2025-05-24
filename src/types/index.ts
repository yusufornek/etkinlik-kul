// Backend'den gelen tiplere uygun olacak şekilde güncellendi
export interface Category {
  id: number;
  name: string;
  slug: string;
  color_class: string;
  text_color_class: string;
  icon?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  category_id: number;
  category: Category;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  requires_registration: boolean;
  registration_link?: string;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Story {
  id: number;
  title: string;
  image_url: string;
  link_url?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  expires_at: string;
  is_expired: boolean;
}

export interface Admin {
  id: number;
  username: string;
  is_active: boolean;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface Settings {
  id: number;
  site_name: string;
  about_content?: string;
  contact_email?: string;
  contact_phone?: string;
  mission?: string;
  vision?: string;
  faqs?: Array<{ question: string; answer: string }>;
  features?: Array<{ icon: string; title: string; description: string }>;
  club_info_steps?: Array<{ step: number; title: string; description: string }>;
  created_at: string;
  updated_at?: string;
}
