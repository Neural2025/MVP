import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, Mail, Shield, CheckCircle, AlertCircle, User, Lock, ArrowLeft } from "lucide-react";

const Signup = () => {
  const { signup, isAuthenticated, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [team, setTeam] = useState("");
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [newTeam, setNewTeam] = useState("");
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);
    // Fetch teams from backend
    fetch('/api/teams', {
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => setTeams(Array.isArray(data) ? data : []))
      .catch(() => setTeams([]));
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

    if (!isCreatingTeam && !team) {
      alert("Please select a team or create a new one");
      return;
    }
    if (isCreatingTeam && !newTeam.trim()) {
      alert("Please enter a new team name");
      return;
    }

    setIsSubmitting(true);

    try {
      let teamId = team;
      if (isCreatingTeam && newTeam.trim()) {
        // Create new team
        const res = await fetch('/api/teams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newTeam.trim() })
        });
        const data = await res.json();
        if (data && data._id) {
          teamId = data._id;
        } else {
          alert('Failed to create team');
          setIsSubmitting(false);
          return;
        }
      }
      await signup(name, email, password, role, teamId);
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100 text-gray-900 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-blue-500/10 rounded-full animate-float-delayed"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-blue-500/10 rounded-full animate-float"></div>
        <div className="absolute bottom-1/3 left-1/3 w-20 h-20 bg-blue-500/10 rounded-full animate-float-delayed"></div>
        <div className="absolute top-1/3 right-1/4 w-28 h-28 bg-blue-500/10 rounded-full animate-float"></div>
      </div>

      {/* Back to Home Button */}
      <Link
        to="/"
        className={`absolute top-6 left-6 flex items-center gap-2 text-gray-900 hover:text-gray-700 transition-all duration-300 hover:scale-105 ${isPageLoaded ? 'animate-slide-in-left' : 'opacity-0'}`}
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Home</span>
      </Link>

      <div className={`w-full max-w-md space-y-8 ${isPageLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="relative bg-white p-4 rounded-2xl border border-gray-300">
                <UserPlus className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
            <p className="text-gray-600">
              Sign up to start using AI Test Automation
            </p>
          </div>
        </div>

        {/* Signup Form */}
        <Card className="border-gray-300 shadow-lg bg-white">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign up</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Enter your details to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  className="h-11 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                />
                <div className="flex items-center">
                  <div className="flex-1">
                    {emailValidation.isChecking && (
                      <Loader2 className="h-4 w-4 animate-spin" />
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
                <label htmlFor="role" className="text-sm font-medium">
                  Role
                </label>
                <Select
                  value={role}
                  onValueChange={setRole}
                  required
                >
                  <SelectTrigger id="role" className="h-11">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="tester">Tester</SelectItem>
                    <SelectItem value="po">Product Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-blue-500 text-white"
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
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-500 hover:text-blue-700 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 gap-4 pt-8">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-sm">What you'll get</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li> AI-powered code analysis</li>
              <li> Automated test generation</li>
              <li> Multi-language support</li>
              <li> Security vulnerability detection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
