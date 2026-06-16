import { z } from 'zod'

export const RequestOtpSchema = z.object({
  email:     z.string().email(),
  password:  z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  full_name: z.string().max(120).optional().default(''),
})

export const VerifyOtpSchema = z.object({
  email: z.string().email(),
  code:  z.string().regex(/^\d{6}$/, 'El código debe tener 6 dígitos'),
})

export type RequestOtpInput = z.infer<typeof RequestOtpSchema>
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>
