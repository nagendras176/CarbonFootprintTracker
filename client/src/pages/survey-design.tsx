import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { QuestionBuilder } from "@/components/survey/question-builder";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Save, Info } from "@mui/icons-material";
import type { SurveyQuestion, SurveyTemplate } from "@shared/schema";

interface TemplateForm {
  name: string;
  description: string;
  questions: SurveyQuestion[];
}

export default function SurveyDesign() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Mock user ID - in a real app this would come from auth context
  const userId = 1;

  const [template, setTemplate] = useState<TemplateForm>({
    name: "",
    description: "",
    questions: [],
  });

  const [previewCode, setPreviewCode] = useState<string>("");

  const { data: userTemplates } = useQuery<SurveyTemplate[]>({
    queryKey: [`/api/users/${userId}/survey-templates`],
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: TemplateForm) => {
      const response = await apiRequest("POST", "/api/survey-templates", {
        ...templateData,
        createdBy: userId,
      });
      return response.json();
    },
    onSuccess: (newTemplate: SurveyTemplate) => {
      toast({
        title: "Template Created",
        description: `Survey template "${newTemplate.name}" has been created with code ${newTemplate.code}`,
      });
      setPreviewCode(newTemplate.code);
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/survey-templates`] });
      // Reset form
      setTemplate({
        name: "",
        description: "",
        questions: [],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create survey template",
        variant: "destructive",
      });
    },
  });

  const handleSaveTemplate = () => {
    if (!template.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a template name",
        variant: "destructive",
      });
      return;
    }

    if (template.questions.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one question",
        variant: "destructive",
      });
      return;
    }

    createTemplateMutation.mutate(template);
  };

  const handleQuestionsChange = (questions: SurveyQuestion[]) => {
    setTemplate(prev => ({ ...prev, questions }));
  };

  return (
    <section className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium text-gray-900">Survey Designer</h2>
          <p className="text-sm text-gray-500">Create carbon footprint survey templates</p>
        </div>
        <Button 
          onClick={handleSaveTemplate} 
          disabled={createTemplateMutation.isPending}
          className="bg-primary hover:bg-green-700 text-white ripple-effect"
        >
          <Save className="w-4 h-4 mr-2" />
          {createTemplateMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Template Basic Info */}
      <Card className="shadow-material">
        <CardHeader>
          <CardTitle className="font-medium text-gray-900">Template Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="templateName" className="text-sm font-medium text-gray-700">
              Template Name
            </Label>
            <Input
              id="templateName"
              value={template.name}
              onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter template name"
              className="mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="templateDescription" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="templateDescription"
              value={template.description}
              onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the purpose of this survey"
              className="mt-2 h-20"
            />
          </div>

          {previewCode && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Info className="text-primary text-sm" />
                <p className="text-sm text-green-800">
                  Template Code: <span className="font-mono font-medium">{previewCode}</span>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questions Builder */}
      <Card className="shadow-material">
        <CardHeader>
          <CardTitle className="font-medium text-gray-900">Survey Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <QuestionBuilder 
            questions={template.questions}
            onChange={handleQuestionsChange}
          />
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card className="shadow-material">
        <CardHeader>
          <CardTitle className="font-medium text-gray-900">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
            {template.questions.length > 0 ? (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">{template.name || "Untitled Survey"}</h4>
                {template.description && (
                  <p className="text-sm text-gray-600">{template.description}</p>
                )}
                <div className="space-y-3">
                  {template.questions.map((question, index) => (
                    <div key={question.id} className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium text-sm text-gray-900">
                        {index + 1}. {question.text}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Unit: {question.unit} | Coefficient: {question.coefficient}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <span className="material-icons text-4xl mb-2 block">preview</span>
                <p className="text-sm">Survey preview will appear here</p>
                <p className="text-xs mt-1">Add questions to see the preview</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Existing Templates */}
      {userTemplates && userTemplates.length > 0 && (
        <Card className="shadow-material">
          <CardHeader>
            <CardTitle className="font-medium text-gray-900">Your Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userTemplates.map((template) => (
                <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-500">Code: {template.code}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <span className="material-icons text-gray-400">share</span>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <span className="material-icons text-gray-400">edit</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
