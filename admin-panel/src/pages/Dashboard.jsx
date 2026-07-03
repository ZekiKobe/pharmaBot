import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import StatCard from '../components/StatCard';
import { PostsAreaChart, RevenueBarChart, StatusPieChart, TypePieChart } from '../components/Charts';
import LoadingSpinner from '../components/LoadingSpinner';
import { IconDashboard, IconClock, IconPosts, IconTrending, IconChannel } from '../components/Icons';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getDashboard(), api.getAnalytics()])
      .then(([statsRes, analyticsRes]) => {
        setStats(statsRes.data);
        setAnalytics(analyticsRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading dashboard..." />;
  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Posts" value={stats.totalPosts} icon={IconPosts} accent="blue" />
        <StatCard title="Pending Review" value={stats.pendingPosts} icon={IconClock} accent="amber" />
        <StatCard title="Approved" value={stats.approvedPosts} icon={IconDashboard} accent="emerald" />
        <StatCard title="Rejected" value={stats.rejectedPosts} icon={IconPosts} accent="red" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Revenue" value={`ETB ${stats.totalRevenue.toLocaleString()}`} icon={IconTrending} accent="violet" />
        <StatCard title="Today" value={`ETB ${stats.dailyRevenue.toLocaleString()}`} icon={IconTrending} accent="emerald" />
        <StatCard title="This Month" value={`ETB ${stats.monthlyRevenue.toLocaleString()}`} icon={IconTrending} accent="teal" />
      </div>

      {analytics && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <h3 className="text-sm font-bold text-slate-900">Posts (Last 7 Days)</h3>
            <p className="mb-4 text-xs text-slate-400">New submissions per day</p>
            <PostsAreaChart data={analytics.postsByDay} />
          </div>
          <div className="card p-6">
            <h3 className="text-sm font-bold text-slate-900">Revenue (Last 7 Days)</h3>
            <p className="mb-4 text-xs text-slate-400">Approved payments (ETB)</p>
            <RevenueBarChart data={analytics.revenueByDay} />
          </div>
          <div className="card p-6">
            <h3 className="text-sm font-bold text-slate-900">Posts by Status</h3>
            <p className="mb-2 text-xs text-slate-400">Approval breakdown</p>
            <StatusPieChart data={analytics.byStatus} />
          </div>
          <div className="card p-6">
            <h3 className="text-sm font-bold text-slate-900">Buyer vs Seller</h3>
            <p className="mb-2 text-xs text-slate-400">Post type distribution</p>
            <TypePieChart data={analytics.byType} />
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-600">
              <IconChannel className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-teal-900">Telegram publish channels</p>
              <p className="text-sm text-teal-800/80">
                Add channels where approved posts are published by the bot
              </p>
            </div>
          </div>
          <Link to="/channels" className="btn-primary shrink-0">
            Manage channels
          </Link>
        </div>
      </div>

      {stats.pendingPosts > 0 && (
        <div className="overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                <IconClock className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-amber-900">
                  {stats.pendingPosts} post{stats.pendingPosts !== 1 ? 's' : ''} awaiting review
                </p>
                <p className="text-sm text-amber-700/80">Verify payments and approve for publication</p>
              </div>
            </div>
            <Link to="/pending" className="btn-primary shrink-0 bg-amber-600 hover:bg-amber-700">
              Review now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
