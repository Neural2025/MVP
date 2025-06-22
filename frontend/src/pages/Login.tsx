import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Code, Sparkles, ArrowLeft, Mail, Lock } from "lucide-react";

const Login = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/10 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-blue-500/10 rounded-full animate-float-delayed"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-pink-500/10 rounded-full animate-float"></div>
        <div className="absolute bottom-1/3 left-1/3 w-20 h-20 bg-cyan-500/10 rounded-full animate-float-delayed"></div>
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
        <div className={`text-center space-y-4 ${isPageLoaded ? 'animate-slide-in-top' : 'opacity-0'}`} style={{animationDelay: '0.2s'}}>
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/30 blur-xl rounded-full animate-pulse-glow"></div>
              <div className="relative bg-white/10 backdrop-blur-lg p-4 rounded-2xl border border-white/20 hover-glow">
                <Code className="h-8 w-8 text-white animate-color-shift" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white animate-gradient bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">Welcome back</h1>
            <p className="text-gray-300">
              Sign in to your AI Test Automation account
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card className={`border-white/20 shadow-2xl bg-white/10 backdrop-blur-lg hover-lift ${isPageLoaded ? 'animate-scale-in' : 'opacity-0'}`} style={{animationDelay: '0.4s'}}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-white">Sign in</CardTitle>
            <CardDescription className="text-center text-gray-300">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-white flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-white/10 border-white/20 text-white placeholder:text-gray-400 input-focus"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-white flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 bg-white/10 border-white/20 text-white placeholder:text-gray-400 input-focus"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white border-0 btn-animate hover-glow"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-color-shift" />
                    Sign in
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sign up link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 gap-4 pt-8">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-sm">AI-Powered Code Analysis</h3>
            <p className="text-xs text-muted-foreground">
              Get intelligent insights and automated test generation for any programming language
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
