import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useActor } from "../hooks/useActor";

export interface LocalUser {
  username: string;
  email: string;
  fullName: string;
  passwordHash: string;
  balance: number;
  totalEarned: number;
  totalDeposited: number;
  referralCode: string;
  joinDate: string;
  activePlan: string | null;
  planActivatedAt: string | null;
  referredBy: string | null;
}

export interface AuthUser extends LocalUser {}

interface AuthContextValue {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => void;
  register: (
    fullName: string,
    username: string,
    email: string,
    password: string,
    referralCode?: string,
  ) => Promise<void>;
  refreshUser: () => void;
  updateUser: (updates: Partial<LocalUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getUsers(): LocalUser[] {
  try {
    return JSON.parse(localStorage.getItem("sce_users") || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users: LocalUser[]) {
  localStorage.setItem("sce_users", JSON.stringify(users));
}

function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem("sce_current_user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Queue helpers for pending canister syncs
interface PendingRegister {
  username: string;
  email: string;
  fullName: string;
  joinDate: number;
  referralCode: string;
  referredBy: string[];
}

function getPendingRegisters(): PendingRegister[] {
  try {
    return JSON.parse(localStorage.getItem("sce_pending_register") || "[]");
  } catch {
    return [];
  }
}

function savePendingRegisters(q: PendingRegister[]) {
  localStorage.setItem("sce_pending_register", JSON.stringify(q));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { actor } = useActor();
  const actorRef = useRef(actor);
  actorRef.current = actor;

  const refreshUser = useCallback(() => {
    const current = getCurrentUser();
    if (current) {
      const users = getUsers();
      const latest = users.find(
        (u) => u.username.toLowerCase() === current.username.toLowerCase(),
      );
      if (latest) {
        localStorage.setItem("sce_current_user", JSON.stringify(latest));
        setUser(latest);
      } else {
        setUser(current);
      }
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    setIsLoading(false);
  }, [refreshUser]);

  // Process pending canister registrations when actor becomes available
  useEffect(() => {
    if (!actor) return;
    const pending = getPendingRegisters();
    if (pending.length === 0) return;
    (async () => {
      const remaining: PendingRegister[] = [];
      for (const item of pending) {
        try {
          await (actor as any).registerUserPublic(
            item.username,
            item.email,
            item.fullName,
            BigInt(item.joinDate),
            item.referralCode,
            item.referredBy,
          );
        } catch {
          remaining.push(item);
        }
      }
      savePendingRegisters(remaining);
    })();
  }, [actor]);

  const updateUser = useCallback(
    (updates: Partial<LocalUser>) => {
      if (!user) return;
      const users = getUsers();
      const idx = users.findIndex(
        (u) => u.username.toLowerCase() === user.username.toLowerCase(),
      );
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updates };
        saveUsers(users);
        const updated = users[idx];
        localStorage.setItem("sce_current_user", JSON.stringify(updated));
        setUser(updated);
      }
    },
    [user],
  );

  async function login(usernameOrEmail: string, password: string) {
    setIsLoading(true);
    try {
      const hash = await hashPassword(password);
      const users = getUsers();
      const found = users.find(
        (u) =>
          u.username.toLowerCase() === usernameOrEmail.toLowerCase() ||
          u.email.toLowerCase() === usernameOrEmail.toLowerCase(),
      );

      if (found && found.passwordHash === hash) {
        localStorage.setItem("sce_current_user", JSON.stringify(found));
        setUser(found);
        // Also try to sync to canister on login (fire and forget)
        const currentActor = actorRef.current;
        if (currentActor) {
          (currentActor as any)
            .registerUserPublic(
              found.username,
              found.email,
              found.fullName,
              BigInt(new Date(found.joinDate).getTime()),
              found.referralCode,
              found.referredBy ? [found.referredBy] : [],
            )
            .catch(() => {});
        }
        return;
      }

      // Try backend login for users registered from other devices
      const currentActor = actorRef.current;
      if (currentActor) {
        try {
          const hashBytes = hexToUint8Array(hash);
          const backendUser = await (currentActor as any).loginUser(
            usernameOrEmail,
            hashBytes,
          );
          if (backendUser) {
            // Convert canister UserInfo to LocalUser
            const localUser: LocalUser = {
              username: backendUser.username,
              email: backendUser.email,
              fullName: backendUser.fullName,
              passwordHash: hash,
              balance: Number(backendUser.balance) / 1_000_000,
              totalEarned: Number(backendUser.totalEarned) / 1_000_000,
              totalDeposited: Number(backendUser.totalDeposited) / 1_000_000,
              referralCode: backendUser.referralCode,
              joinDate: new Date(
                Number(backendUser.joinDate) / 1_000_000,
              ).toISOString(),
              activePlan: null,
              planActivatedAt: null,
              referredBy:
                backendUser.referredBy && backendUser.referredBy.length > 0
                  ? backendUser.referredBy[0]
                  : null,
            };
            // Merge into localStorage so future logins work offline
            const existingUsers = getUsers();
            const existingIdx = existingUsers.findIndex(
              (u) =>
                u.username.toLowerCase() === localUser.username.toLowerCase(),
            );
            if (existingIdx === -1) {
              existingUsers.push(localUser);
            } else {
              existingUsers[existingIdx] = {
                ...existingUsers[existingIdx],
                ...localUser,
              };
            }
            saveUsers(existingUsers);
            localStorage.setItem("sce_current_user", JSON.stringify(localUser));
            setUser(localUser);
            return;
          }
        } catch {
          // Backend login failed, fall through to error
        }
      }

      if (!found) throw new Error("User not found. Please register first.");
      throw new Error("Incorrect password.");
    } finally {
      setIsLoading(false);
    }
  }

  async function register(
    fullName: string,
    username: string,
    email: string,
    password: string,
    referralCode?: string,
  ) {
    setIsLoading(true);
    try {
      const users = getUsers();
      if (
        users.find((u) => u.username.toLowerCase() === username.toLowerCase())
      ) {
        throw new Error("Username already taken.");
      }
      if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("Email already registered.");
      }
      const hash = await hashPassword(password);
      const newUser: LocalUser = {
        username,
        email,
        fullName,
        passwordHash: hash,
        balance: 0,
        totalEarned: 0,
        totalDeposited: 0,
        referralCode: generateReferralCode(),
        joinDate: new Date().toISOString(),
        activePlan: null,
        planActivatedAt: null,
        referredBy: referralCode || null,
      };
      // Give referral bonus to referrer
      if (referralCode) {
        const referrerIdx = users.findIndex(
          (u) => u.referralCode === referralCode.toUpperCase(),
        );
        if (referrerIdx !== -1) {
          users[referrerIdx].balance = (users[referrerIdx].balance || 0) + 5;
          users[referrerIdx].totalEarned =
            (users[referrerIdx].totalEarned || 0) + 5;
        }
      }
      users.push(newUser);
      saveUsers(users);
      localStorage.setItem("sce_current_user", JSON.stringify(newUser));
      setUser(newUser);

      const pendingItem: PendingRegister = {
        username,
        email,
        fullName,
        joinDate: Date.now(),
        referralCode: newUser.referralCode,
        referredBy: referralCode ? [referralCode] : [],
      };

      // Try immediately if actor is ready
      const currentActor = actorRef.current;
      if (currentActor) {
        try {
          await (currentActor as any).registerUserPublic(
            username,
            email,
            fullName,
            BigInt(pendingItem.joinDate),
            pendingItem.referralCode,
            pendingItem.referredBy,
          );
        } catch {
          // Actor available but call failed - add to queue for retry
          const q = getPendingRegisters();
          q.push(pendingItem);
          savePendingRegisters(q);
        }
      } else {
        // Actor not ready yet - add to queue, will be processed when actor loads
        const q = getPendingRegisters();
        q.push(pendingItem);
        savePendingRegisters(q);
      }
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("sce_current_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        login,
        logout,
        register,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
