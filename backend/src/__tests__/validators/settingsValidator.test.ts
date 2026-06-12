import { updateSettingsSchema } from '../../validators/settingsValidator';

describe('settingsValidator', () => {
  describe('updateSettingsSchema', () => {
    it('accepts valid theme update', () => {
      const result = updateSettingsSchema.safeParse({ theme: 'dark' });
      expect(result.success).toBe(true);
    });

    it('accepts light theme', () => {
      const result = updateSettingsSchema.safeParse({ theme: 'light' });
      expect(result.success).toBe(true);
    });

    it('rejects invalid theme', () => {
      const result = updateSettingsSchema.safeParse({ theme: 'blue' });
      expect(result.success).toBe(false);
    });

    it('accepts valid timezone', () => {
      const result = updateSettingsSchema.safeParse({ timezone: 'Asia/Ho_Chi_Minh' });
      expect(result.success).toBe(true);
    });

    it('accepts UTC timezone', () => {
      const result = updateSettingsSchema.safeParse({ timezone: 'UTC' });
      expect(result.success).toBe(true);
    });

    it('accepts America/New_York timezone', () => {
      const result = updateSettingsSchema.safeParse({ timezone: 'America/New_York' });
      expect(result.success).toBe(true);
    });

    it('rejects invalid timezone', () => {
      const result = updateSettingsSchema.safeParse({ timezone: 'Invalid/Timezone' });
      expect(result.success).toBe(false);
    });

    it('accepts valid pomodoro duration (min)', () => {
      const result = updateSettingsSchema.safeParse({ pomodoroDuration: 5 });
      expect(result.success).toBe(true);
    });

    it('accepts valid pomodoro duration (max)', () => {
      const result = updateSettingsSchema.safeParse({ pomodoroDuration: 180 });
      expect(result.success).toBe(true);
    });

    it('accepts typical pomodoro duration', () => {
      const result = updateSettingsSchema.safeParse({ pomodoroDuration: 25 });
      expect(result.success).toBe(true);
    });

    it('rejects pomodoro duration below minimum', () => {
      const result = updateSettingsSchema.safeParse({ pomodoroDuration: 4 });
      expect(result.success).toBe(false);
    });

    it('rejects pomodoro duration above maximum', () => {
      const result = updateSettingsSchema.safeParse({ pomodoroDuration: 181 });
      expect(result.success).toBe(false);
    });

    it('rejects non-integer pomodoro duration', () => {
      const result = updateSettingsSchema.safeParse({ pomodoroDuration: 25.5 });
      expect(result.success).toBe(false);
    });

    it('accepts emailNotifications true', () => {
      const result = updateSettingsSchema.safeParse({ emailNotifications: true });
      expect(result.success).toBe(true);
    });

    it('accepts emailNotifications false', () => {
      const result = updateSettingsSchema.safeParse({ emailNotifications: false });
      expect(result.success).toBe(true);
    });

    it('accepts pushNotifications true', () => {
      const result = updateSettingsSchema.safeParse({ pushNotifications: true });
      expect(result.success).toBe(true);
    });

    it('accepts pushNotifications false', () => {
      const result = updateSettingsSchema.safeParse({ pushNotifications: false });
      expect(result.success).toBe(true);
    });

    it('accepts empty update (no fields)', () => {
      const result = updateSettingsSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('accepts full settings update', () => {
      const result = updateSettingsSchema.safeParse({
        theme: 'dark',
        timezone: 'America/New_York',
        pomodoroDuration: 30,
        emailNotifications: false,
        pushNotifications: true,
      });
      expect(result.success).toBe(true);
    });

    it('accepts partial update (only theme)', () => {
      const result = updateSettingsSchema.safeParse({ theme: 'dark' });
      expect(result.success).toBe(true);
    });

    it('accepts partial update (only timezone)', () => {
      const result = updateSettingsSchema.safeParse({ timezone: 'Europe/London' });
      expect(result.success).toBe(true);
    });

    it('accepts Asia/Ho_Chi_Minh and converts to Asia/Saigon', () => {
      const result = updateSettingsSchema.safeParse({ timezone: 'Asia/Ho_Chi_Minh' });
      expect(result.success).toBe(true);
    });
  });
});
