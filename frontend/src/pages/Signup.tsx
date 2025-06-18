import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Code, UserPlus, Mail, Shield, CheckCircle, AlertCircle, ArrowLeft, User, Lock } from "lucide-react";

const Signup = () => {
  const { signup, isAuthenticated, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  const [emailValidation, setEmailValidation] = useState<{
    isValid: boolean;
    isChecking: boolean;
    message: string;
  }>({ isValid: false, isChecking: false, message: "" });

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const validateEmail = async (emailValue: string) => {
    if (!emailValue || emailValue.length < 5) {
      setEmailValidation({ isValid: false, isChecking: false, message: "" });
      return;
    }

    setEmailValidation({ isValid: false, isChecking: true, message: "Checking email..." });

    try {
      // Basic format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailValue)) {
        setEmailValidation({ isValid: false, isChecking: false, message: "Invalid email format" });
        return;
      }

      // Simulate email validation (you can implement actual validation)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, reject some common invalid domains
      const domain = emailValue.split('@')[1]?.toLowerCase();
      const invalidDomains = ['test.com', 'fake.com', 'invalid.com'];

      if (invalidDomains.includes(domain)) {
        setEmailValidation({ isValid: false, isChecking: false, message: "Email domain does not exist" });
      } else {
        setEmailValidation({ isValid: true, isChecking: false, message: "Email is valid" });
      }
    } catch (error) {
      setEmailValidation({ isValid: false, isChecking: false, message: "Unable to validate email" });
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value;
    setEmail(emailValue);

    // Debounce email validation
    const timeoutId = setTimeout(() => {
      validateEmail(emailValue);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    if (!role) {
      alert("Please select your role");
      return;
    }

    if (!emailValidation.isValid) {
      alert("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      await signup(name, email, password, role);
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-indigo-500/10 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-purple-500/10 rounded-full animate-float-delayed"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-pink-500/10 rounded-full animate-float"></div>
        <div className="absolute bottom-1/3 left-1/3 w-20 h-20 bg-cyan-500/10 rounded-full animate-float-delayed"></div>
        <div className="absolute top-1/3 right-1/4 w-28 h-28 bg-yellow-500/10 rounded-full animate-float"></div>
      </div>

      {/* Back to Home Button */}
      <Link
        to="/"
        className={`absolute top-6 left-6 flex items-center gap-2 text-white/80 hover:text-white transition-all duration-300 hover:scale-105 ${isPageLoaded ? 'animate-slide-in-left' : 'opacity-0'}`}
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Home</span>
      </Link>

      <div className={`w-full max-w-md space-y-8 ${isPageLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
              <div className="relative bg-primary/10 p-4 rounded-2xl border border-primary/20">
                <Code className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Create account</h1>
            <p className="text-muted-foreground">
              Join the AI Test Automation platform
            </p>
          </div>
        </div>

        {/* Signup Form */}
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign up</CardTitle>
            <CardDescription className="text-center">
              Create your account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your professional email"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    className="h-11 pr-10"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {emailValidation.isChecking && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {!emailValidation.isChecking && email && emailValidation.isValid && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {!emailValidation.isChecking && email && !emailValidation.isValid && emailValidation.message && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                {emailValidation.message && (
                  <p className={`text-xs ${emailValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {emailValidation.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Your Role
                </label>
                <Select value={role} onValueChange={setRole} required>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select your professional role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="developer">
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Developer</div>
                          <div className="text-xs text-muted-foreground">Software Engineer, Programmer</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="tester">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Tester</div>
                          <div className="text-xs text-muted-foreground">QA Engineer, Test Analyst</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="product_manager">
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Product Manager</div>
                          <div className="text-xs text-muted-foreground">PM, Product Owner</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create account
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sign in link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 gap-4 pt-8">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-sm">What you'll get</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• AI-powered code analysis</li>
              <li>• Automated test generation</li>
              <li>• Multi-language support</li>
              <li>• Security vulnerability detection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
