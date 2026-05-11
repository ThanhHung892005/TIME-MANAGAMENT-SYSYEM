import { Modal } from './Modal';

const SHORTCUTS = [
  { key: 'N', description: 'New task' },
  { key: 'D', description: 'Dashboard' },
  { key: 'T', description: 'Tasks' },
  { key: 'C', description: 'Calendar' },
  { key: 'P', description: 'Pomodoro' },
  { key: 'A', description: 'Analytics' },
  { key: '?', description: 'Show shortcuts' },
  { key: 'Esc', description: 'Close modal' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" size="sm">
      <div className="grid grid-cols-2 gap-3 py-1">
        {SHORTCUTS.map(({ key, description }) => (
          <div key={key} className="flex items-center gap-3">
            <kbd className="min-w-[2rem] text-center px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-200">
              {key}
            </kbd>
            <span className="text-sm text-gray-600 dark:text-gray-400">{description}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}
