import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { AIAssistant } from "./components/AIAssistant";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { AuthProvider } from "./contexts/AuthContext";
import { Admin } from "./pages/Admin";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Blog } from "./pages/Blog";
import { Convert } from "./pages/Convert";
import { Crypto } from "./pages/Crypto";
import { Earn } from "./pages/Earn";
import { FutureTrading } from "./pages/FutureTrading";
import { Home } from "./pages/Home";
import { KYC } from "./pages/KYC";
import { Leaderboard } from "./pages/Leaderboard";
import { Login } from "./pages/Login";
import { MemeCoinTrading } from "./pages/MemeCoinTrading";
import { News } from "./pages/News";
import { P2P } from "./pages/P2P";
import { Positions } from "./pages/Positions";
import { Profile } from "./pages/Profile";
import { Referral } from "./pages/Referral";
import { Signals } from "./pages/Signals";
import { Signup } from "./pages/Signup";
import { TradeFi } from "./pages/TradeFi";
import { Trading } from "./pages/Trading";
import { Vlog } from "./pages/Vlog";
import { Wallet } from "./pages/Wallet";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30000, retry: 1 } },
});

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <AIAssistant />
    </div>
  ),
});

const routeTree = rootRoute.addChildren([
  createRoute({ getParentRoute: () => rootRoute, path: "/", component: Home }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/blog",
    component: Blog,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/meme-trading",
    component: MemeCoinTrading,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/futures",
    component: FutureTrading,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/signals",
    component: Signals,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/leaderboard",
    component: Leaderboard,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/referral",
    component: Referral,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/earn",
    component: Earn,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/wallet",
    component: Wallet,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/crypto",
    component: Crypto,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/news",
    component: News,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/trading",
    component: Trading,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/vlog",
    component: Vlog,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/login",
    component: Login,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/signup",
    component: Signup,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/register",
    component: Signup,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/profile",
    component: Profile,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/p2p",
    component: P2P,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/kyc",
    component: KYC,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/positions",
    component: Positions,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/convert",
    component: Convert,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/tradefi",
    component: TradeFi,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/admin",
    component: Admin,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/admin/dashboard",
    component: AdminDashboard,
  }),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="skce-theme"
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
