import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import type { SurveyTemplate, SurveyQuestion, SurveyResponse } from "@shared/schema";

interface SurveyFormProps {
  template: SurveyTemplate;
  responses: SurveyResponse[];
  onChange: (responses: SurveyResponse[]) => void;
}

export function SurveyForm({ template, responses, onChange }: SurveyFormProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentValue, setCurrentValue] = useState<number>(0);

  const questions = template.questions as SurveyQuestion[];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Load existing response for current question
  useEffect(() => {
    if (currentQuestion) {
      const existingResponse = responses.find(r => r.questionId === currentQuestion.id);
      setCurrentValue(existingResponse?.value || 0);
    }
  }, [currentQuestionIndex, currentQuestion, responses]);

  // Calculate carbon equivalent in real-time
  const carbonEquivalent = currentValue * (currentQuestion?.coefficient || 0);

  const handleNext = () => {
    saveCurrentResponse();
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    saveCurrentResponse();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const saveCurrentResponse = () => {
    if (!currentQuestion) return;

    const newResponse: SurveyResponse = {
      questionId: currentQuestion.id,
      value: currentValue,
      carbonEquivalent: carbonEquivalent,
    };

    const updatedResponses = responses.filter(r => r.questionId !== currentQuestion.id);
    updatedResponses.push(newResponse);
    onChange(updatedResponses);
  };

  if (!currentQuestion) {
    return (
      <Card className="shadow-material">
        <CardContent className="p-6 text-center">
          <div className="text-gray-500">
            <span className="material-icons text-4xl mb-2 block">quiz</span>
            <p className="text-sm">No questions available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-material">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-medium text-gray-900">Survey Questions</CardTitle>
          <div className="text-sm text-gray-500">
            {currentQuestionIndex + 1} of {totalQuestions}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Current Question */}
        <div className="space-y-4">
          <div className="bg-green-50 border-l-4 border-primary p-4">
            <h4 className="font-medium text-gray-900 mb-2">
              {currentQuestion.text}
            </h4>
            <p className="text-sm text-gray-600">Enter the numerical value only</p>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Input
                type="number"
                inputMode="decimal"
                value={currentValue || ""}
                onChange={(e) => setCurrentValue(parseFloat(e.target.value) || 0)}
                className="w-full p-4 text-2xl text-center border-2 border-primary rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="0"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                {currentQuestion.unit}
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Estimated CO₂ equivalent:</span>
                <span className="font-medium text-primary">
                  {carbonEquivalent.toFixed(2)} kg CO₂
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="flex-1 py-3"
            >
              <ArrowBack className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentQuestionIndex === totalQuestions - 1}
              className="flex-1 bg-primary hover:bg-green-700 text-white py-3"
            >
              Next
              <ArrowForward className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Question Overview */}
        <div className="pt-4 border-t border-gray-100">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Progress Overview</h5>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, index) => {
              const isCompleted = responses.some(r => r.questionId === questions[index].id);
              const isCurrent = index === currentQuestionIndex;
              
              return (
                <div
                  key={index}
                  className={`h-2 rounded-full ${
                    isCompleted
                      ? "bg-primary"
                      : isCurrent
                      ? "bg-secondary"
                      : "bg-gray-200"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
