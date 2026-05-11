import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router-dom';
import { useTaskStore } from '@/store/taskStore';

export function useKeyboardShortcuts(onShowHelp: () => void) {
  const navigate = useNavigate();
  const { openForm } = useTaskStore();

  useHotkeys('n', () => { navigate('/tasks'); openForm(); });
  useHotkeys('d', () => navigate('/'));
  useHotkeys('t', () => navigate('/tasks'));
  useHotkeys('c', () => navigate('/calendar'));
  useHotkeys('p', () => navigate('/pomodoro'));
  useHotkeys('a', () => navigate('/analytics'));
  useHotkeys('shift+/', onShowHelp);
}
