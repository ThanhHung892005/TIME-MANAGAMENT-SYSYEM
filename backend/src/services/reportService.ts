import PDFDocument from 'pdfkit';
import { prisma } from '../config/database';

type ReportResult = { content: string | Buffer; filename: string; contentType: string };

/** Template Method Pattern for report export */
abstract class ReportExporter {
  async exportReport(userId: string): Promise<ReportResult> {
    const data = await this.collectData(userId);
    const formatted = this.formatData(data);
    return await this.generateFile(formatted);
  }

  protected abstract collectData(userId: string): Promise<unknown>;
  protected abstract formatData(data: unknown): unknown;
  protected abstract generateFile(data: unknown): Promise<ReportResult>;
}

class CSVReportExporter extends ReportExporter {

  protected async collectData(userId: string) {
    return prisma.pomodoroSession.findMany({
      where: { userId },
      include: { task: { select: { title: true } } },
      orderBy: { startedAt: 'desc' },
    });
  }


  protected formatData(data: unknown) {
    type SessionRow = {
      type: string;
      duration: number;
      startedAt: Date | string;
      endedAt: Date | string | null;
      task: { title: string } | null;
    };
    const sessions = data as SessionRow[];


    const header = 'Type;Duration (min);Task;Started At;Ended At';

    const rows = sessions.map(s => {
      const startStr = s.startedAt ? new Date(s.startedAt).toISOString() : '';
      const endStr = s.endedAt ? new Date(s.endedAt).toISOString() : '';
      const durationMin = s.duration ? Math.floor(s.duration / 60) : 0;


      return `${s.type ?? ''};${durationMin};"${s.task?.title ?? '—'}";${startStr};${endStr}`;
    });

    return [header, ...rows].join('\n');
  }

  protected async generateFile(data: unknown): Promise<ReportResult> {
    return {
      content: '\uFEFF' + (data as string),
      filename: `pomodoro-${Date.now()}.csv`,
      contentType: 'text/csv; charset=utf-8',
    };
  }
}

class JSONReportExporter extends ReportExporter {
  protected async collectData(userId: string) {
    const [tasks, sessions] = await Promise.all([
      prisma.task.findMany({ where: { userId }, include: { subtasks: true } }),
      prisma.pomodoroSession.findMany({ where: { userId } }),
    ]);
    return { tasks, sessions };
  }

  protected formatData(data: unknown) {
    return JSON.stringify(data, null, 2);
  }

  protected async generateFile(data: unknown): Promise<ReportResult> {
    return {
      content: data as string,
      filename: `report-${Date.now()}.json`,
      contentType: 'application/json',
    };
  }
}

class PDFReportExporter extends ReportExporter {
  protected async collectData(userId: string) {
    const [tasks, sessions] = await Promise.all([
      prisma.task.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.pomodoroSession.findMany({ where: { userId, type: 'work', endedAt: { not: null } } }),
    ]);
    return { tasks, sessions };
  }

  protected formatData(data: unknown) {
    return data;
  }

  protected generateFile(data: unknown): Promise<ReportResult> {
    type TaskRow = { title: string; priority: string; status: string; deadline: Date | null };
    type SessionRow = { duration: number };
    const { tasks, sessions } = data as { tasks: TaskRow[]; sessions: SessionRow[] };

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () =>
        resolve({
          content: Buffer.concat(chunks),
          filename: `report-${Date.now()}.pdf`,
          contentType: 'application/pdf',
        }),
      );
      doc.on('error', reject);

      const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
      const totalFocusMin = sessions.reduce((acc, s) => acc + Math.floor(s.duration / 60), 0);

      doc.fontSize(20).text('Time Management Report', { align: 'center' });
      doc.fontSize(11).fillColor('#666').text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.fillColor('#000').moveDown(1.5);

      doc.fontSize(14).text('Summary', { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(11)
        .text(`Total Tasks: ${tasks.length}`)
        .text(`Completed: ${completed}`)
        .text(`Completion Rate: ${tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0}%`)
        .text(`Pomodoro Sessions: ${sessions.length}`)
        .text(`Total Focus Time: ${totalFocusMin} minutes`);
      doc.moveDown(1);

      doc.fontSize(14).text('Tasks', { underline: true });
      doc.moveDown(0.5);

      tasks.forEach((task, i) => {
        const deadline = task.deadline ? new Date(task.deadline).toLocaleDateString() : '—';
        doc.fontSize(10).text(
          `${i + 1}. [${task.status}] ${task.title}  |  ${task.priority}  |  ${deadline}`,
          { indent: 10 },
        );
      });

      doc.end();
    });
  }
}

