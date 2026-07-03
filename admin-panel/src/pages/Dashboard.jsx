import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import StatCard from '../components/StatCard';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import { IconClock, IconTrending } from '../components/Icons';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getDashboard()
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading dashboard..." />;

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Monitor marketplace activity and revenue at a glance"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Posts" value={stats.totalPosts} color="blue" subtitle="All time" />
        <StatCard title="Pending Review" value={stats.pendingPosts} color="amber" subtitle="Awaiting action" />
        <StatCard title="Approved" value={stats.approvedPosts} color="emerald" subtitle="Published" />
        <StatCard title="Rejected" value={stats.rejectedPosts} color="red" subtitle="Declined" />
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <IconTrending className="h-5 w-5 text-slate-400" />
          <h2 className="text-base font-semibold text-slate-900">Revenue</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Total Revenue"
            value={`ETB ${stats.totalRevenue.toLocaleString()}`}
            color="violet"
            subtitle="All approved payments"
          />
          <StatCard
            title="Today"
            value={`ETB ${stats.dailyRevenue.toLocaleString()}`}
            color="emerald"
            subtitle="Daily earnings"
          />
          <StatCard
            title="This Month"
            value={`ETB ${stats.monthlyRevenue.toLocaleString()}`}
            color="blue"
            subtitle="Monthly earnings"
          />
        </div>
      </div>

      {stats.pendingPosts > 0 && (
        <div className="mt-8 overflow-hidden rounded-xl border border-amber-200/60 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center justify-between px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <IconClock />
              </div>
              <div>
                <p className="font-semibold text-amber-900">
                  {stats.pendingPosts} post{stats.pendingPosts !== 1 ? 's' : ''} need your review
                </p>
                <p className="text-sm text-amber-700/80">
                  Verify payments and approve listings for publication
                </p>
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
