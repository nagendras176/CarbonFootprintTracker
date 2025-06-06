import { Button } from "@/components/ui/button";
import { Eco, AccountCircle, MoreVert } from "@mui/icons-material";

export function TopAppBar() {
  return (
    <header className="bg-primary text-white shadow-material sticky top-0 z-50">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <Eco />
          <h1 className="text-lg font-medium">Carbon Survey</h1>
        </div>
        <div className="flex items-center space-x-2">
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
          >
            <MoreVert />
          </Button>
        </div>
      </div>
    </header>
  );
}
