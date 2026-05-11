import { TaskFactory } from '../../models/TaskFactory';
import { Priority, Status } from '@prisma/client';

describe('TaskFactory', () => {
  describe('createDefaults', () => {
    it('returns LOW priority + Personal tag for personal type', () => {
      const defaults = TaskFactory.createDefaults('personal');
      expect(defaults.priority).toBe(Priority.LOW);
      expect(defaults.status).toBe(Status.TODO);
      expect(defaults.tags).toEqual(['Personal']);
    });

    it('returns HIGH priority + Work tag for work type', () => {
      const defaults = TaskFactory.createDefaults('work');
      expect(defaults.priority).toBe(Priority.HIGH);
      expect(defaults.status).toBe(Status.TODO);
      expect(defaults.tags).toEqual(['Work']);
    });

    it('returns MEDIUM priority + Study tag for study type', () => {
      const defaults = TaskFactory.createDefaults('study');
      expect(defaults.priority).toBe(Priority.MEDIUM);
      expect(defaults.status).toBe(Status.TODO);
      expect(defaults.tags).toEqual(['Study']);
    });

    it('returns MEDIUM priority + no tags for recurring type', () => {
      const defaults = TaskFactory.createDefaults('recurring');
      expect(defaults.priority).toBe(Priority.MEDIUM);
      expect(defaults.status).toBe(Status.TODO);
      expect(defaults.tags).toEqual([]);
    });

    it('all types default to TODO status', () => {
      const types = ['personal', 'work', 'study', 'recurring'] as const;
      types.forEach((type) => {
        expect(TaskFactory.createDefaults(type).status).toBe(Status.TODO);
      });
    });

    it('does not share tag array references between calls', () => {
      const a = TaskFactory.createDefaults('work');
      const b = TaskFactory.createDefaults('work');
      a.tags.push('Extra');
      expect(b.tags).toEqual(['Work']);
    });
  });
});
