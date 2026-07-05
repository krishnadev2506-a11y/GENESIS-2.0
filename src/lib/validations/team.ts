import { z } from 'zod';

export const teamMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name is too long"),
  role: z.string().min(2, "Role must be at least 2 characters").max(30, "Role is too long"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[0-9]{10}$/, "Invalid phone number, must be 10 digits"),
  college: z.string().min(2, "College name must be at least 2 characters").max(60, "College name is too long"),
  semester: z.string().min(1, "Semester is required"),
  foodPreference: z.enum(['veg', 'non-veg']),
  isLeader: z.boolean(),
});

export const teamRegistrationSchema = z.object({
  teamName: z.string().min(2, "Team name must be at least 2 characters").max(50, "Team name must be under 50 characters"),
  college: z.string().min(2, "College name must be at least 2 characters").max(60, "College name is too long"),
  semester: z.string().min(1, "Semester is required"),
  contactNumber: z.string().regex(/^[0-9]{10}$/, "Invalid contact number, must be 10 digits"),
  email: z.string().email("Invalid primary email address"),
  foodPreference: z.enum(['veg', 'non-veg']),
  members: z.array(teamMemberSchema)
    .min(1, "At least one member is required")
    .max(6, "A team can have a maximum of 6 members"),
  paymentScreenshotUrl: z.string().url("Valid URL required for payment screenshot"),
  paymentScreenshotPublicId: z.string().min(1, "Screenshot ID is required"),
  transactionId: z.string().min(4, "Transaction ID must be at least 4 characters").max(50, "Transaction ID is too long"),
});

export type TeamRegistrationInput = z.infer<typeof teamRegistrationSchema>;
