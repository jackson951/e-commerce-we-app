import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required."),
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  phone: z.string().trim().max(25, "Phone number is too long.").optional(),
  address: z.string().trim().max(300, "Address is too long.").optional()
});

export const paymentMethodSchema = z.object({
  cardHolderName: z.string().trim().min(2, "Card holder name is required."),
  cardNumber: z
    .string()
    .trim()
    .regex(/^\d{12,19}$/, "Card number must contain 12 to 19 digits."),
  brand: z.string().trim().max(40, "Card brand is too long.").optional(),
  expiryMonth: z.number().int().min(1, "Expiry month must be 1 to 12.").max(12, "Expiry month must be 1 to 12."),
  expiryYear: z.number().int().min(new Date().getFullYear(), "Card expiry year is in the past.").max(2100),
  billingAddress: z.string().trim().max(300, "Billing address is too long.").optional(),
  defaultMethod: z.boolean().optional()
});

export const adminProductSchema = z.object({
  name: z.string().trim().min(1, "Product name is required."),
  description: z.string().trim().max(2000, "Description is too long."),
  price: z.number().finite().min(0, "Price must be 0 or greater."),
  stockQuantity: z.number().int().min(0, "Stock must be 0 or greater."),
  categoryId: z.string().trim().min(1, "Category is required."),
  imageUrls: z.array(z.url("Each image URL must be valid.")).max(12, "Maximum 12 images per product."),
  active: z.boolean()
});

export function getFirstValidationError(error: z.ZodError) {
  const issue = error.issues[0];
  return issue?.message || "Invalid input.";
}
