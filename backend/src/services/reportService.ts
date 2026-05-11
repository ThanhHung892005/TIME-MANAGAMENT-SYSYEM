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
    return prisma.task.findMany({
      where: { userId },
      include: { subtasks: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  protected formatData(data: unknown) {
    const tasks = data as Array<{ title: string; priority: string; status: string; deadline: Date | null; createdAt: Date }>;
    const header = 'Title,Priority,Status,Deadline,Created At';
    const rows = tasks.map((t) =>
      `"${t.title}",${t.priority},${t.status},${t.deadline?.toISOString() ?? ''},${t.createdAt.toISOString()}`,
    );
    return [header, ...rows].join('\n');
  }

  protected async generateFile(data: unknown): Promise<ReportResult> {
    return {
      content: data as string,
      filename: `tasks-${Date.now()}.csv`,
      contentType: 'text/csv',
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
