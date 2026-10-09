import { z } from 'zod';

export const triageResponseSchema = z.object({
  category: z.enum([
    'Billing',
    'Technical',
    'Account',
    'Shipping',
    'Refunds',
    'General',
  ]),
  priority: z.enum(['Critical', 'High', 'Medium', 'Low']),
  department: z.string().min(1),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().min(5),
});

export type TriageResponse = z.infer<typeof triageResponseSchema>;

export const createTicketInputSchema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  body: z.string().min(5, 'Body must be at least 5 characters'),
  customer_name: z.string().min(2, 'Customer name is required'),
  customer_email: z.string().email('Valid customer email is required'),
});

export const updateTicketSchema = z.object({
  category: z.enum(['Billing', 'Technical', 'Account', 'Shipping', 'Refunds', 'General']).optional(),
  priority: z.enum(['Critical', 'High', 'Medium', 'Low']).optional(),
  status: z.enum(['open', 'in_review', 'resolved', 'closed']).optional(),
  department: z.string().optional(),
  assigned_to: z.string().nullable().optional(),
  needs_human_review: z.boolean().optional(),
  human_override: z.boolean().optional(),
  override_notes: z.string().optional(),
});
