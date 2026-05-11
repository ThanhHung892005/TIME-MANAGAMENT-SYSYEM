import { describe, it, expect } from 'vitest';
import { SortByOrder, SortByDeadline, SortByPriority, sortTasks } from '@/utils/sortStrategies';
import type { Task } from '@/types';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: '1',
    title: 'Test Task',
    description: null,
    priority: 'MEDIUM',
    status: 'TODO',
    deadline: null,
    order: 0,
    userId: 'user-1',
    subtasks: [],
    tags: [],
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    ...overrides,
  };
}

describe('SortByOrder', () => {
  const strategy = new SortByOrder();

  it('sorts tasks by order ascending', () => {
    const tasks = [
      makeTask({ id: 'c', order: 3 }),
      makeTask({ id: 'a', order: 1 }),
      makeTask({ id: 'b', order: 2 }),
    ];
    const sorted = strategy.sort(tasks);
    expect(sorted.map((t) => t.order)).toEqual([1, 2, 3]);
  });

  it('does not mutate the original array', () => {
    const tasks = [makeTask({ id: 'b', order: 2 }), makeTask({ id: 'a', order: 1 })];
    const original = [...tasks];
    strategy.sort(tasks);
    expect(tasks).toEqual(original);
  });

  it('handles empty array', () => {
    expect(strategy.sort([])).toEqual([]);
  });
});

describe('SortByDeadline', () => {
  const strategy = new SortByDeadline();

  it('sorts tasks with earlier deadlines first', () => {
    const tasks = [
      makeTask({ id: 'c', deadline: new Date('2024-03-01').toISOString() }),
      makeTask({ id: 'a', deadline: new Date('2024-01-01').toISOString() }),
      makeTask({ id: 'b', deadline: new Date('2024-02-01').toISOString() }),
    ];
    const sorted = strategy.sort(tasks);
    expect(sorted.map((t) => t.id)).toEqual(['a', 'b', 'c']);
  });

  it('puts tasks with no deadline last', () => {
    const tasks = [
      makeTask({ id: 'null', deadline: null }),
      makeTask({ id: 'dated', deadline: new Date('2024-01-01').toISOString() }),
    ];
    const sorted = strategy.sort(tasks);
    expect(sorted[0]!.id).toBe('dated');
    expect(sorted[1]!.id).toBe('null');
  });

  it('places both null-deadline tasks at end', () => {
    const tasks = [
      makeTask({ id: 'a', deadline: null }),
      makeTask({ id: 'b', deadline: new Date('2024-01-01').toISOString() }),
      makeTask({ id: 'c', deadline: null }),
    ];
    const sorted = strategy.sort(tasks);
    expect(sorted[0]!.id).toBe('b');
  });
});

describe('SortByPriority', () => {
  const strategy = new SortByPriority();

  it('sorts HIGH before MEDIUM before LOW', () => {
    const tasks = [
      makeTask({ id: 'low', priority: 'LOW' }),
      makeTask({ id: 'high', priority: 'HIGH' }),
      makeTask({ id: 'med', priority: 'MEDIUM' }),
    ];
    const sorted = strategy.sort(tasks);
    expect(sorted.map((t) => t.priority)).toEqual(['HIGH', 'MEDIUM', 'LOW']);
  });

  it('does not mutate the original array', () => {
    const tasks = [makeTask({ priority: 'LOW' }), makeTask({ priority: 'HIGH' })];
    const original = [...tasks];
    strategy.sort(tasks);
    expect(tasks).toEqual(original);
  });
});

describe('sortTasks', () => {
  const tasks = [
    makeTask({ id: 'b', order: 2, priority: 'LOW', deadline: new Date('2024-03-01').toISOString() }),
    makeTask({ id: 'a', order: 1, priority: 'HIGH', deadline: new Date('2024-01-01').toISOString() }),
  ];

  it('sorts by order when key is "order"', () => {
    const sorted = sortTasks(tasks, 'order');
    expect(sorted[0]!.id).toBe('a');
  });

  it('sorts by deadline when key is "deadline"', () => {
    const sorted = sortTasks(tasks, 'deadline');
    expect(sorted[0]!.id).toBe('a');
  });

  it('sorts by priority when key is "priority"', () => {
    const sorted = sortTasks(tasks, 'priority');
    expect(sorted[0]!.priority).toBe('HIGH');
  });

  it('falls back to order strategy for unknown key', () => {
    const sorted = sortTasks(tasks, 'unknown');
    expect(sorted[0]!.id).toBe('a');
  });
});
