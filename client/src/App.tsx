import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { TopAppBar } from "@/components/layout/top-app-bar";
import { AuthProvider, ProtectedRoute } from "@/components/auth-provider";
import Dashboard from "@/pages/dashboard";
import SurveyDesign from "@/pages/survey-design";
import SurveyCollection from "@/pages/survey-collection";
import Reports from "@/pages/reports";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route>
        <ProtectedRoute>
          <div className="min-h-screen bg-gray-50 font-roboto">
            <TopAppBar />
            <main className="pb-20">
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/design" component={SurveyDesign} />
                <Route path="/collect" component={SurveyCollection} />
                <Route path="/reports" component={Reports} />
                <Route component={NotFound} />
              </Switch>
            </main>
            <BottomNavigation />
          </div>
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
