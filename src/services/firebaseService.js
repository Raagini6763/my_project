import { getApps, initializeApp } from "firebase/app";
import {
  EmailAuthProvider,
  getAuth,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { hasText, isCompleteStory } from "../utils/validation";
import { uploadStoryMedia } from "./supabaseStorageService";

const firebaseConfig = {
  apiKey: "AIzaSyAZc2hpgaarks5TKlIGxAwQZkcozGlOU9U",

  authDomain: "tariffwars-38f95.firebaseapp.com",

  projectId: "tariffwars-38f95",

  storageBucket: "tariffwars-38f95.firebasestorage.app",

  messagingSenderId: "987200533909",

  appId: "1:987200533909:web:4909ce21f9bf21440ab29c",

  measurementId: "G-HHD1L3J8S5",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

const ensureUser = async () =>
  auth.currentUser || (await signInAnonymously(auth)).user;

const hardcodedStories = [
  {
    id: "seed-1",
    title: "Broken streetlights near school",
    type: "Podcast",
    description: "Dark roads putting students at risk during evening classes",
    status: "approved",
    location: "Wardha, MH",
    likes: 47,
    volunteers: 12,
    views: 188,
    category: "Safety",
  },
  {
    id: "seed-2",
    title: "Unsafe bus stop for girls",
    type: "Reel",
    description: "No shelter or lighting at main bus stop near college",
    status: "approved",
    location: "Nagpur, MH",
    likes: 89,
    volunteers: 28,
    views: 356,
    category: "Safety",
  },
  {
    id: "seed-3",
    title: "Water shortage in slum area",
    type: "Article",
    description: "Residents walk over 2 km every day for clean drinking water.",
    status: "approved",
    location: "Mumbai, MH",
    likes: 132,
    volunteers: 45,
    views: 501,
    category: "Water",
  },
];

const hardcodedCampaigns = [
  {
    id: "seed-campaign-1",
    title: "Instagram Campaign",
    platform: "Instagram",
    posts: 5,
    frequency: "Weekly",
    status: "active",
  },
  {
    id: "seed-campaign-2",
    title: "WhatsApp Campaign",
    platform: "WhatsApp",
    posts: 3,
    frequency: "Weekly",
    status: "active",
  },
];

export const hardcodedAdminProfile = {
  id: "seed-admin",
  name: "Awaaz Admin",
  email: "admin@awaaz.com",
  role: "admin",
  status: "active",
};

export const seedInitialData = async () => {
  try {
    const storiesSnapshot = await getDocs(collection(db, "stories"));
    if (storiesSnapshot.empty) {
      await Promise.all(
        hardcodedStories.map((story) =>
          addDoc(collection(db, "stories"), {
            ...story,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }),
        ),
      );
    }

    const campaignsSnapshot = await getDocs(collection(db, "campaigns"));
    if (campaignsSnapshot.empty) {
      await Promise.all(
        hardcodedCampaigns.map((campaign) =>
          addDoc(collection(db, "campaigns"), {
            ...campaign,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }),
        ),
      );
    }

    const adminsSnapshot = await getDocs(collection(db, "admins"));
    if (adminsSnapshot.empty) {
      await addDoc(collection(db, "admins"), {
        ...hardcodedAdminProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.warn("Seed data failed:", error);
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
  const user = await ensureUser();
  const mediaUrl = await uploadStoryMedia(mediaUri);

  const storyPayload = {
    title,
    description,
    location,
    category: category || "General",
    type: storyType || "Article",
    authorEmail: authorEmail || "anonymous@awaaz.com",
    authorUid: user.uid,
    status: "pending",
    mediaType: mediaType || "text",
    mediaUrl,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (!isCompleteStory(storyPayload)) {
    throw new Error(
      "The story is incomplete or its required media is missing.",
    );
  }

  const storyRef = await addDoc(collection(db, "stories"), storyPayload);
  return { id: storyRef.id, ...storyPayload };
};

export const fetchApprovedStories = async () => {
  try {
    const snapshot = await getDocs(
      query(collection(db, "stories"), where("status", "==", "approved")),
    );
    const stories = snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }))
      .filter((item) => item.status === "approved" && isCompleteStory(item))
      .map((item) => ({
        id: item.id,
        title: item.title,
        type: item.type || "Article",
        description: item.description || "No description provided.",
        status: "Approved",
        statusColor: "#DCF8E4",
        statusText: "#1B8A43",
        location: item.location || "Unknown",
        likes: item.likes || 0,
        volunteers: item.volunteers || 0,
        views: item.views || 0,
        category: item.category || "General",
        mediaType: item.mediaType || "text",
        mediaUrl: item.mediaUrl || null,
      }));

    return stories;
  } catch (error) {
    console.warn("Failed to load stories from Firestore:", error);
    return [];
  }
};

export const loginAdmin = async ({ email, password }) => {
  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );
  const adminRecord = await getDoc(doc(db, "admins", credential.user.uid));

  if (
    !adminRecord.exists() ||
    adminRecord.data().role !== "admin" ||
    adminRecord.data().status !== "active"
  ) {
    await signOut(auth);
    throw new Error("This account does not have active admin access.");
  }

  return { id: adminRecord.id, ...adminRecord.data() };
};

export const logoutAdmin = async () => {
  await signOut(auth);
};

export const subscribeToAdminSession = (callback) =>
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(false);
      return;
    }
    try {
      const adminRecord = await getDoc(doc(db, "admins", user.uid));
      callback(
        adminRecord.exists() &&
          adminRecord.data().role === "admin" &&
          adminRecord.data().status === "active",
      );
    } catch {
      callback(false);
    }
  });

