import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { generatePDF } from "@/lib/pdf-generator";
import { useToast } from "@/hooks/use-toast";
import { Description, Download, Visibility, Analytics } from "@mui/icons-material";
import type { Survey, SurveyTemplate } from "@shared/schema";

interface SurveyWithTemplate extends Survey {
  template: SurveyTemplate;
}

export default function Reports() {
  const { toast } = useToast();
  
  // Mock user ID - in a real app this would come from auth context
  const userId = 1;

  const { data: surveys, isLoading } = useQuery<Survey[]>({
    queryKey: [`/api/users/${userId}/surveys`],
  });

  const handleDownloadReport = async (survey: Survey) => {
    try {
      // In a real app, we would fetch the full survey with template data
      // For now, we'll create a mock template structure
      const mockTemplate = {
        id: survey.templateId,
        name: "Survey Template",
        code: "MOCK-CODE",
        questions: [],
        description: "",
        createdBy: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await generatePDF({
        template: mockTemplate,
        householdInfo: {
          id: survey.householdId,
          address: survey.householdAddress,
          occupants: survey.occupants,
          area: parseFloat(survey.area || "0"),
        },
        responses: survey.responses,
        totalCarbonFootprint: parseFloat(survey.totalCarbonFootprint),
      });

      toast({
        title: "Report Downloaded",
        description: `PDF report for household ${survey.householdId} has been downloaded`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <section className="p-4">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-material">
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium text-gray-900">Survey Reports</h2>
          <p className="text-sm text-gray-500">View and download survey reports</p>
        </div>
        <div className="flex items-center space-x-2">
          <Analytics className="text-primary" />
          <span className="text-sm font-medium text-gray-700">
            {surveys?.length || 0} Reports
          </span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-material">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{surveys?.length || 0}</p>
              <p className="text-sm text-gray-500">Total Surveys</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-material">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {surveys?.reduce((total, survey) => total + parseFloat(survey.totalCarbonFootprint), 0).toFixed(1) || "0.0"}
              </p>
              <p className="text-sm text-gray-500">Total CO₂ (kg)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {surveys && surveys.length > 0 ? (
          surveys.map((survey) => (
            <Card key={survey.id} className="shadow-material material-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">
                        Household {survey.householdId}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {parseFloat(survey.totalCarbonFootprint).toFixed(1)} kg CO₂
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-1">{survey.householdAddress}</p>
                    <p className="text-sm text-gray-500">
                      {survey.occupants} occupants • {survey.area} sq ft
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Conducted on {formatDate(survey.createdAt)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="p-2"
                      title="View Details"
                    >
                      <Visibility className="h-4 w-4 text-gray-400" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="p-2"
                      onClick={() => handleDownloadReport(survey)}
                      title="Download Report"
                    >
                      <Download className="h-4 w-4 text-primary" />
                    </Button>
                  </div>
                </div>
                
                {/* Response Summary */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {survey.responses.length} responses collected
                    </span>
                    <span className="text-green-600 font-medium">
                      Report Available
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="shadow-material">
            <CardContent className="p-6 text-center">
              <div className="text-gray-500">
                <Description className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No survey reports yet</p>
                <p className="text-xs mt-1">Complete surveys to generate reports</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      {surveys && surveys.length > 0 && (
        <Card className="shadow-material">
          <CardHeader>
            <CardTitle className="font-medium text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full"
              disabled
            >
              <Analytics className="w-4 h-4 mr-2" />
              Export All Reports (Coming Soon)
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              disabled
            >
              <Description className="w-4 h-4 mr-2" />
              Generate Summary Report (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
