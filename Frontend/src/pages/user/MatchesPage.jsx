import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../utils/api';

const MatchesPage = () => {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    API.get('/matches/my').then(({ data }) => setMatches(data));
  }, []);

  return (
    <DashboardLayout title="Matches" subtitle="Review your selection status and personal match performance.">
      <div className="space-y-4">
        {matches.length ? matches.map((match) => (
          <article key={match._id} className="rounded-3xl border border-[#17304a] bg-[#0d1b2a] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">{match.tournament || 'Match'}</p>
                <h3 className="mt-2 text-2xl font-black">{match.title}</h3>
                <p className="mt-2 text-sm text-slate-300">vs {match.opponent}</p>
              </div>
              <div className="text-right text-sm text-slate-400">
                <p>{new Date(match.date).toLocaleDateString()}</p>
                <p>{match.format || 'Standard format'}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3 text-sm text-slate-300">
              <div className="rounded-2xl bg-[#08111f] p-4">Runs: {match.myStats?.batting?.runs || 0}<br />Balls: {match.myStats?.batting?.balls || 0}<br />SR: {match.myStats?.batting?.strikeRate || 0}</div>
              <div className="rounded-2xl bg-[#08111f] p-4">Overs: {match.myStats?.bowling?.overs || 0}<br />Wickets: {match.myStats?.bowling?.wickets || 0}<br />Economy: {match.myStats?.bowling?.economy || 0}</div>
              <div className="rounded-2xl bg-[#08111f] p-4">Catches: {match.myStats?.fielding?.catches || 0}<br />Run-outs: {match.myStats?.fielding?.runOuts || 0}</div>
            </div>
          </article>
        )) : <p className="text-sm text-slate-400">You have not been listed in any matches yet.</p>}
      </div>
    </DashboardLayout>
  );
};

export default MatchesPage;