export const updateAdminCredentials = async ({
  currentPassword,
  newEmail,
  newPassword,
}) => {
  const user = auth.currentUser;
  if (!user?.email)
    throw new Error("No authenticated admin session was found.");

  const currentEmail = user.email;
  const credential = EmailAuthProvider.credential(
    currentEmail,
    currentPassword,
  );
  await reauthenticateWithCredential(user, credential);

  const normalizedEmail = newEmail?.trim();
  if (normalizedEmail && normalizedEmail !== user.email)
    await updateEmail(user, normalizedEmail);
  if (newPassword) await updatePassword(user, newPassword);

  await setDoc(
    doc(db, "admins", user.uid),
    {
      uid: user.uid,
      email: normalizedEmail || currentEmail,
      role: "admin",
      status: "active",
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return { email: normalizedEmail || currentEmail };
};

export const fetchPendingStories = async () => {
  try {
    const snapshot = await getDocs(
      query(collection(db, "stories"), where("status", "==", "pending")),
    );
    return snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }))
      .filter((item) => item.status === "pending" && isCompleteStory(item))
      .map((item) => ({
        id: item.id,
        title: item.title,
        author: item.authorEmail || "Anonymous",
        location: item.location || "Unknown",
        type: item.type || "Article",
        description: item.description || "No description provided.",
        date: item.createdAt?.toDate
          ? item.createdAt.toDate().toISOString().slice(0, 10)
          : "New",
        status: "pending",
        category: item.category || "General",
        mediaType: item.mediaType || "text",
        mediaUrl: item.mediaUrl || null,
      }));
  } catch (error) {
    console.warn("Failed to load pending stories:", error);
    return [];
  }
};

export const updateStoryStatus = async (storyId, status) => {
  try {
    const storyRef = doc(db, "stories", storyId);
    await updateDoc(storyRef, {
      status,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.warn("Failed to update story status:", error);
    return false;
  }
};

export const fetchCampaigns = async () => {
  try {
    const snapshot = await getDocs(
      query(collection(db, "campaigns"), where("status", "==", "active")),
    );
    return snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }))
      .filter(
        (item) =>
          item.status === "active" &&
          hasText(item.title) &&
          hasText(item.platform) &&
          hasText(item.campaignUrl),
      );
  } catch (error) {
    console.warn("Failed to load campaigns:", error);
    return [];
  }
};

