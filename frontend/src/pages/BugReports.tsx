import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Bug, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

// Define interfaces for type safety
interface User {
  role?: string;
}

interface BugReport {
  id?: string;
  title?: string;
  description?: string;
  severity?: string;
  status?: string;
  createdAt?: string;
  language?: string;
  [key: string]: any;
}

const BugReports: React.FC = () => {
  const { user } = useAuth() as { user: User | null };

  // Allow Bug Reporting for developer, tester, PO/manager
  const allowedRoles = [
    'dev', 'developer', 'tester', 'test', 'qa',
    'po', 'product_owner', 'product owner', 'productowner', 'product manager', 'productmanager', 'pm', 'owner', 'manager', 'product_manager'
  ];
  if (!user || !allowedRoles.includes(user.role?.toLowerCase())) {
    return <Navigate to="/" replace />;
  }

  // Bug report creation state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [status, setStatus] = useState('open');
  const [language, setLanguage] = useState('javascript');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bug reports history state
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<BugReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  // Fetch bug reports from backend
  const fetchBugReports = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || token === 'null') {
        setBugReports([]);
        setFilteredReports([]);
        return;
      }

      const response = await fetch('/api/bug-reports', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: { data: { bugReports: BugReport[] } } = await response.json();
        setBugReports(data.data.bugReports || []);
        setFilteredReports(data.data.bugReports || []);
      } else {
        setBugReports([]);
        setFilteredReports([]);
      }
    } catch (error) {
      console.error('Failed to fetch bug reports:', error);
      setBugReports([]);
      setFilteredReports([]);
    } finally {
      setIsLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchBugReports();
  }, []);

  // Filter bug reports
  useEffect(() => {
    let filtered = bugReports;

    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((report) => report.status === statusFilter);
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter((report) => report.severity === severityFilter);
    }

    setFilteredReports(filtered);
  }, [bugReports, searchTerm, statusFilter, severityFilter]);

  // Export bug report to PDF
  const exportToPDF = async (bugReport: BugReport) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || token === 'null') {
        toast.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: 'bug-report',
          data: bugReport,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bug_report_${bugReport.id || 'unknown'}_${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('PDF exported successfully!');
      } else {
        toast.error('Failed to export PDF');
      }
    } catch (error) {
      toast.error('Export failed');
      console.error('Export error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
            Bug Reports
          </h1>
          <p className="text-xl text-gray-300">Manage bug reports for your project</p>
        </div>

        <Tabs defaultValue="reports" className="space-y-8">
          <TabsList className="grid w-full grid-cols-1 bg-white/10 backdrop-blur-lg">
            <TabsTrigger value="reports" className="data-[state=active]:bg-red-600">
              <FileText className="mr-2 h-4 w-4" />
              Bug Reports History
            </TabsTrigger>
          </TabsList>
          <TabsContent value="reports" className="space-y-6">
            {/* Bug Reports Filters */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle>Filter Bug Reports</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-black/20 border-white/20 text-white"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px] bg-black/20 border-white/20 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-[150px] bg-black/20 border-white/20 text-white">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Bug Reports List */}
            <div className="space-y-4">
              {isLoadingReports ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
                  <p className="text-gray-300">Loading bug reports...</p>
                </div>
              ) : filteredReports.length > 0 ? (
                filteredReports.map((report, index) => (
                  <Card
                    key={report.id || index}
                    className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-colors"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {report.title || 'Bug Report'}
                          </h3>
                          <p className="text-gray-300 text-sm mb-2">
                            {report.description || 'No description provided.'}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>
                              Created:{' '}
                              {report.createdAt
                                ? new Date(report.createdAt).toLocaleDateString()
                                : 'Unknown'}
                            </span>
                            {report.language && <span>Language: {report.language}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`${
                              report.severity === 'critical'
                                ? 'bg-red-600'
                                : report.severity === 'high'
                                ? 'bg-orange-600'
                                : report.status === 'in-progress'
                                ? 'bg-blue-600'
                                : report.status === 'closed'
                                ? 'bg-gray-600'
                                : 'bg-purple-600'
                            }`}
                          >
                            {report.status
                              ? report.status.charAt(0).toUpperCase() + report.status.slice(1)
                              : 'Open'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <Bug className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Bug Reports Found</h3>
                  <p className="text-gray-300 mb-4">No bug reports have been created yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Bug Report Creation Form */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 mt-8">
          <CardHeader>
            <CardTitle>Create New Bug Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-1">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Bug title"
                  className="bg-black/20 border-white/20 text-white"
                />
              </div>
              <div>
                <label className="block text-white mb-1">Language</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="bg-black/20 border-white/20 text-white">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-white mb-1">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the bug..."
                  rows={3}
                  className="bg-black/20 border-white/20 text-white"
                />
              </div>
              <div>
                <label className="block text-white mb-1">Severity</label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger className="bg-black/20 border-white/20 text-white">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-white mb-1">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-black/20 border-white/20 text-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              className="mt-4 bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
              onClick={async () => {
                if (!title.trim() || !description.trim()) {
                  toast.error('Title and description are required');
                  return;
                }
                setIsSubmitting(true);
                try {
                  const response = await fetch('/api/bug-reports', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                    },
                    body: JSON.stringify({ title, description, severity, status, language }),
                  });
                  if (response.ok) {
                    toast.success('Bug report created!');
                    setTitle('');
                    setDescription('');
                    setSeverity('medium');
                    setStatus('open');
                    setLanguage('javascript');
                    await fetchBugReports();
                  } else {
                    toast.error('Failed to create bug report');
                  }
                } catch (error) {
                  toast.error('Failed to create bug report');
                  console.error('Create bug report error:', error);
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Bug Report'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BugReports;