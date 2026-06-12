import { Link } from 'react-router-dom';
import { CheckSquare, Calendar, Timer, BarChart2, ArrowRight, Check, Zap, Shield, Sparkles } from 'lucide-react';

const FEATURES = [
  {
    icon: CheckSquare,
    title: 'Task Management',
    desc: 'Organize tasks with priorities, tags, deadlines, and subtasks. Drag & drop to reorder.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Calendar,
    title: 'Smart Calendar',
    desc: 'Visualize your schedule in month, week, or day view. Drag tasks to reschedule instantly.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: Timer,
    title: 'Pomodoro Timer',
    desc: 'Stay focused with work/break cycles. Track sessions and link them to your tasks.',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: BarChart2,
    title: 'Analytics',
    desc: 'Understand your productivity patterns. View completion trends and Pomodoro stats.',
    color: 'bg-emerald-50 text-emerald-600',
  },
];

const STEPS = [
  { num: '01', title: 'Create your tasks', desc: 'Add tasks with priorities, deadlines, and tags in seconds.' },
  { num: '02', title: 'Focus with Pomodoro', desc: 'Work in focused intervals, then take structured breaks.' },
  { num: '03', title: 'Track your progress', desc: 'Review analytics to continuously improve your workflow.' },
];

const PERKS = [
  'Google OAuth sign-in',
  'Drag & drop scheduling',
  'CSV, JSON & PDF export',
  'Keyboard shortcuts',
  'Email reminders',
  'Free to use',
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Timer className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-xl tracking-tight">TimeManager</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 transition-colors px-4 py-2 rounded-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-24 pb-20 px-6">
        {/* Background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-br from-blue-100 via-indigo-50 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — copy */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                All-in-one productivity app
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-6">
                Master your time.{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                  Achieve more.
                </span>
              </h1>
              <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
                A clean, focused workspace to manage tasks, stay on schedule, and build deep work habits — all in one place.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5"
                >
                  Start for free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border border-gray-200 transition-all hover:-translate-y-0.5"
                >
                  Sign in
                </Link>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {['Free to use', 'No credit card', 'Google sign-in'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — UI mockup */}
            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl blur-2xl opacity-50" />
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* Window bar */}
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="mx-auto text-xs text-gray-400 font-medium">TimeManager</span>
                </div>
                <div className="flex h-64">
                  {/* Mini sidebar */}
                  <div className="w-40 bg-gray-50 border-r border-gray-100 p-3 flex flex-col gap-1">
                    {[
                      { icon: BarChart2, label: 'Dashboard', active: false },
                      { icon: CheckSquare, label: 'Tasks', active: true },
                      { icon: Calendar, label: 'Calendar', active: false },
                      { icon: Timer, label: 'Pomodoro', active: false },
                    ].map(({ icon: Icon, label, active }) => (
                      <div
                        key={label}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium ${
                          active ? 'bg-blue-100 text-blue-700' : 'text-gray-500'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </div>
                    ))}
                  </div>
                  {/* Mini content */}
                  <div className="flex-1 p-4 space-y-2 overflow-hidden">
                    <div className="text-xs font-semibold text-gray-700 mb-3">My Tasks</div>
                    {[
                      { label: 'Design landing page', tag: 'Design', done: true, color: 'bg-violet-100 text-violet-600' },
                      { label: 'API integration', tag: 'Dev', done: false, color: 'bg-blue-100 text-blue-600' },
                      { label: 'Write unit tests', tag: 'Dev', done: false, color: 'bg-blue-100 text-blue-600' },
                      { label: 'Weekly review', tag: 'Planning', done: false, color: 'bg-amber-100 text-amber-600' },
                    ].map((t) => (
                      <div key={t.label} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                        <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${t.done ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                          {t.done && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
                        </div>
                        <span className={`flex-1 text-xs ${t.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{t.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${t.color}`}>{t.tag}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Floating timer card */}
                <div className="absolute bottom-6 right-4 bg-white rounded-xl shadow-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center">
                    <Timer className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Focus session</div>
                    <div className="text-lg font-bold text-gray-900 leading-none">24:13</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Everything you need to stay productive
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Four powerful modules that work seamlessly together.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Up and running in minutes
            </h2>
            <p className="text-gray-500 text-lg">Three steps to a more productive day.</p>
          </div>
          <div className="relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-8 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px bg-gradient-to-r from-blue-200 via-indigo-200 to-blue-200" />
            <div className="grid lg:grid-cols-3 gap-10">
              {STEPS.map(({ num, title, desc }) => (
                <div key={num} className="relative text-center">
                  <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-lg mb-5 shadow-lg shadow-blue-200">
                    {num}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Perks strip ── */}
      <section className="py-16 px-6 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8">
            What's included
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {PERKS.map((perk) => (
              <div key={perk} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-green-600" strokeWidth={2.5} />
                </div>
                <span className="text-sm font-medium text-gray-700">{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 mb-8 shadow-xl shadow-blue-200">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Ready to take control of your time?
          </h2>
          <p className="text-gray-500 text-lg mb-8">
            Join and start building better work habits today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5"
            >
              Create free account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border border-gray-200 transition-all hover:-translate-y-0.5"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Timer className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-gray-700 text-sm">TimeManager</span>
          </div>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} TimeManager. Built for focus.</p>
          <div className="flex items-center gap-5 text-xs text-gray-400">
            <Link to="/login" className="hover:text-gray-700 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-gray-700 transition-colors">Register</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
