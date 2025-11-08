import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { FileText, CheckCircle, AlertCircle, History } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface ValidationStats {
  totalValidations: number;
  successfulValidations: number;
  totalErrors: number;
  totalContainers: number;
  totalPallets: number;
  totalCartons: number;
}

interface ValidationHistoryItem {
  id: string;
  file_name: string;
  file_type: string;
  total_records: number;
  successful_records: number;
  error_records: number;
  created_at: string;
}

export const Dashboard = () => {
  const [stats, setStats] = useState<ValidationStats>({
    totalValidations: 0,
    successfulValidations: 0,
    totalErrors: 0,
    totalContainers: 0,
    totalPallets: 0,
    totalCartons: 0,
  });
  const [history, setHistory] = useState<ValidationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch validation history
      const { data: validations, error: validationsError } = await supabase
        .from('validation_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (validationsError) throw validationsError;

      setHistory(validations || []);

      // Calculate stats
      if (validations && validations.length > 0) {
        const calculatedStats: ValidationStats = {
          totalValidations: validations.length,
          successfulValidations: validations.filter(v => v.error_records === 0).length,
          totalErrors: validations.reduce((sum, v) => sum + (v.error_records || 0), 0),
          totalContainers: validations.reduce((sum, v) => sum + (v.total_containers || 0), 0),
          totalPallets: validations.reduce((sum, v) => sum + (v.total_pallets || 0), 0),
          totalCartons: validations.reduce((sum, v) => sum + (v.total_cartons || 0), 0),
        };
        setStats(calculatedStats);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Validations',
      value: stats.totalValidations,
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Successful',
      value: stats.successfulValidations,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-600/10',
    },
    {
      label: 'Total Errors',
      value: stats.totalErrors,
      icon: AlertCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      label: 'Total Containers',
      value: stats.totalContainers,
      icon: History,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-20 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Pallets</p>
              <p className="text-3xl font-bold">{stats.totalPallets}</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/10">
              <FileText className="h-8 w-8 text-secondary" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Cartons</p>
              <p className="text-3xl font-bold">{stats.totalCartons}</p>
            </div>
            <div className="p-4 rounded-lg bg-accent/10">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
          </div>
        </Card>
      </div>

      {/* Validation History */}
      <Card>
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Validation History
          </h2>
        </div>
        <div className="p-6">
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No validation history yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded ${item.error_records === 0 ? 'bg-green-600/10' : 'bg-destructive/10'}`}>
                      {item.error_records === 0 ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{item.file_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(item.created_at), 'PPp')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Records: {item.total_records}</p>
                    <p className="text-sm">
                      <span className="text-green-600">{item.successful_records} success</span>
                      {item.error_records > 0 && (
                        <span className="text-destructive ml-2">{item.error_records} errors</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
