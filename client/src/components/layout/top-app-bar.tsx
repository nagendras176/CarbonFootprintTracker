import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { AccountCircle, ExitToApp, Nature } from "@mui/icons-material";

export function TopAppBar() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-primary text-white shadow-material sticky top-0 z-50">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <Nature />
          <h1 className="text-lg font-medium">Carbon Survey</h1>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-green-100 hidden sm:block">
            Welcome, {user?.name}
          </span>
          <Button 
            variant="ghost" 
            size="sm"
            className="p-2 rounded-full hover:bg-green-700 transition-colors text-white"
          >
            <AccountCircle />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="p-2 rounded-full hover:bg-green-700 transition-colors text-white"
            onClick={logout}
            title="Logout"
          >
            <ExitToApp />
          </Button>
        </div>
      </div>
    </header>
  );
}
