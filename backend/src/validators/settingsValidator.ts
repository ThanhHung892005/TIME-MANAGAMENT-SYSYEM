import { z } from 'zod';

// Intl.supportedValuesOf is available in Node 20+ but not in TypeScript's default lib
const validTimezones = new Set((Intl as any).supportedValuesOf('timeZone') as string[]);
validTimezones.add('Asia/Ho_Chi_Minh'); // Accept legacy/client value
validTimezones.add('UTC'); // Database default, even if not in supportedValuesOf

export const updateSettingsSchema = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  timezone: z.preprocess(
    (val) => val === 'Asia/Ho_Chi_Minh' ? 'Asia/Saigon' : val,
    z.string().refine((tz) => validTimezones.has(tz), { message: 'Invalid IANA Timezone' })
  ).optional(),
  pomodoroDuration: z.number().int().min(5).max(180).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
});

export type UpdateSettingsDTO = z.infer<typeof updateSettingsSchema>;
