import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, TestTube, Shield } from 'lucide-react';
import { Navigate } from 'react-router-dom';

// Define the User interface to ensure type safety
interface User {
  role?: string;
}

// Define the TestSuiteOption interface for type safety
interface TestSuiteOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TestSuites: React.FC = () => {
  const { user } = useAuth() as { user: User | null };

  // Only allow testers
  if (!user || user.role?.toLowerCase() !== 'tester') {
    return <Navigate to="/" replace />;
  }

  // Test suite options for testers
  const testSuiteOptions: TestSuiteOption[] = [
    { id: 'functionality', label: 'Functionality Testing', icon: Code },
    { id: 'security', label: 'Security Testing', icon: Shield },
    { id: 'bias', label: 'Bias Testing', icon: TestTube },
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-black">Test Suites</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testSuiteOptions.map((option) => (
          <Card key={option.id} className="hover:shadow-lg transition-shadow bg-white border border-gray-300">
            <CardHeader>
              <option.icon className="w-8 h-8 mb-2 text-black" />
              <CardTitle className="text-black">{option.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => window.location.href = `/test-suites/${option.id}`} className="bg-black text-white">
                Start {option.label}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TestSuites;