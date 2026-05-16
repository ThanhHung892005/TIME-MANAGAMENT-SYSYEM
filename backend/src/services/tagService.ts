import { z } from 'zod';
import { prisma } from '../config/database';

export const createTagSchema = z.object({
  name: z.string().min(1),
  color: z.string().regex(/^#([0-9A-Fa-f]{6})$/, 'Invalid hex color').default('#3B82F6'),
});

export const updateTagSchema = createTagSchema.partial();

export type CreateTagDTO = z.infer<typeof createTagSchema>;
export type UpdateTagDTO = z.infer<typeof updateTagSchema>;

class TagService {
  async getTags(userId: string) {
    return prisma.tag.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async createTag(userId: string, data: CreateTagDTO) {
    return prisma.tag.create({
      data: {
        ...data,
        user: { connect: { id: userId } },
      },
    });
  }

  async updateTag(userId: string, tagId: string, data: UpdateTagDTO) {
    const result = await prisma.tag.updateMany({
      where: { id: tagId, userId },
      data,
    });

    if (result.count === 0) {
      throw new Error('Tag not found');
    }

    return prisma.tag.findUnique({ where: { id: tagId } });
  }

  async deleteTag(userId: string, tagId: string) {
    const result = await prisma.tag.deleteMany({
      where: { id: tagId, userId },
    });

    if (result.count === 0) {
      throw new Error('Tag not found');
    }

    return { id: tagId };
  }
}

export const tagService = new TagService();
