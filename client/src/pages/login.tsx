import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";
import { loginSchema, type LoginData } from "@shared/schema";
import { z } from "zod";
import { LockOutlined, PersonOutline } from "@mui/icons-material";
import { getApiUrl } from "@/utils/url";


export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login: authLogin } = useAuth();
  const [formData, setFormData] = useState<LoginData>({
    identifier: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: login, isPending } = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await fetch(getApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      authLogin(data.user, data.token);
      toast({
        title: "Welcome back!",
        description: "You have been logged in successfully.",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validatedData = loginSchema.parse(formData);
      login(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  const handleInputChange = (field: keyof LoginData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-roboto flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Welcome Header */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4">
            <img
              src="data:image/jpeg;base64,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"
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-2">Sign in to continue tracking carbon footprints</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-material material-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <LockOutlined className="text-primary" />
              <span>Sign In</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Email or Phone</Label>
                <div className="relative">
                  <PersonOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="Enter your email or phone number"
                    className="pl-10"
                    value={formData.identifier}
                    onChange={handleInputChange("identifier")}
                  />
                </div>
                {errors.identifier && (
                  <p className="text-sm text-red-500">{errors.identifier}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <LockOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10"
                    value={formData.password}
                    onChange={handleInputChange("password")}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white ripple-effect"
                disabled={isPending}
              >
                {isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Button
              variant="link"
              className="text-primary font-medium p-0 h-auto"
              onClick={() => setLocation("/signup")}
            >
              Sign up here
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
} 