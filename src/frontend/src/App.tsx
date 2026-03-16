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
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { AuthProvider } from "./contexts/AuthContext";
import { Admin } from "./pages/Admin";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Crypto } from "./pages/Crypto";
import { Earn } from "./pages/Earn";
import { Home } from "./pages/Home";
import { Leaderboard } from "./pages/Leaderboard";
import { Login } from "./pages/Login";
import { News } from "./pages/News";
import { Plans } from "./pages/Plans";
import { Profile } from "./pages/Profile";
import { Referral } from "./pages/Referral";
import { Signals } from "./pages/Signals";
import { Signup } from "./pages/Signup";
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
    </div>
  ),
});

const routes = [
  createRoute({ getParentRoute: () => rootRoute, path: "/", component: Home }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/plans",
    component: Plans,
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
    path: "/profile",
    component: Profile,
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
];

const routeTree = rootRoute.addChildren(routes);
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
      storageKey="skl-theme"
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
