import { z } from 'zod'

export const createCardSchema = z.object({
  name: z.string().min(1, 'Card name is required').max(100),
  cardNumber: z.string().min(1, 'Card number is required').max(50),
  barcodeData: z.string().max(200).optional(),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
})

export const updateCardSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  cardNumber: z.string().min(1).max(50).optional(),
  barcodeData: z.string().max(200).optional(),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
})

export type CreateCardInput = z.infer<typeof createCardSchema>
export type UpdateCardInput = z.infer<typeof updateCardSchema>

