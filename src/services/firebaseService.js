import { getApps, initializeApp } from 'firebase/app';
import {
    createUserWithEmailAndPassword,
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from 'firebase/auth';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    getFirestore,
    serverTimestamp,
    setDoc,
    updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyB-KPr2H3wN-rRodn1LZ-XLSv8uItkZsxc',
  authDomain: 'project-ec2b7.firebaseapp.com',
  projectId: 'project-ec2b7',
  storageBucket: 'project-ec2b7.firebasestorage.app',
  messagingSenderId: '280840269934',
  appId: '1:280840269934:web:2b5eb24a5ee82872e4f67f',
  measurementId: 'G-XGJ3X1W1HC',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

const hardcodedStories = [
  {
    id: 'seed-1',
    title: 'Broken streetlights near school',
    type: 'Podcast',
    description: 'Dark roads putting students at risk during evening classes',
    status: 'approved',
    location: 'Wardha, MH',
    likes: 47,
    volunteers: 12,
    views: 188,
    category: 'Safety',
  },
  {
    id: 'seed-2',
    title: 'Unsafe bus stop for girls',
    type: 'Reel',
    description: 'No shelter or lighting at main bus stop near college',
    status: 'approved',
    location: 'Nagpur, MH',
    likes: 89,
    volunteers: 28,
    views: 356,
    category: 'Safety',
  },
  {
    id: 'seed-3',
    title: 'Water shortage in slum area',
    type: 'Article',
    description: 'Residents walk over 2 km every day for clean drinking water.',
    status: 'approved',
    location: 'Mumbai, MH',
    likes: 132,
    volunteers: 45,
    views: 501,
    category: 'Water',
  },
];

const hardcodedCampaigns = [
  {
    id: 'seed-campaign-1',
    title: 'Instagram Campaign',
    platform: 'Instagram',
    posts: 5,
    frequency: 'Weekly',
    status: 'active',
  },
  {
    id: 'seed-campaign-2',
    title: 'WhatsApp Campaign',
    platform: 'WhatsApp',
    posts: 3,
    frequency: 'Weekly',
    status: 'active',
  },
];

export const hardcodedAdminProfile = {
  id: 'seed-admin',
  name: 'Awaaz Admin',
  email: 'admin@awaaz.com',
  role: 'admin',
  status: 'active',
};

export const seedInitialData = async () => {
  try {
    const storiesSnapshot = await getDocs(collection(db, 'stories'));
    if (storiesSnapshot.empty) {
      await Promise.all(
        hardcodedStories.map((story) =>
          addDoc(collection(db, 'stories'), {
            ...story,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        )
      );
    }

    const campaignsSnapshot = await getDocs(collection(db, 'campaigns'));
    if (campaignsSnapshot.empty) {
      await Promise.all(
        hardcodedCampaigns.map((campaign) =>
          addDoc(collection(db, 'campaigns'), {
            ...campaign,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        )
      );
    }

    const adminsSnapshot = await getDocs(collection(db, 'admins'));
    if (adminsSnapshot.empty) {
      await addDoc(collection(db, 'admins'), {
        ...hardcodedAdminProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.warn('Seed data failed:', error);
  }
};

const uploadMedia = async (mediaUri, pathPrefix = 'stories') => {
  if (!mediaUri) return null;

  try {
    const response = await fetch(mediaUri);
    const blob = await response.blob();
    const fileName = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.warn('Media upload failed:', error);
    throw new Error('The media file could not be uploaded. Check Firebase Storage rules and try again.');
  }
};

export const createStory = async ({
  title,
  description,
  location,
  category,
  storyType,
  authorEmail,
  mediaUri,
  mediaType,
}) => {
  const mediaUrl = await uploadMedia(mediaUri, 'stories');

  const storyPayload = {
    title,
    description,
    location,
    category: category || 'General',
    type: storyType || 'Article',
    authorEmail: authorEmail || 'anonymous@awaaz.com',
    status: 'pending',
    mediaType: mediaType || 'text',
    mediaUrl,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const storyRef = await addDoc(collection(db, 'stories'), storyPayload);
  return { id: storyRef.id, ...storyPayload };
};

export const fetchApprovedStories = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'stories'));
    const stories = snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }))
      .filter((item) => item.status === 'approved')
      .map((item) => ({
        id: item.id,
        title: item.title,
        type: item.type || 'Article',
        description: item.description || 'No description provided.',
        status: 'Approved',
        statusColor: '#DCF8E4',
        statusText: '#1B8A43',
        location: item.location || 'Unknown',
        likes: item.likes || 0,
        volunteers: item.volunteers || 0,
        views: item.views || 0,
        category: item.category || 'General',
        mediaType: item.mediaType || 'text',
        mediaUrl: item.mediaUrl || null,
      }));

    // Demo posts remain visible alongside approved Firestore posts.
    const storedIds = new Set(stories.map((story) => story.id));
    return [...hardcodedStories.filter((story) => !storedIds.has(story.id)), ...stories];
  } catch (error) {
    console.warn('Failed to load stories from Firestore:', error);
    return hardcodedStories;
  }
};

export const registerAdmin = async ({ name, email, password }) => {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(credential.user, { displayName: name.trim() });

  const adminPayload = {
    uid: credential.user.uid,
    name: name.trim(),
    email: credential.user.email,
    role: 'admin',
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'admins', credential.user.uid), adminPayload);
    return { id: credential.user.uid, ...adminPayload, profileSaved: true };
  } catch (error) {
    // Authentication succeeded, so do not strand the newly-created admin on
    // the registration screen if Firestore is temporarily unavailable.
    console.warn('Admin account created, but profile storage failed:', error);
    return { id: credential.user.uid, ...adminPayload, profileSaved: false };
  }
};

