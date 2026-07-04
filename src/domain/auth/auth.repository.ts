import type { AuthUser } from "./auth-user.entity";

export type SignUpInput = {
  fullName: string;
  studentId: string;
  email: string;
  password: string;
  phone?: string;
};

export type SignUpResult = {
  user: AuthUser;
  // True when the project requires email confirmation (no session yet), so the
  // UI can prompt the user to check their inbox instead of entering the app.
  needsEmailConfirmation: boolean;
};

export type SignInInput = {
  email: string;
  password: string;
};

// Port implemented by the data layer. The domain and use-cases layers depend
// only on this interface, never on @supabase/*. Implementations are expected
// to translate provider error codes into the domain errors in auth.errors.ts.
export interface AuthRepository {
  signUp(input: SignUpInput): Promise<SignUpResult>;
  signInWithPassword(input: SignInInput): Promise<AuthUser>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
  requestPasswordReset(email: string): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;
}
