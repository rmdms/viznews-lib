import { z } from "zod";

export const MarkdownBlockSchema = z.object({
  type: z.literal("markdown"),
  html: z.string().min(1),
});

export const ImageBlockSchema = z.object({
  type: z.literal("image"),
  src: z.string().url(),
  alt: z.string(),
  aspectRatio: z
    .string()
    .regex(/^\d+\s*\/\s*\d+$/)
    .optional(),
  caption: z.string().optional(),
});

export const VideoBlockSchema = z.object({
  type: z.literal("video"),
  src: z.string().url(),
  alt: z.string(),
  poster: z.string().url().optional(),
  aspectRatio: z
    .string()
    .regex(/^\d+\s*\/\s*\d+$/)
    .optional(),
  caption: z.string().optional(),
});

export const DWChartBlockSchema = z.object({
  type: z.literal("dw-chart"),
  embedUrl: z.string().url(),
  title: z.string(),
  alt: z.string(),
  height: z.number().positive().optional(),
});

export const FlourishChartBlockSchema = z.object({
  type: z.literal("flourish-chart"),
  embedUrl: z.string().url(),
  title: z.string(),
  alt: z.string(),
  height: z.number().positive().optional(),
});

const FlyToStepSchema = z.object({
  center: z.tuple([z.number(), z.number()]),
  zoom: z.number().min(0).max(22),
  label: z.string().optional(),
});

export const MTMapBlockSchema = z.object({
  type: z.literal("mt-map"),
  style: z.record(z.string(), z.unknown()),
  bounds: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  alt: z.string(),
  height: z.number().positive().optional(),
  interactive: z.boolean().optional(),
  flyToSteps: z.array(FlyToStepSchema).optional(),
});

export type MarkdownBlock = z.infer<typeof MarkdownBlockSchema>;
export type ImageBlock = z.infer<typeof ImageBlockSchema>;
export type VideoBlock = z.infer<typeof VideoBlockSchema>;
export type DWChartBlock = z.infer<typeof DWChartBlockSchema>;
export type FlourishChartBlock = z.infer<typeof FlourishChartBlockSchema>;
export type MTMapBlock = z.infer<typeof MTMapBlockSchema>;
