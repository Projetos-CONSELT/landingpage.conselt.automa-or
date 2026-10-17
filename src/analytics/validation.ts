import { z } from "zod";
import { sections } from "./model";
export const sectionSchema = z.enum(sections);
export const eventKinds = [
  "cta",
  "whatsapp",
  "phone",
  "email",
  "external",
  "button",
  "form_submit",
  "form_success",
  "section_enter",
  "section_exit",
] as const;
export const eventSchema = z
  .object({
    id: z.string().uuid(),
    kind: z.enum(eventKinds),
    target: z.string().regex(/^[a-z0-9_-]{1,64}$/),
    section: sectionSchema,
    at: z.number().int().min(0).max(86400000),
  })
  .strict();
export const snapshotSchema = z
  .object({
    pageViews: z.number().int().min(1).max(1000),
    seq: z.number().int().min(1).max(100000),
    active: z.number().int().min(0).max(86400000),
    scroll: z.number().min(0).max(100),
    sections: z
      .array(z.object({ id: sectionSchema, ms: z.number().int().min(0).max(86400000) }).strict())
      .max(8),
    last: sectionSchema.nullable(),
    events: z.array(eventSchema).max(30),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (
      new Set(value.sections.map((s) => s.id)).size !== value.sections.length ||
      value.sections.reduce((n, s) => n + s.ms, 0) > value.active + 1000
    )
      ctx.addIssue({ code: "custom", message: "Invalid section totals" });
  });
export const startSchema = z
  .object({
    visitor: z.string().uuid(),
    device: z.enum(["desktop", "tablet", "mobile"]),
    source: z.enum(["direct", "internal", "search", "social", "referral"]),
  })
  .strict();
export type Snapshot = z.infer<typeof snapshotSchema>;
export type AnalyticsEvent = z.infer<typeof eventSchema>;
