import { useState, useEffect } from 'react';
import { Users, Briefcase, FileText, IndianRupee, Clock, CheckCircle, Loader2, Plus, Activity, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [stats, setStats] = useState({ totalClients: 0, activeMatters: 0, completedMatters: 0, pendingDocs: 0, pendingPayments: 0, overdueMatters: 0, paidPayments: 0 });
  const [urgentTasks, setUrgentTasks] = useState<any[]>([]);
  const [complianceDeadlines, setComplianceDeadlines] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [matterPipeline, setMatterPipeline] = useState<any[]>([]);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Core Stats
      const { count: clientsCount } = await supabase.from('clients').select('*', { count: 'exact', head: true });
      const { data: matters } = await supabase.from('matters').select('*');
      const { count: docsCount } = await supabase.from('documents').select('*', { count: 'exact', head: true }).eq('status', 'Pending');
      const { data: fees } = await supabase.from('fees').select('*');

      // Process Matters
      const activeMatters = matters?.filter(m => m.status !== 'Completed' && m.status !== 'Filed').length || 0;
      const completedMatters = matters?.filter(m => m.status === 'Completed' || m.status === 'Filed').length || 0;
      const overdueMatters = matters?.filter(m => new Date(m.due_date) < new Date() && m.status !== 'Completed' && m.status !== 'Filed').length || 0;
      
      // Pipeline Data for Bar Chart
      const pipelineMap: Record<string, number> = { 'Preparation': 0, 'Pending Client Info': 0, 'Ready for Filing': 0, 'Filed': 0, 'Completed': 0 };
      matters?.forEach(m => {
        if (pipelineMap[m.status] !== undefined) pipelineMap[m.status]++;
      });
      const pipelineData = Object.keys(pipelineMap).map(key => ({ name: key, value: pipelineMap[key] }));
      setMatterPipeline(pipelineData);

      // Process Fees
      const pendingPayments = fees?.reduce((sum, f) => sum + Number(f.balance || 0), 0) || 0;
      const paidPayments = fees?.reduce((sum, f) => sum + Number(f.paid_amount || 0), 0) || 0;

      setStats({
        totalClients: clientsCount || 0,
        activeMatters,
        completedMatters,
        pendingDocs: docsCount || 0,
        pendingPayments,
        paidPayments,
        overdueMatters
      });

      // 2. Fetch Urgent Tasks
      const { data: tasks } = await supabase.from('tasks').select('*, matters(matter_id_serial)').eq('status', 'In Progress').order('due_date', { ascending: true }).limit(4);
      setUrgentTasks(tasks || []);

      // 3. Fetch Compliance Deadlines (Tasks close to due date)
      const { data: compliance } = await supabase.from('tasks').select('*, matters(matter_id_serial)').eq('status', 'In Progress').order('due_date', { ascending: true }).limit(3);
      setComplianceDeadlines(compliance || []); 

      // 4. Fetch Activity Feed (Merge recent clients and documents)
      const { data: recentClients } = await supabase.from('clients').select('id, name, created_at').order('created_at', { ascending: false }).limit(3);
      const { data: recentDocs } = await supabase.from('documents').select('id, name, created_at').order('created_at', { ascending: false }).limit(3);
      
      const combinedActivities = [
        ...(recentClients || []).map(c => ({ id: `c-${c.id}`, title: `New client onboarded: ${c.name}`, date: c.created_at, type: 'client' })),
        ...(recentDocs || []).map(d => ({ id: `d-${d.id}`, title: `Document uploaded: ${d.name}`, date: d.created_at, type: 'document' }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
      
      setActivities(combinedActivities);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const subscription = supabase.channel('public:all').on('postgres_changes', { event: '*', schema: 'public' }, () => {
      fetchDashboardData();
    }).subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, []);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center text-muted">
        <Loader2 className="animate-spin mr-2" size={24} /> Loading Advanced Dashboard...
      </div>
    );
  }

  const COLORS = ['#10b981', '#ef4444']; 
  const pieData = [
    { name: 'Collected', value: stats.paidPayments },
    { name: 'Pending Balance', value: stats.pendingPayments }
  ];

  return (
    <div className="pb-8">
      {/* HEADER & QUICK ACTIONS */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="h2">Dashboard</h1>
          <p className="text-muted text-sm mt-1">Real-time overview of your firm's performance and pipeline.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => navigate('/clients/new')}><Plus size={16} /> Client</button>
          <button className="btn btn-secondary" onClick={() => navigate('/matters/new')}><Briefcase size={16} /> Matter</button>
          <button className="btn btn-primary" onClick={() => navigate('/fees')}><IndianRupee size={16} /> Invoice</button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card p-4 flex items-center justify-between border-l-4" style={{ borderColor: 'var(--primary)' }}>
          <div><p className="text-xs text-muted font-medium mb-1 uppercase tracking-wider">Total Clients</p><h3 className="h3">{stats.totalClients}</h3></div>
          <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center"><Users size={20} /></div>
        </div>
        <div className="card p-4 flex items-center justify-between border-l-4" style={{ borderColor: 'var(--warning)' }}>
          <div><p className="text-xs text-muted font-medium mb-1 uppercase tracking-wider">Active Matters</p><h3 className="h3">{stats.activeMatters}</h3></div>
          <div className="w-10 h-10 rounded-full bg-warning-light text-warning flex items-center justify-center"><Briefcase size={20} /></div>
        </div>
        <div className="card p-4 flex items-center justify-between border-l-4" style={{ borderColor: 'var(--danger)' }}>
          <div><p className="text-xs text-muted font-medium mb-1 uppercase tracking-wider">Pending Docs</p><h3 className="h3">{stats.pendingDocs}</h3></div>
          <div className="w-10 h-10 rounded-full bg-danger-light text-danger flex items-center justify-center"><FileText size={20} /></div>
        </div>
        <div className="card p-4 flex items-center justify-between border-l-4" style={{ borderColor: 'var(--success)' }}>
          <div><p className="text-xs text-muted font-medium mb-1 uppercase tracking-wider">Completed Matters</p><h3 className="h3">{stats.completedMatters}</h3></div>
          <div className="w-10 h-10 rounded-full bg-success-light text-success flex items-center justify-center"><CheckCircle size={20} /></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* REVENUE CHART */}
        <div className="col-span-1 card flex flex-col">
          <h3 className="h4 mb-4">Financial Overview</h3>
          <div className="flex-1 flex items-center justify-center relative min-h-[220px]">
            {stats.paidPayments === 0 && stats.pendingPayments === 0 ? (
              <p className="text-muted text-sm">No financial data yet.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs text-muted">Total Balance</span>
                  <span className="font-bold h4 m-0">₹{stats.pendingPayments.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* MATTER PIPELINE CHART */}
        <div className="col-span-2 card">
          <h3 className="h4 mb-4">Matter Pipeline</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={matterPipeline} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'var(--bg-main)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* URGENT TASKS */}
        <div className="col-span-1 card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="h4 flex items-center gap-2"><Clock size={18} className="text-warning"/> Urgent Tasks</h3>
            <Link to="/tasks" className="text-xs text-primary hover:underline">View All</Link>
          </div>
          <div className="flex flex-col gap-3">
            {urgentTasks.length === 0 ? <p className="text-muted text-sm text-center py-4">All caught up!</p> : urgentTasks.map((task, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-md bg-[var(--bg-main)]">
                <input type="checkbox" className="mt-1" onChange={() => toast.success('Task marked as complete!')} />
                <div>
                  <h4 className="text-sm font-semibold">{task.task_name}</h4>
                  <p className="text-xs text-muted mt-1">Due: {format(new Date(task.due_date), 'MMM dd')} • {task.matters?.matter_id_serial}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COMPLIANCE DEADLINES */}
        <div className="col-span-1 card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="h4 flex items-center gap-2"><Calendar size={18} className="text-danger"/> Compliance Deadlines</h3>
            <Link to="/compliance" className="text-xs text-primary hover:underline">Calendar</Link>
          </div>
          <div className="flex flex-col gap-3">
            {complianceDeadlines.length === 0 ? <p className="text-muted text-sm text-center py-4">No upcoming deadlines.</p> : complianceDeadlines.map((task, i) => (
              <div key={i} className="flex items-start gap-3 p-3 border-l-2 border-danger rounded-r-md bg-[var(--bg-main)]">
                <div>
                  <h4 className="text-sm font-semibold">{task.task_name}</h4>
                  <p className="text-xs text-muted mt-1">{task.matters?.matter_id_serial}</p>
                </div>
                <div className="ml-auto text-right">
                  <span className="text-xs font-medium text-danger block">{format(new Date(task.due_date), 'dd MMM')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ACTIVITY FEED */}
        <div className="col-span-1 card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="h4 flex items-center gap-2"><Activity size={18} className="text-success"/> Activity Feed</h3>
          </div>
          <div className="relative border-l-2 border-[var(--border-color)] ml-3 pl-4 flex flex-col gap-6 py-2">
            {activities.length === 0 ? <p className="text-muted text-sm text-center py-4 ml-[-1rem]">No recent activity.</p> : activities.map((act) => (
              <div key={act.id} className="relative">
                <div className="absolute -left-[1.35rem] top-1 w-3 h-3 rounded-full bg-[var(--bg-card)] border-2 border-primary"></div>
                <p className="text-sm font-medium leading-tight">{act.title}</p>
                <p className="text-xs text-muted mt-1">{format(new Date(act.date), 'MMM dd, h:mm a')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
