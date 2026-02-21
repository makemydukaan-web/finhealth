import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import TeaserDashboard from "@/pages/TeaserDashboard";
import Stage2Questionnaire from "@/pages/Stage2Questionnaire";
import IgniteDashboard from "@/pages/IgniteDashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/teaser" component={TeaserDashboard} />
      <Route path="/stage2" component={Stage2Questionnaire} />
      <Route path="/ignite" component={IgniteDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
