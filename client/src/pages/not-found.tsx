import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Home, ArrowBack } from "@mui/icons-material";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 font-roboto flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="bg-gradient-to-r from-green-800 to-green-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <div className="text-3xl text-white">🌱</div>
        </div>
        
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-medium text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="space-y-3">
          <Button
            onClick={() => setLocation("/")}
            className="w-full bg-primary hover:bg-primary/90 text-white ripple-effect"
          >
            <Home className="mr-2" />
            Go to Dashboard
          </Button>
          
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="w-full"
          >
            <ArrowBack className="mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