const exporters: Record<string, ReportExporter> = {
  csv: new CSVReportExporter(),
  json: new JSONReportExporter(),
  pdf: new PDFReportExporter(),
};

export async function generateReport(userId: string, format: string) {
  const exporter = exporters[format] ?? exporters['json']!;
  return exporter.exportReport(userId);
}
class TagsCSVExporter extends ReportExporter {
  protected async collectData(userId: string) {
    return prisma.tag.findMany({
      where: { userId },
      include: {
        tasks: {
          include: { task: { select: { title: true, status: true, priority: true } } }
        }
      },
    });
  }

  protected formatData(data: unknown) {
    type TagRow = {
      name: string;
      color: string;
      tasks: { task: { title: string; status: string; priority: string } }[];
    };
    const tags = data as TagRow[];
    const header = 'Tag Name,Color,Task Title,Task Status,Task Priority';
    const rows = tags.flatMap(tag =>
      tag.tasks.length > 0
        ? tag.tasks.map(t =>
          `"${tag.name}","${tag.color}","${t.task.title}",${t.task.status},${t.task.priority}`
        )
        : [`"${tag.name}","${tag.color}",(no tasks),,`]
    );
    return [header, ...rows].join('\n');
  }

  protected async generateFile(data: unknown): Promise<ReportResult> {
    return {
      content: data as string,
      filename: `tags-${Date.now()}.csv`,
      contentType: 'text/csv',
    };
  }
}

class TagsJSONExporter extends ReportExporter {
  protected async collectData(userId: string) {
    return prisma.tag.findMany({
      where: { userId },
      include: {
        tasks: {
          include: { task: { select: { title: true, status: true, priority: true, deadline: true } } }
        }
      },
    });
  }

  protected formatData(data: unknown) {
    return JSON.stringify(data, null, 2);
  }

  protected async generateFile(data: unknown): Promise<ReportResult> {
    return {
      content: data as string,
      filename: `tags-${Date.now()}.json`,
      contentType: 'application/json',
    };
  }
}

class PomodoroCSVExporter extends ReportExporter {
  protected async collectData(userId: string) {
    return prisma.pomodoroSession.findMany({
      where: { userId },
      include: { task: { select: { title: true } } },
      orderBy: { startedAt: 'desc' },
    });
  }

  protected formatData(data: unknown) {
    type SessionRow = {
      type: string;
      duration: number;
      startedAt: Date;
      endedAt: Date | null;
      task: { title: string } | null;
    };
    const sessions = data as SessionRow[];
    const header = 'Type,Duration (min),Task,Started At,Ended At';
    const rows = sessions.map(s =>
      `${s.type},${Math.floor(s.duration / 60)},"${s.task?.title ?? '—'}",${s.startedAt.toISOString()},${s.endedAt?.toISOString() ?? ''}`
    );
    return [header, ...rows].join('\n');
  }

  protected async generateFile(data: unknown): Promise<ReportResult> {
    return {
      content: data as string,
      filename: `pomodoro-${Date.now()}.csv`,
      contentType: 'text/csv',
    };
  }
}

class PomodoroJSONExporter extends ReportExporter {
  protected async collectData(userId: string) {
    return prisma.pomodoroSession.findMany({
      where: { userId },
      include: { task: { select: { title: true } } },
      orderBy: { startedAt: 'desc' },
    });
  }

  protected formatData(data: unknown) {
    return JSON.stringify(data, null, 2);
  }

  protected async generateFile(data: unknown): Promise<ReportResult> {
    return {
      content: data as string,
      filename: `pomodoro-${Date.now()}.json`,
      contentType: 'application/json',
    };
  }
}

export async function exportTags(userId: string, format: 'csv' | 'json') {
  const exporter = format === 'csv' ? new TagsCSVExporter() : new TagsJSONExporter();
  return exporter.exportReport(userId);
}

export async function exportPomodoro(userId: string, format: 'csv' | 'json') {
  const exporter = format === 'csv' ? new PomodoroCSVExporter() : new PomodoroJSONExporter();
  return exporter.exportReport(userId);
}