import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import useStatsTracking from '@/hooks/useStatsTracking';
import useSimpleScrollAnimation from '@/hooks/useSimpleScrollAnimation';
import {
  Brain,
  Code,
  TestTube,
  Shield,
  Zap,
  GitBranch as GitHubIcon,
  ArrowRight,
  Sparkles,
  Cpu,
  Database,
  Globe,
  Rocket,
  Target,
  Activity,
  TrendingUp,
  Users,
  CheckCircle,
  Star
} from 'lucide-react';

const Home = () => {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const ctaRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use custom hooks
  const { stats, isLoading: statsLoading } = useStatsTracking();
  const { registerElementsBySelector, autoRegisterElements } = useSimpleScrollAnimation({
    threshold: 0.1,
    rootMargin: '100px',
    triggerOnce: true
  });

  useEffect(() => {
    // Loading animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Register scroll animations after loading
    const setupAnimations = () => {
      // Register different element types with staggered animations
      registerElementsBySelector('.hero-element', 'slide-up', 200);
      registerElementsBySelector('.feature-card', 'zoom-in', 150);
      registerElementsBySelector('.stat-item', 'slide-up', 200);

      // Auto-register elements with data-animate attribute
      autoRegisterElements();
    };

    // Wait for loading to complete, then setup animations
    setTimeout(setupAnimations, 1100);

    return () => {
      clearTimeout(timer);
    };
  }, [registerElementsBySelector, autoRegisterElements]);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced code analysis using multiple AI APIs including OpenAI, DeepSeek, and Hugging Face',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: TestTube,
      title: 'Smart Test Generation',
      description: 'Automatically generate comprehensive test suites with edge cases and security tests',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Shield,
      title: 'Security Scanning',
      description: 'Identify vulnerabilities and security issues with detailed fix recommendations',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Zap,
      title: 'Performance Optimization',
      description: 'Get performance insights and optimization suggestions for faster code',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Code,
      title: 'Multi-Language Support',
      description: 'Support for 30+ programming languages including Python, JavaScript, Java, C++, Rust, Go, and more',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: GitHubIcon,
      title: 'GitHub Integration',
      description: 'Analyze entire repositories directly from GitHub URLs with smart file processing',
      gradient: 'from-gray-700 to-gray-900'
    }
  ];

  // Dynamic stats from the hook
  const dynamicStats = [
    {
      number: stats.linesAnalyzed || 0,
      label: 'Lines of Code Analyzed',
      suffix: '+',
      icon: Code,
      color: 'from-blue-400 to-cyan-400'
    },
    {
      number: stats.languagesUsed || 0,
      label: 'Programming Languages',
      suffix: '+',
      icon: Globe,
      color: 'from-green-400 to-emerald-400'
    },
    {
      number: stats.apisSupported || 5,
      label: 'AI APIs Supported',
      suffix: '+',
      icon: Database,
      color: 'from-purple-400 to-pink-400'
    },
    {
      number: stats.accuracyRate || 0,
      label: 'Accuracy Rate',
      suffix: '%',
      icon: Target,
      color: 'from-orange-400 to-red-400'
    }
  ];

  // Loading Screen
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-pink-500/30 border-b-pink-500 rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">AI QA Assistant</h2>
          <p className="text-purple-300 animate-pulse">Loading amazing experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/20 to-secondary/20 text-foreground overflow-hidden animate-fade-in">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle absolute w-2 h-2 bg-primary rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Floating Icons */}
          <div className="absolute inset-0 pointer-events-none">
            <Brain className="floating-icon absolute top-20 left-20 h-8 w-8 text-purple-400 opacity-60 animate-float" />
            <Code className="floating-icon absolute top-32 right-32 h-6 w-6 text-blue-400 opacity-60 animate-float-delayed" />
            <TestTube className="floating-icon absolute bottom-40 left-32 h-7 w-7 text-green-400 opacity-60 animate-float" />
            <Shield className="floating-icon absolute bottom-32 right-20 h-8 w-8 text-yellow-400 opacity-60 animate-float-delayed" />
            <Cpu className="floating-icon absolute top-40 left-1/2 h-6 w-6 text-pink-400 opacity-60 animate-float" />
            <Database className="floating-icon absolute bottom-20 left-1/2 h-7 w-7 text-cyan-400 opacity-60 animate-float-delayed" />
          </div>

          <div className="hero-element" data-animate="slide-up" data-delay="0">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
              AI QA Assistant
            </h1>
            <div className="flex items-center justify-center gap-3 mb-8">
              <Sparkles className="h-8 w-8 text-accent animate-pulse" />
              <span className="text-2xl md:text-3xl font-semibold text-primary">
                Powered by Multiple AI APIs
              </span>
              <Sparkles className="h-8 w-8 text-accent animate-pulse" />
            </div>
          </div>

          <p className="hero-element text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto" data-animate="slide-up" data-delay="300">
            Revolutionary code analysis platform supporting OpenAI, DeepSeek, Hugging Face, Anthropic, and Google AI.
            Get intelligent insights, automated testing, and security analysis for 30+ programming languages.
          </p>

          <div className="hero-element flex flex-col sm:flex-row gap-6 justify-center items-center" data-animate="slide-up" data-delay="500">
            <Link to="/signup">
              <Button className="px-8 py-4 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105">
                <Rocket className="mr-2 h-5 w-5" />
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="px-8 py-4 text-lg border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300">
                <Globe className="mr-2 h-5 w-5" />
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need for comprehensive code analysis and quality assurance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card"
                data-animate="zoom-in"
                data-delay={index * 150}
              >
                <Card className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 group hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover-cyber">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 animate-cyberpunk-pulse`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-white animate-neon-glow">{feature.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 px-6 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Platform Statistics
            </h2>
            <p className="text-xl text-gray-300">
              Real-time analytics from our AI-powered platform
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {dynamicStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="stat-item"
                  data-animate="slide-up"
                  data-delay={index * 200}
                >
                  <div className="text-center group hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 transition-all duration-500 hover-cyber particle-system">
                    <div className="flex justify-center mb-4">
                      <div className={`p-4 rounded-xl bg-gradient-to-r ${stat.color} group-hover:scale-110 transition-transform duration-300 animate-cyberpunk-pulse`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className={`text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent animate-neon-glow`}>
                      <span className="stat-number" data-count={stat.number}>
                        {statsLoading ? '0' : stat.number.toLocaleString()}
                      </span>
                      <span>{stat.suffix}</span>
                    </div>
                    <p className="text-gray-300 font-medium">{stat.label}</p>

                    {/* Animated progress bar */}
                    <div className="mt-4 w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-2000 ease-out animate-data-stream`}
                        style={{
                          width: statsLoading ? '0%' : '100%',
                          transitionDelay: `${index * 200 + 500}ms`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Ready to Transform Your Code Quality?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join thousands of developers using AI-powered code analysis
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/signup">
              <Button className="px-10 py-4 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105">
                <Brain className="mr-2 h-5 w-5" />
                Start Analyzing Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
