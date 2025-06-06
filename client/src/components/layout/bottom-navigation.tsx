import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Home, DesignServices, Assignment, Analytics } from "@mui/icons-material";

export function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/design", icon: DesignServices, label: "Design" },
    { path: "/collect", icon: Assignment, label: "Collect" },
    { path: "/reports", icon: Analytics, label: "Reports" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-material-lg">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Button
              key={item.path}
              onClick={() => setLocation(item.path)}
              variant="ghost"
              className={`flex flex-col items-center py-2 px-4 ripple-effect ${
                isActive ? "text-primary" : "text-gray-400"
              }`}
            >
              <Icon className="text-2xl" />
              <span className="text-xs font-medium mt-1">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
