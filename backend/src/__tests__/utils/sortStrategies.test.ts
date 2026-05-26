import { Task, Priority, Status } from '@prisma/client';
import { SortByDeadline, SortByPriority, SortByCreatedDate, TaskSorter } from '../../utils/sortStrategies';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'id',
    userId: 'user1',
    title: 'Task',
    description: null,
    priority: Priority.MEDIUM,
    status: Status.TODO,
    deadline: null,
    isRecurring: false,
    recurringType: null,
    nextDueAt: null,
    order: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

describe('SortByDeadline', () => {
  const strategy = new SortByDeadline();

  it('sorts tasks with earlier deadline first', () => {
    const tasks = [
      makeTask({ id: 'c', deadline: new Date('2024-03-01') }),
      makeTask({ id: 'a', deadline: new Date('2024-01-01') }),
      makeTask({ id: 'b', deadline: new Date('2024-02-01') }),
    ];
    const sorted = strategy.sort(tasks);
    expect(sorted.map((t) => t.id)).toEqual(['a', 'b', 'c']);
  });

  it('places tasks with null deadline last', () => {
    const tasks = [
      makeTask({ id: 'null', deadline: null }),
      makeTask({ id: 'dated', deadline: new Date('2024-01-01') }),
    ];
    const sorted = strategy.sort(tasks);
    expect(sorted[0]!.id).toBe('dated');
    expect(sorted[1]!.id).toBe('null');
  });

  it('does not mutate original array', () => {
    const tasks = [
      makeTask({ id: 'b', deadline: new Date('2024-02-01') }),
      makeTask({ id: 'a', deadline: new Date('2024-01-01') }),
    ];
    const copy = [...tasks];
    strategy.sort(tasks);
    expect(tasks).toEqual(copy);
  });
});

describe('SortByPriority', () => {
  const strategy = new SortByPriority();

  it('sorts HIGH before MEDIUM before LOW', () => {
    const tasks = [
      makeTask({ id: 'low', priority: Priority.LOW }),
      makeTask({ id: 'high', priority: Priority.HIGH }),
      makeTask({ id: 'med', priority: Priority.MEDIUM }),
    ];
    const sorted = strategy.sort(tasks);
    expect(sorted.map((t) => t.priority)).toEqual([Priority.HIGH, Priority.MEDIUM, Priority.LOW]);
  });

  it('does not mutate original array', () => {
    const tasks = [makeTask({ priority: Priority.LOW }), makeTask({ priority: Priority.HIGH })];
    const copy = [...tasks];
    strategy.sort(tasks);
    expect(tasks).toEqual(copy);
  });
});

describe('SortByCreatedDate', () => {
  const strategy = new SortByCreatedDate();

  it('sorts newest first', () => {
    const tasks = [
      makeTask({ id: 'old', createdAt: new Date('2024-01-01') }),
      makeTask({ id: 'new', createdAt: new Date('2024-06-01') }),
    ];
    const sorted = strategy.sort(tasks);
    expect(sorted[0]!.id).toBe('new');
    expect(sorted[1]!.id).toBe('old');
  });
});

describe('TaskSorter', () => {
  it('delegates to the injected strategy', () => {
    const tasks = [
      makeTask({ id: 'low', priority: Priority.LOW }),
      makeTask({ id: 'high', priority: Priority.HIGH }),
    ];
    const sorter = new TaskSorter(new SortByPriority());
    const sorted = sorter.sortTasks(tasks);
    expect(sorted[0]!.id).toBe('high');
  });

  it('switches strategy with setStrategy', () => {
    const tasks = [
      makeTask({ id: 'old', createdAt: new Date('2024-01-01') }),
      makeTask({ id: 'new', createdAt: new Date('2024-06-01') }),
    ];
    const sorter = new TaskSorter(new SortByPriority());
    sorter.setStrategy(new SortByCreatedDate());
    const sorted = sorter.sortTasks(tasks);
    expect(sorted[0]!.id).toBe('new');
  });
});
