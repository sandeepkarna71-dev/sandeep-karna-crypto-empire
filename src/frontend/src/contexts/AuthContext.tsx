import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(() => {
    const current = getCurrentUser();
    if (current) {
      // Re-read from users array to get latest data
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
      if (!found) throw new Error("User not found. Please register first.");
      if (found.passwordHash !== hash) throw new Error("Incorrect password.");
      localStorage.setItem("sce_current_user", JSON.stringify(found));
      setUser(found);
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
