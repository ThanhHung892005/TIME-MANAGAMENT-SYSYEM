import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '@/hooks/useTags';
import type { Tag } from '@/types';

const PRESET_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  '#F97316', '#6B7280',
];

interface TagManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EditState {
  id: string;
  name: string;
  color: string;
}

export function TagManager({ isOpen, onClose }: TagManagerProps) {
  const { data: tags = [] } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]!);
  const [editState, setEditState] = useState<EditState | null>(null);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    await createTag.mutateAsync({ name, color: newColor });
    setNewName('');
    setNewColor(PRESET_COLORS[0]!);
  };

  const startEdit = (tag: Tag) => {
    setEditState({ id: tag.id, name: tag.name, color: tag.color });
  };

  const handleSaveEdit = async () => {
    if (!editState || !editState.name.trim()) return;
    await updateTag.mutateAsync({ id: editState.id, data: { name: editState.name.trim(), color: editState.color } });
    setEditState(null);
  };

  const handleDelete = async (id: string) => {
    await deleteTag.mutateAsync(id);
    if (editState?.id === id) setEditState(null);
  };

  const inputCls = 'flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Tags" size="sm">
      <div className="space-y-4">

        {/* Create new tag */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">New Tag</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Tag name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              className={inputCls}
            />
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer p-0.5 bg-white dark:bg-gray-700"
              title="Pick color"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setNewColor(c)}
                className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  borderColor: newColor === c ? '#1D4ED8' : 'transparent',
                }}
              />
            ))}
          </div>
          <Button
            size="sm"
            onClick={handleCreate}
            isLoading={createTag.isPending}
            disabled={!newName.trim()}
            className="flex items-center gap-1.5 w-full justify-center"
          >
            <Plus className="w-3.5 h-3.5" /> Create Tag
          </Button>
        </div>

        {/* Existing tags */}
        {tags.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Your Tags</p>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {tags.map((tag) =>
                editState?.id === tag.id ? (
                  <div key={tag.id} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={editState.name}
                      onChange={(e) => setEditState({ ...editState, name: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                      className={inputCls}
                      autoFocus
                    />
                    <input
                      type="color"
                      value={editState.color}
                      onChange={(e) => setEditState({ ...editState, color: e.target.value })}
                      className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer p-0.5 bg-white dark:bg-gray-700 flex-shrink-0"
                    />
                    <button
                      onClick={handleSaveEdit}
                      disabled={updateTag.isPending}
                      className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 flex-shrink-0"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditState(null)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div key={tag.id} className="flex items-center gap-2 group">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium text-white flex-1"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </span>
                    <button
                      onClick={() => startEdit(tag)}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 flex-shrink-0 transition-opacity"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      disabled={deleteTag.isPending}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 flex-shrink-0 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {tags.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No tags yet. Create your first tag above.</p>
        )}
      </div>
    </Modal>
  );
}
