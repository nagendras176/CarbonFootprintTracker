import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Add, Delete } from "@mui/icons-material";
import type { SurveyQuestion } from "@shared/schema";

interface QuestionBuilderProps {
  questions: SurveyQuestion[];
  onChange: (questions: SurveyQuestion[]) => void;
}

export function QuestionBuilder({ questions, onChange }: QuestionBuilderProps) {
  const addQuestion = () => {
    const newQuestion: SurveyQuestion = {
      id: `question_${Date.now()}`,
      text: "",
      unit: "",
      coefficient: 0,
    };
    onChange([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    onChange(newQuestions);
  };

  const updateQuestion = (index: number, field: keyof SurveyQuestion, value: string | number) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    onChange(newQuestions);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Survey Questions</h3>
        <Button 
          onClick={addQuestion}
          className="bg-secondary hover:bg-green-500 text-white"
          size="sm"
        >
          <Add className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </div>

      {questions.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-gray-500">
              <span className="material-icons text-4xl mb-2 block">quiz</span>
              <p className="text-sm">No questions added yet</p>
              <p className="text-xs mt-1">Click "Add Question" to create your first question</p>
            </div>
          </CardContent>
        </Card>
      )}

      {questions.map((question, index) => (
        <Card key={question.id} className="border border-gray-200">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
              <Button 
                onClick={() => removeQuestion(index)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-red-500"
              >
                <Delete className="w-4 h-4" />
              </Button>
            </div>
            
            <div>
              <Label htmlFor={`question-text-${index}`} className="text-sm font-medium text-gray-700">
                Question Text
              </Label>
              <Input
                id={`question-text-${index}`}
                value={question.text}
                onChange={(e) => updateQuestion(index, "text", e.target.value)}
                placeholder="e.g., Monthly electricity consumption (kWh)"
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor={`question-unit-${index}`} className="text-sm font-medium text-gray-700">
                  Unit
                </Label>
                <Input
                  id={`question-unit-${index}`}
                  value={question.unit}
                  onChange={(e) => updateQuestion(index, "unit", e.target.value)}
                  placeholder="kWh"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor={`question-coefficient-${index}`} className="text-sm font-medium text-gray-700">
                  Carbon Coefficient
                </Label>
                <Input
                  id={`question-coefficient-${index}`}
                  type="number"
                  step="0.001"
                  value={question.coefficient || ""}
                  onChange={(e) => updateQuestion(index, "coefficient", parseFloat(e.target.value) || 0)}
                  placeholder="0.45"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">
                This question will convert the numerical input to CO₂ equivalent using the coefficient above.
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
