import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { VideoPlayerProvider } from "@/contexts/VideoPlayerContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Chat from "@/pages/chat";
import Admin from "@/pages/admin";
import AdminLogin from "@/pages/admin-login";
import { isAdminAuthenticated } from "@/components/admin/PasswordProtection";

// Protected route component that redirects to login if not authenticated
const ProtectedRoute = ({ component: Component, ...rest }: any) => {
  if (!isAdminAuthenticated()) {
    return <Redirect to="/admin-login" />;
  }
  return <Component {...rest} />;
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/chat/:id" component={Chat} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin">
        {(params) => <ProtectedRoute component={Admin} params={params} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AccessibilityProvider>
          <VideoPlayerProvider>
            <Router />
            <Toaster />
          </VideoPlayerProvider>
        </AccessibilityProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
