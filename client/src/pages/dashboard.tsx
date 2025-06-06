import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { Quiz, Assignment, AddCircle, AssignmentAdd, Description, Share, Edit } from "@mui/icons-material";

interface UserStats {
  templatesCount: number;
  surveysCount: number;
}

interface SurveyTemplate {
  id: number;
  name: string;
  code: string;
  createdAt: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const userId = user?.id || 1;

  const { data: stats } = useQuery<UserStats>({
    queryKey: [`/api/user/${userId}/stats`],
  });

  const { data: recentTemplates } = useQuery<SurveyTemplate[]>({
    queryKey: [`/api/users/${userId}/survey-templates`],
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  return (
    <section className="p-4 space-y-6 fade-in">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 rounded-lg p-6 text-white material-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-medium mb-2">Welcome back, {user?.name || 'User'}</h2>
            <p className="text-green-100 text-sm">Ready to capture carbon footprints?</p>
          </div>
          <div className="text-3xl opacity-80">🌱</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-material material-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-full">
                <Quiz className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.templatesCount || 0}</p>
                <p className="text-sm text-gray-500">Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-material material-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-full">
                <Assignment className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.surveysCount || 0}</p>
                <p className="text-sm text-gray-500">Surveys</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        
        <Button
          onClick={() => setLocation("/design")}
          className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-material material-card ripple-effect h-auto p-4"
          variant="outline"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <div className="bg-primary p-3 rounded-full">
                <AddCircle className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Create Survey Template</p>
                <p className="text-sm text-gray-500">Design a new carbon footprint survey</p>
              </div>
            </div>
            <span className="material-icons text-gray-400">chevron_right</span>
          </div>
        </Button>

        <Button
          onClick={() => setLocation("/collect")}
          className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-material material-card ripple-effect h-auto p-4"
          variant="outline"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <div className="bg-secondary p-3 rounded-full">
                <AssignmentAdd className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Start Survey</p>
                <p className="text-sm text-gray-500">Collect household carbon data</p>
              </div>
            </div>
            <span className="material-icons text-gray-400">chevron_right</span>
          </div>
        </Button>

        <Button
          onClick={() => setLocation("/reports")}
          className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-material material-card ripple-effect h-auto p-4"
          variant="outline"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <div className="bg-accent p-3 rounded-full">
                <Description className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">View Reports</p>
                <p className="text-sm text-gray-500">Generate and download PDF reports</p>
              </div>
            </div>
            <span className="material-icons text-gray-400">chevron_right</span>
          </div>
        </Button>
      </div>

      {/* Recent Templates */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Recent Templates</h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary font-medium"
            onClick={() => setLocation("/design")}
          >
            View All
          </Button>
        </div>
        
        {recentTemplates && recentTemplates.length > 0 ? (
          recentTemplates.slice(0, 3).map((template) => (
            <Card key={template.id} className="shadow-material material-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Code: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{template.code}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Created {formatTimeAgo(template.createdAt)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="p-2">
                      <Share className="h-4 w-4 text-gray-400" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2">
                      <Edit className="h-4 w-4 text-gray-400" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="shadow-material">
            <CardContent className="p-6 text-center">
              <div className="text-gray-500">
                <Quiz className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No survey templates yet</p>
                <p className="text-xs mt-1">Create your first template to get started</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