export const loginAdmin = async ({ email, password }) => {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const adminSnapshot = await getDocs(collection(db, 'admins'));
  const adminRecord = adminSnapshot.docs.find(
    (item) => item.id === credential.user.uid || item.data().uid === credential.user.uid
  );

  if (!adminRecord || adminRecord.data().role !== 'admin' || adminRecord.data().status !== 'active') {
    await signOut(auth);
    throw new Error('This account does not have active admin access.');
  }

  return { id: adminRecord.id, ...adminRecord.data() };
};

export const fetchPendingStories = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'stories'));
    return snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }))
      .filter((item) => item.status === 'pending')
      .map((item) => ({
        id: item.id,
        title: item.title,
        author: item.authorEmail || 'Anonymous',
        location: item.location || 'Unknown',
        type: item.type || 'Article',
        description: item.description || 'No description provided.',
        date: item.createdAt?.toDate ? item.createdAt.toDate().toISOString().slice(0, 10) : 'New',
        status: 'pending',
        category: item.category || 'General',
        mediaType: item.mediaType || 'text',
        mediaUrl: item.mediaUrl || null,
      }));
  } catch (error) {
    console.warn('Failed to load pending stories:', error);
    return [];
  }
};

export const updateStoryStatus = async (storyId, status) => {
  try {
    const storyRef = doc(db, 'stories', storyId);
    await updateDoc(storyRef, {
      status,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.warn('Failed to update story status:', error);
    return false;
  }
};

export const fetchCampaigns = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'campaigns'));
    const campaigns = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    return campaigns.length ? campaigns : hardcodedCampaigns;
  } catch (error) {
    console.warn('Failed to load campaigns:', error);
    return hardcodedCampaigns;
  }
};

export const createCampaign = async (campaign) => {
  try {
    const campaignPayload = {
      ...campaign,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const campaignRef = await addDoc(collection(db, 'campaigns'), campaignPayload);
    return { id: campaignRef.id, ...campaignPayload };
  } catch (error) {
    console.warn('Failed to create campaign:', error);
    return null;
  }
};

export const saveAdminProfile = async (adminProfile) => {
  try {
    const adminPayload = {
      ...adminProfile,
      role: 'admin',
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const adminsSnapshot = await getDocs(collection(db, 'admins'));
    if (!adminsSnapshot.empty) {
      const existingAdmin = adminsSnapshot.docs[0];
      await updateDoc(doc(db, 'admins', existingAdmin.id), adminPayload);
      return { id: existingAdmin.id, ...adminPayload };
    }

    const adminRef = await addDoc(collection(db, 'admins'), adminPayload);
    return { id: adminRef.id, ...adminPayload };
  } catch (error) {
    console.warn('Failed to save admin profile:', error);
    return hardcodedAdminProfile;
  }
};

export const fetchAdminProfile = async () => {
  try {
    const adminsSnapshot = await getDocs(collection(db, 'admins'));
    if (!adminsSnapshot.empty) {
      const admin = adminsSnapshot.docs[0];
      return { id: admin.id, ...admin.data() };
    }
  } catch (error) {
    console.warn('Failed to load admin profile:', error);
  }

  return hardcodedAdminProfile;
};

export const removeStory = async (storyId) => {
  try {
    await deleteDoc(doc(db, 'stories', storyId));
    return true;
  } catch (error) {
    console.warn('Failed to delete story:', error);
    return false;
  }
};
