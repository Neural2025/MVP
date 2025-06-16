import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
// import * as anime from 'animejs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Brain,
  Code,
  TestTube,
  Shield,
  Zap,
  Github as GitHubIcon,
  ArrowRight,
  Sparkles,
  Cpu,
  Database,
  Globe,
  Rocket
} from 'lucide-react';

const Home = () => {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    // Animations temporarily disabled for compatibility
    // Will be re-enabled once anime.js import is fixed
  }, []);

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

  const stats = [
    { number: 50000, label: 'Lines of Code Analyzed', suffix: '+' },
    { number: 30, label: 'Programming Languages', suffix: '+' },
    { number: 5, label: 'AI APIs Supported', suffix: '+' },
    { number: 99, label: 'Accuracy Rate', suffix: '%' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle absolute w-2 h-2 bg-white rounded-full opacity-20"
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
            <Brain className="floating-icon absolute top-20 left-20 h-8 w-8 text-purple-400 opacity-60" />
            <Code className="floating-icon absolute top-32 right-32 h-6 w-6 text-blue-400 opacity-60" />
            <TestTube className="floating-icon absolute bottom-40 left-32 h-7 w-7 text-green-400 opacity-60" />
            <Shield className="floating-icon absolute bottom-32 right-20 h-8 w-8 text-yellow-400 opacity-60" />
            <Cpu className="floating-icon absolute top-40 left-1/2 h-6 w-6 text-pink-400 opacity-60" />
            <Database className="floating-icon absolute bottom-20 left-1/2 h-7 w-7 text-cyan-400 opacity-60" />
          </div>

          <div className="hero-title">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              AI QA Assistant
            </h1>
            <div className="flex items-center justify-center gap-3 mb-8">
              <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
              <span className="text-2xl md:text-3xl font-semibold text-purple-300">
                Powered by Multiple AI APIs
              </span>
              <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
            </div>
          </div>

          <p className="hero-subtitle text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto">
            Revolutionary code analysis platform supporting OpenAI, DeepSeek, Hugging Face, Anthropic, and Google AI.
            Get intelligent insights, automated testing, and security analysis for 30+ programming languages.
          </p>

          <div className="hero-buttons flex flex-col sm:flex-row gap-6 justify-center items-center">
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
              <Card key={index} className="feature-card bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300 group hover:scale-105">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-white">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 px-6 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  <span className="stat-number" data-count={stat.number}>0</span>
                  <span>{stat.suffix}</span>
                </div>
                <p className="text-gray-300 font-medium">{stat.label}</p>
              </div>
            ))}
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
