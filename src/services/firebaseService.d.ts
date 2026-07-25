declare module '@/services/firebaseService' {
  export const seedInitialData: () => Promise<void>;
  export const createStory: (payload: any) => Promise<any>;
  export const fetchApprovedStories: () => Promise<any[]>;
  export const fetchPendingStories: () => Promise<any[]>;
  export const updateStoryStatus: (storyId: string, status: string) => Promise<boolean>;
  export const fetchCampaigns: () => Promise<any[]>;
  export const createCampaign: (campaign: any) => Promise<any>;
  export const saveAdminProfile: (adminProfile: any) => Promise<any>;
  export const fetchAdminProfile: () => Promise<any>;
  export const removeStory: (storyId: string) => Promise<boolean>;
  export const hardcodedAdminProfile: any;
  export const registerAdmin: (payload: { name: string; email: string; password: string }) => Promise<any>;
  export const loginAdmin: (payload: { email: string; password: string }) => Promise<any>;
}
