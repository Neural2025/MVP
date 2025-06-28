import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import useStatsTracking from '@/hooks/useStatsTracking';
import {
  Brain,
  Code,
  TestTube,
  Shield,
  Zap,
  GitBranch as GitHubIcon,
  Globe,
  Database,
  Target
} from 'lucide-react';

const Home = () => {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const ctaRef = useRef(null);

  const { stats } = useStatsTracking();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced code analysis using multiple AI APIs including OpenAI, DeepSeek, and Hugging Face',
    },
    {
      icon: TestTube,
      title: 'Smart Test Generation',
      description: 'Automatically generate comprehensive test suites with edge cases and security tests',
    },
    {
      icon: Shield,
      title: 'Security Scanning',
      description: 'Identify vulnerabilities and security issues with detailed fix recommendations',
    },
    {
      icon: Zap,
      title: 'Performance Optimization',
      description: 'Get performance insights and optimization suggestions for faster code',
    },
    {
      icon: Code,
      title: 'Multi-Language Support',
      description: 'Support for 30+ programming languages including Python, JavaScript, Java, C++, Rust, Go, and more',
    },
    {
      icon: GitHubIcon,
      title: 'GitHub Integration',
      description: 'Analyze entire repositories directly from GitHub URLs with smart file processing',
    }
  ];

  // Dynamic stats from the hook
  const dynamicStats = [
    {
      number: stats.linesAnalyzed || 0,
      label: 'Lines of Code Analyzed',
      suffix: '+',
      icon: Code,
    },
    {
      number: stats.languagesUsed || 0,
      label: 'Programming Languages',
      suffix: '+',
      icon: Globe,
    },
    {
      number: stats.apisSupported || 5,
      label: 'AI APIs Supported',
      suffix: '+',
      icon: Database,
    },
    {
      number: stats.accuracyRate || 0,
      label: 'Accuracy Rate',
      suffix: '%',
      icon: Target,
    }
  ];

  return (
    <div className="bg-white text-black">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to Our Platform</h1>
          <p className="text-xl mb-12">Empowering developers with AI-driven insights</p>
          <Link to="/signup">
            <Button className="px-10 py-4 text-lg bg-black text-white">
              <Brain className="mr-2 h-5 w-5" />
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Features</h2>
            <p className="text-xl">Explore the powerful features we offer</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="mb-6">
                    <Icon className="h-12 w-12 text-black" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-gray-700">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Platform Statistics</h2>
            <p className="text-xl">Real-time analytics from our AI-powered platform</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {dynamicStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    <Icon className="h-8 w-8 text-black" />
                  </div>
                  <div className="text-4xl font-bold mb-2">
                    <span>{stat.number.toLocaleString()}</span>
                    <span>{stat.suffix}</span>
                  </div>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Code Quality?</h2>
          <p className="text-xl mb-12">Join thousands of developers using AI-powered code analysis</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/signup">
              <Button className="px-10 py-4 text-lg bg-black text-white">
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
