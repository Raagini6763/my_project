declare module '@/services/firebaseService' {
  export const seedInitialData: () => Promise<void>;
  export const createStory: (payload: any) => Promise<any>;
  export const fetchApprovedStories: () => Promise<any[]>;
  export const fetchPendingStories: () => Promise<any[]>;
  export const fetchMyStories: () => Promise<any[]>;
  export const fetchAdminAnalytics: () => Promise<{ submitted: number; pending: number; approved: number; rejected: number; campaigns: number; volunteers: number; writing: number; media: number }>;
  export const updateStoryStatus: (storyId: string, status: string) => Promise<boolean>;
  export const fetchCampaigns: () => Promise<any[]>;
  export const createCampaign: (campaign: any) => Promise<any>;
  export const fetchPublishedPodcasts: () => Promise<any[]>;
  export const createPodcast: (podcast: { title: string; description: string; listenUrl: string }) => Promise<any>;
  export const updateCampaignInteraction: (campaignId: string, field: 'joined' | 'shared', enabled: boolean) => Promise<{ enabled: boolean; count: number }>;
  export const fetchCampaignInteraction: (campaignId: string) => Promise<{ joined?: boolean; shared?: boolean }>;
  export const saveAdminProfile: (adminProfile: any) => Promise<any>;
  export const fetchAdminProfile: () => Promise<any>;
  export const removeStory: (storyId: string) => Promise<boolean>;
  export const hardcodedAdminProfile: any;
  export const loginAdmin: (payload: { email: string; password: string }) => Promise<any>;
  export const logoutAdmin: () => Promise<void>;
  export const subscribeToAdminSession: (callback: (isAdmin: boolean) => void) => () => void;
  export const updateAdminCredentials: (payload: { currentPassword: string; newEmail?: string; newPassword?: string }) => Promise<{ email: string }>;
}