export const fetchCampaignInteraction = async (campaignId) => {
  const user = await ensureUser();
  const interactionSnapshot = await getDoc(
    doc(db, "campaignInteractions", `${campaignId}_${user.uid}`),
  );
  return interactionSnapshot.exists() ? interactionSnapshot.data() : {};
};

export const updateCampaignInteraction = async (campaignId, field, enabled) => {
  if (field !== "joined" && field !== "shared")
    throw new Error("Unsupported campaign interaction.");
  const user = await ensureUser();
  const campaignRef = doc(db, "campaigns", campaignId);
  const interactionRef = doc(
    db,
    "campaignInteractions",
    `${campaignId}_${user.uid}`,
  );

  return runTransaction(db, async (transaction) => {
    const [campaignSnapshot, interactionSnapshot] = await Promise.all([
      transaction.get(campaignRef),
      transaction.get(interactionRef),
    ]);
    if (!campaignSnapshot.exists()) throw new Error("Campaign not found.");

    const previous = interactionSnapshot.exists()
      ? interactionSnapshot.data()
      : {};
    const currentCount = Number(campaignSnapshot.data()[field]) || 0;
    const wasEnabled = previous[field] === true;
    if (wasEnabled === enabled) {
      // Repair older interaction records that were saved without updating the
      // campaign's aggregate counter.
      if (enabled && currentCount === 0) {
        transaction.update(campaignRef, {
          [field]: 1,
          updatedAt: serverTimestamp(),
        });
        return { enabled, count: 1 };
      }
      return { enabled, count: currentCount };
    }

    const nextCount = Math.max(0, currentCount + (enabled ? 1 : -1));
    transaction.update(campaignRef, {
      [field]: nextCount,
      updatedAt: serverTimestamp(),
    });
    transaction.set(interactionRef, {
      campaignId,
      userId: user.uid,
      ...previous,
      [field]: enabled,
      updatedAt: serverTimestamp(),
    });
    return { enabled, count: nextCount };
  });
};

export const createCampaign = async (campaign) => {
  try {
    const campaignPayload = {
      ...campaign,
      status: "active",
      joined: 0,
      shared: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const campaignRef = await addDoc(
      collection(db, "campaigns"),
      campaignPayload,
    );
    return { id: campaignRef.id, ...campaignPayload };
  } catch (error) {
    console.warn("Failed to create campaign:", error);
    return null;
  }
};

export const saveAdminProfile = async (adminProfile) => {
  try {
    const adminPayload = {
      ...adminProfile,
      role: "admin",
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const adminsSnapshot = await getDocs(collection(db, "admins"));
    if (!adminsSnapshot.empty) {
      const existingAdmin = adminsSnapshot.docs[0];
      await updateDoc(doc(db, "admins", existingAdmin.id), adminPayload);
      return { id: existingAdmin.id, ...adminPayload };
    }

    const adminRef = await addDoc(collection(db, "admins"), adminPayload);
    return { id: adminRef.id, ...adminPayload };
  } catch (error) {
    console.warn("Failed to save admin profile:", error);
    return hardcodedAdminProfile;
  }
};

export const fetchAdminProfile = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    const admin = await getDoc(doc(db, "admins", user.uid));
    if (admin.exists()) return { id: admin.id, ...admin.data() };
  } catch (error) {
    console.warn("Failed to load admin profile:", error);
  }

  return hardcodedAdminProfile;
};

export const removeStory = async (storyId) => {
  try {
    await deleteDoc(doc(db, "stories", storyId));
    return true;
  } catch (error) {
    console.warn("Failed to delete story:", error);
    return false;
  }
};
