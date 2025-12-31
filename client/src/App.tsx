import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Products from "./pages/Products";
import Invoices from "./pages/Invoices";
import Reports from "./pages/Reports";
import Sellers from "./pages/Sellers";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import Suppliers from "./pages/Suppliers";
import Receipt from "./pages/Receipt";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/pos" component={POS} />
      <Route path="/products" component={Products} />
      <Route path="/invoices" component={Invoices} />
      <Route path="/suppliers" component={Suppliers} />
      <Route path="/reports" component={Reports} />
      <Route path="/sellers" component={Sellers} />
      <Route path="/alerts" component={Alerts} />
      <Route path="/settings" component={Settings} />
      <Route path="/receipt/:saleCode" component={Receipt} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
