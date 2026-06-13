import { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router-dom';
import { useTaskStore } from '@/store/taskStore';

const FORM_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

export function useKeyboardShortcuts(onShowHelp: () => void) {
  const navigate = useNavigate();
  const { openForm } = useTaskStore();

  useHotkeys('n', () => { navigate('/tasks'); openForm(); });
  useHotkeys('d', () => navigate('/dashboard'));
  useHotkeys('t', () => navigate('/tasks'));
  useHotkeys('c', () => navigate('/calendar'));
  useHotkeys('p', () => navigate('/pomodoro'));
  useHotkeys('a', () => navigate('/analytics'));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== '?') return;
      if (FORM_TAGS.has((e.target as HTMLElement).tagName)) return;
      if ((e.target as HTMLElement).isContentEditable) return;
      onShowHelp();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onShowHelp]);
}
