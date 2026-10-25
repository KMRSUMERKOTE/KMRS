import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';

function Card({ step, title, status, done, to, cta }) {
  return (
    <div className={`card flex flex-col justify-between border-t-4 p-5 transition-shadow hover:shadow-md ${done ? 'border-t-forest-700' : 'border-t-ochre-500'}`}>
      <div>
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
              done ? 'bg-forest-700 text-white' : 'bg-ochre-100 text-ochre-800'
            }`}
          >
            {done ? '✓' : step}
          </span>
          <h2 className="font-serif text-lg font-semibold">{title}</h2>
        </div>
        <p className={`mt-3 text-sm font-medium ${done ? 'text-forest-700' : 'text-ochre-700'}`}>
          <span className="sr-only">{done ? 'Done: ' : 'To do: '}</span>
          {status}
        </p>
      </div>
      <Link to={to} className={`${done ? 'btn-outline' : 'btn-primary'} mt-4 self-start`}>{cta}</Link>
    </div>
  );
}

export default function TeacherDashboard() {
  const me = useFetch('/teachers/me');
  const mine = useFetch('/results/mine');

  if (me.loading || mine.loading) return <p role="status" className="text-slate-600">Loading…</p>;
  if (me.error) return <p role="alert" className="text-red-700">{me.error}</p>;

  const t = me.data.teacher;
  const profileDone =
    t.name && t.age && t.gender && t.phone && t.experienceYears !== undefined && t.experienceYears !== null && t.experienceYears !== '';
  const classCount = t.assignments?.length || 0;
  const resultCount = mine.data?.results?.length || 0;

  const steps = [
    { done: !!profileDone, to: '/teacher/profile', label: 'complete your profile' },
    { done: classCount > 0, to: '/teacher/classes', label: 'add the classes and subjects you teach' },
    { done: resultCount > 0, to: '/teacher/results', label: 'upload your first result' },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const next = steps.find((s) => !s.done);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">Welcome, {t.name}</h2>
        <p className="mt-1 text-slate-700">Keep your details up to date and publish examination results here.</p>
      </div>

      <section className="card p-5" aria-label="Your progress">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-semibold text-forest-900">{doneCount} of {steps.length} steps done</p>
          {next ? (
            <Link to={next.to} className="text-sm font-semibold underline">Next: {next.label}</Link>
          ) : (
            <p className="text-sm font-medium text-forest-700">Everything is set up.</p>
          )}
        </div>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-forest-100"
          role="progressbar"
          aria-label="Setup progress"
          aria-valuenow={doneCount}
          aria-valuemin={0}
          aria-valuemax={steps.length}
        >
          <div className="h-full rounded-full bg-forest-700 transition-all" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card
          step={1}
          title="Profile"
          done={!!profileDone}
          status={profileDone ? 'Profile details complete' : 'Some profile details are missing'}
          to="/teacher/profile"
          cta="Edit profile"
        />
        <Card
          step={2}
          title="Classes & Subjects"
          done={classCount > 0}
          status={classCount > 0 ? `${classCount} class–subject ${classCount === 1 ? 'entry' : 'entries'}` : 'No classes added yet'}
          to="/teacher/classes"
          cta="Manage classes"
        />
        <Card
          step={3}
          title="Results"
          done={resultCount > 0}
          status={resultCount > 0 ? `${resultCount} result ${resultCount === 1 ? 'document' : 'documents'} uploaded` : 'No results uploaded yet'}
          to="/teacher/results"
          cta="Upload results"
        />
      </div>
    </div>
  );
}
