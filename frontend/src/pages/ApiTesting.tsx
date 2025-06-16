import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Brain, Zap, Globe, Bot, Sparkles, Shield, CheckCircle } from 'lucide-react';
import ApiKeyTester from '@/components/ApiKeyTester';
// import * as anime from 'animejs';

const ApiTesting = () => {
  useEffect(() => {
    // Animations temporarily disabled
    // anime.timeline({
    //   easing: 'easeOutExpo',
    // })
    // .add({
    //   targets: '.page-header',
    //   translateY: [50, 0],
    //   opacity: [0, 1],
    //   duration: 800,
    // })
    // .add({
    //   targets: '.api-tester',
    //   translateY: [30, 0],
    //   opacity: [0, 1],
    //   duration: 600,
    // }, '-=400')
    // .add({
    //   targets: '.feature-card',
    //   translateY: [20, 0],
    //   opacity: [0, 1],
    //   duration: 500,
    //   delay: anime.stagger(100),
    // }, '-=300');
  }, []);

  const supportedApis = [
    {
      name: 'OpenAI',
      icon: Brain,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      description: 'GPT-3.5, GPT-4, and other OpenAI models',
      features: ['Chat Completions', 'Code Generation', 'Text Analysis']
    },
    {
      name: 'DeepSeek',
      icon: Zap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      description: 'Specialized coding and reasoning models',
      features: ['Code Analysis', 'Bug Detection', 'Performance Optimization']
    },
    {
      name: 'Hugging Face',
      icon: Bot,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      description: 'Access to thousands of open-source models',
      features: ['Model Inference', 'Custom Models', 'Community Models']
    },
    {
      name: 'Anthropic Claude',
      icon: Sparkles,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      description: 'Claude 3 models for advanced reasoning',
      features: ['Long Context', 'Safety Focused', 'Advanced Reasoning']
    },
    {
      name: 'Google AI',
      icon: Globe,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      description: 'Gemini Pro and other Google AI models',
      features: ['Multimodal', 'Fast Inference', 'Large Context']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 pt-20">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="page-header mb-12">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/">
              <Button variant="ghost" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              API Key Testing
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Test and validate your AI API keys from multiple providers. Ensure your integrations are working correctly before deploying.
            </p>
          </div>
        </div>

        {/* API Key Tester */}
        <div className="api-tester mb-16">
          <ApiKeyTester />
        </div>

        {/* Supported APIs */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Supported AI Providers
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Test API keys from leading AI providers and ensure seamless integration
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportedApis.map((api, index) => (
              <Card key={api.name} className="feature-card hover:shadow-xl transition-all duration-300 group hover:scale-105">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl ${api.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <api.icon className={`h-6 w-6 ${api.color}`} />
                  </div>
                  <CardTitle className="text-xl">{api.name}</CardTitle>
                  <CardDescription>{api.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {api.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Security Notice */}
        <div className="max-w-4xl mx-auto mt-16">
          <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <Shield className="h-5 w-5" />
                Security Notice
              </CardTitle>
            </CardHeader>
            <CardContent className="text-yellow-700 dark:text-yellow-300">
              <ul className="space-y-2 text-sm">
                <li>• API keys are only used for testing and are not stored on our servers</li>
                <li>• All API requests are made directly from your browser to the respective providers</li>
                <li>• We recommend using test API keys or keys with limited permissions</li>
                <li>• Never share your API keys publicly or commit them to version control</li>
                <li>• Rotate your API keys regularly for enhanced security</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Ready to Start Analyzing Code?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Once your API keys are validated, you can start using our AI-powered code analysis tools
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                Get Started Free
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" className="px-8 py-3">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTesting;
