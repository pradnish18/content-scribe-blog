
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Post from "./pages/Post";
import About from "./pages/About";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import PostEditor from "./pages/PostEditor";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Favorites from "./pages/Favorites";
import ErrorBoundary from "./components/ErrorBoundary";
import { Navigate } from "react-router-dom";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/post/:slug" element={<Post />} />
          
          {/* User Auth Routes */}
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
          <Route path="/about" element={
            localStorage.getItem('userToken') ? <About /> : <Navigate to="/login" replace />
          } />
          <Route path="/favorites" element={
            localStorage.getItem('userToken') ? <Favorites /> : <Navigate to="/login" replace />
          } />
          
          {/* Admin-Only Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/auth" element={<AdminLogin />} />
          <Route path="/panel" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            localStorage.getItem('adminAuth') ? <AdminDashboard /> : <Navigate to="/auth" replace />
          } />
          <Route path="/admin/post/new" element={
            localStorage.getItem('adminAuth') ? (
              <ErrorBoundary>
                <PostEditor key="new" />
              </ErrorBoundary>
            ) : <Navigate to="/auth" replace />
          } />
          <Route path="/admin/post/:id/edit" element={
            localStorage.getItem('adminAuth') ? (
              <ErrorBoundary>
                <PostEditor key={window.location.pathname} />
              </ErrorBoundary>
            ) : <Navigate to="/auth" replace />
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
