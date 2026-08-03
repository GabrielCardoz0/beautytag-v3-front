import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Calendar from "./pages/Calendar";
import Partners from "./pages/Partners";
import PartnerDetails from "./pages/PartnerDetails";
import Services from "./pages/Services";
import Forms from "./pages/Forms";
import Settings from "./pages/Settings";
import BotSettings from "./pages/BotSettings";
import Notifications from "./pages/Notifications";
import Collaborators from "./pages/Collaborators";
import PublicForm from "./pages/PublicForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/calendar" replace />;
  }
  
  return <>{children}</>;
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 z-30 flex items-center gap-3 h-14 px-3 border-b border-border bg-card">
          <SidebarTrigger className="h-9 w-9" />
          <span className="font-bold tracking-tight text-foreground">BEAUTYTAG</span>
        </header>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  </SidebarProvider>
);

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/form/:formId" element={<PublicForm />} />
      
      {/* Auth routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/calendar" replace /> : <Login />} />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/calendar" : "/login"} replace />} />
      
      {/* Protected routes - All roles */}
      <Route path="/calendar" element={<ProtectedRoute><Layout><Calendar /></Layout></ProtectedRoute>} />
      <Route path="/services" element={<ProtectedRoute><Layout><Services /></Layout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
      
      {/* Protected routes - Admin only */}
      <Route path="/partners" element={<ProtectedRoute allowedRoles={['admin']}><Layout><Partners /></Layout></ProtectedRoute>} />
      <Route path="/partners/:id" element={<ProtectedRoute allowedRoles={['admin']}><Layout><PartnerDetails /></Layout></ProtectedRoute>} />
      <Route path="/collaborators" element={<ProtectedRoute allowedRoles={['admin']}><Layout><Collaborators /></Layout></ProtectedRoute>} />
      <Route path="/forms" element={<ProtectedRoute allowedRoles={['admin']}><Layout><Forms /></Layout></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute allowedRoles={['admin']}><Layout><Notifications /></Layout></ProtectedRoute>} />
      <Route path="/bot-settings" element={<ProtectedRoute allowedRoles={['admin']}><Layout><BotSettings /></Layout></ProtectedRoute>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
