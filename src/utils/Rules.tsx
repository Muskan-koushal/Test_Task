import { RegisterOptions } from "react-hook-form";

export type SignUpFormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export const fullNameRules: RegisterOptions<SignUpFormValues, "fullName"> = {
  required: "Full name is required.",
  validate: value => value.trim().length > 1 || "Name must be longer than 1 character.",
  pattern: {
    value: /^\p{L}+(?: \p{L}+)*$/u,
    message: "Use letters and spaces only.",
  },
};

export const emailRules: RegisterOptions<SignUpFormValues, "email"> = {
  required: "Email is required.",
  pattern: {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Enter a valid email address.",
  },
};

export const passwordRules: RegisterOptions<SignUpFormValues, "password"> = {
  required: "Password is required.",
  minLength: {
    value: 8,
    message: "Password must be at least 8 characters.",
  },
  pattern: {
    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
    message: "Use uppercase and lowercase letters, a number, and a special character.",
  },
};

export const confirmPasswordRules: RegisterOptions<
  SignUpFormValues,
  "confirmPassword"
> = {
  required: "Please confirm your password.",
};