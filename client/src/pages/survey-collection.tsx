import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SurveyForm } from "@/components/survey/survey-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { generatePDF } from "@/lib/pdf-generator";
import { Search, QrCodeScanner, Description, Save, Nature, List } from "@mui/icons-material";
import type { SurveyTemplate, SurveyResponse } from "@shared/schema";

interface HouseholdInfo {
  id: string;
  address: string;
  occupants: number;
  area: number;
}

interface Survey {
  id: number;
  templateId: number;
  householdId: string;
  householdAddress: string;
  conductedAt: string;
  template?: SurveyTemplate;
}

export default function SurveyCollection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Mock user ID - in a real app this would come from auth context
  const userId = 1;

  const [surveyCode, setSurveyCode] = useState("");
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>("");
  const [currentTemplate, setCurrentTemplate] = useState<SurveyTemplate | null>(null);
  const [householdInfo, setHouseholdInfo] = useState<HouseholdInfo>({
    id: "",
    address: "",
    occupants: 0,
    area: 0,
  });
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);

  // Fetch user's surveys
  const { data: userSurveys, isLoading: isLoadingSurveys } = useQuery({
    queryKey: [`/api/survey-templates`, userId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/survey-templates`);
      return response.json() as Promise<SurveyTemplate[]>;
    },
  });

  const totalCarbonFootprint = responses.reduce((total, response) => total + response.carbonEquivalent, 0);

  const loadTemplateMutation = useMutation({
    mutationFn: async (code: string) => {
      setIsLoadingTemplate(true);
      const response = await apiRequest("GET", `/api/survey-templates/code/${code}`);
      return response.json();
    },
    onSuccess: (template: SurveyTemplate) => {
      setCurrentTemplate(template);
      setResponses([]);
      toast({
        title: "Template Loaded",
        description: `Survey template "${template.name}" loaded successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Template Not Found",
        description: error.message || "Survey template with this code was not found",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsLoadingTemplate(false);
    },
  });

  const loadSurveyMutation = useMutation({
    mutationFn: async (surveyId: number) => {
      setIsLoadingTemplate(true);
      const response = await apiRequest("GET", `/api/surveys/${surveyId}`);
      return response.json();
    },
    onSuccess: (survey: any) => {
      // Load the template associated with this survey
      if (survey.template) {
        setCurrentTemplate(survey.template);
        setHouseholdInfo({
          id: survey.householdId,
          address: survey.householdAddress,
          occupants: survey.occupants || 0,
          area: parseFloat(survey.area) || 0,
        });
        setResponses(survey.responses || []);
        toast({
          title: "Survey Loaded",
          description: `Survey from ${new Date(survey.conductedAt).toLocaleDateString()} loaded successfully`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Survey Not Found",
        description: error.message || "Survey was not found",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsLoadingTemplate(false);
    },
  });

  const saveSurveyMutation = useMutation({
    mutationFn: async () => {
      if (!currentTemplate) throw new Error("No template selected");
      
      const response = await apiRequest("POST", "/api/surveys", {
        templateId: currentTemplate.id,
        householdId: householdInfo.id,
        householdAddress: householdInfo.address,
        occupants: householdInfo.occupants,
        area: householdInfo.area.toString(),
        responses,
        conductedBy: userId,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Survey Saved",
        description: "Survey data has been saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/surveys`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save survey",
        variant: "destructive",
      });
    },
  });

  const handleLoadSurvey = () => {
    if (!surveyCode.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a survey code",
        variant: "destructive",
      });
      return;
    }
    loadTemplateMutation.mutate(surveyCode.trim());
  };

  const handleSelectSurvey = (surveyCode: string) => {
    setSelectedSurveyId(surveyCode);
    if (surveyCode) {
      loadTemplateMutation.mutate(surveyCode);
    }
  };

  const handleResponsesChange = (newResponses: SurveyResponse[]) => {
    setResponses(newResponses);
  };

  const handleGenerateReport = async () => {
    if (!currentTemplate || responses.length === 0) {
      toast({
        title: "Cannot Generate Report",
        description: "Please complete the survey before generating a report",
        variant: "destructive",
      });
      return;
    }

    try {
      await generatePDF({
        template: currentTemplate,
        householdInfo,
        responses,
        totalCarbonFootprint,
      });
      
      toast({
        title: "Report Generated",
        description: "PDF report has been generated and downloaded",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
    }
  };

  const handleSaveSurvey = () => {
    if (!currentTemplate) {
      toast({
        title: "No Template",
        description: "Please load a survey template first",
        variant: "destructive",
      });
      return;
    }

    if (!householdInfo.id.trim() || !householdInfo.address.trim()) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all household information",
        variant: "destructive",
      });
      return;
    }

    if (responses.length === 0) {
      toast({
        title: "No Responses",
        description: "Please answer at least one question",
        variant: "destructive",
      });
      return;
    }

    saveSurveyMutation.mutate();
  };

  return (
    <section className="p-4 space-y-6">
      {/* Survey Code Input */}
      <Card className="shadow-material">
        <CardHeader>
          <CardTitle className="font-medium text-gray-900">Start Survey</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Survey Selection Dropdown */}
          <div>
            <Label htmlFor="surveySelect" className="text-sm font-medium text-gray-700">
              Select from Existing Surveys
            </Label>
            <div className="flex space-x-2 mt-2">
              <Select value={selectedSurveyId} onValueChange={handleSelectSurvey}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Choose a survey..." />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingSurveys ? (
                    <SelectItem value="loading" disabled>Loading surveys...</SelectItem>
                  ) : userSurveys && userSurveys.length > 0 ? (
                    userSurveys.map((survey) => (
                      <SelectItem key={survey.code} value={survey.code} className="truncate">
                        {survey.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-surveys" disabled>No surveys found</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Button 
                variant="outline"
                disabled={!selectedSurveyId || isLoadingTemplate}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>

          {/* Manual Code Entry */}
          <div>
            <Label htmlFor="surveyCode" className="text-sm font-medium text-gray-700">
              Survey Template Code
            </Label>
            <div className="flex space-x-2 mt-2">
              <Input
                id="surveyCode"
                value={surveyCode}
                onChange={(e) => setSurveyCode(e.target.value)}
                placeholder="Enter survey code (e.g., CS-2024-ABC123)"
                className="font-mono flex-1"
              />
              <Button 
                onClick={handleLoadSurvey}
                disabled={isLoadingTemplate}
                className="bg-primary hover:bg-green-700 text-white"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <Button 
            variant="outline"
            className="w-full flex items-center justify-center space-x-2"
            disabled
          >
            <QrCodeScanner className="w-4 h-4" />
            <span>Scan QR Code (Coming Soon)</span>
          </Button>
        </CardContent>
      </Card>

      {currentTemplate && (
        <>
          {/* Household Information */}
          <Card className="shadow-material">
            <CardHeader>
              <CardTitle className="font-medium text-gray-900">Household Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="householdId" className="text-sm font-medium text-gray-700">
                  Household ID
                </Label>
                <Input
                  id="householdId"
                  value={householdInfo.id}
                  onChange={(e) => setHouseholdInfo(prev => ({ ...prev, id: e.target.value }))}
                  placeholder="Enter unique household identifier"
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="householdAddress" className="text-sm font-medium text-gray-700">
                  Address
                </Label>
                <Textarea
                  id="householdAddress"
                  value={householdInfo.address}
                  onChange={(e) => setHouseholdInfo(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter household address"
                  className="mt-2 h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="occupants" className="text-sm font-medium text-gray-700">
                    Occupants
                  </Label>
                  <Input
                    id="occupants"
                    type="number"
                    value={householdInfo.occupants || ""}
                    onChange={(e) => setHouseholdInfo(prev => ({ ...prev, occupants: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="area" className="text-sm font-medium text-gray-700">
                    Area (sq ft)
                  </Label>
                  <Input
                    id="area"
                    type="number"
                    value={householdInfo.area || ""}
                    onChange={(e) => setHouseholdInfo(prev => ({ ...prev, area: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Survey Form */}
          <SurveyForm
            template={currentTemplate}
            responses={responses}
            onChange={handleResponsesChange}
          />

          {/* Carbon Footprint Summary */}
          <Card className="bg-gradient-to-r from-green-800 to-green-600 text-white shadow-material">
            <CardContent className="p-6">
              <div className="text-center space-y-2">
                <Nature className="text-4xl opacity-80 mx-auto" />
                <h3 className="text-lg font-medium">Total Carbon Footprint</h3>
                <p className="text-3xl font-bold">{totalCarbonFootprint.toFixed(1)} kg CO₂</p>
                <p className="text-green-100 text-sm">Monthly equivalent</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleGenerateReport}
              className="w-full bg-primary hover:bg-green-700 text-white py-4 ripple-effect font-medium"
              disabled={responses.length === 0}
            >
              <Description className="w-5 h-5 mr-2" />
              Generate PDF Report
            </Button>
            
            <Button 
              onClick={handleSaveSurvey}
              variant="outline"
              className="w-full border-2 border-primary text-primary hover:bg-green-50 py-4 ripple-effect font-medium"
              disabled={saveSurveyMutation.isPending}
            >
              <Save className="w-5 h-5 mr-2" />
              {saveSurveyMutation.isPending ? "Saving..." : "Save Survey"}
            </Button>
          </div>
        </>
      )}

      {!currentTemplate && (
        <Card className="shadow-material">
          <CardContent className="p-6 text-center">
            <div className="text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Select a survey from the dropdown or enter a survey code to get started</p>
              <p className="text-xs mt-1">Load a survey or template to begin data collection</p>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
