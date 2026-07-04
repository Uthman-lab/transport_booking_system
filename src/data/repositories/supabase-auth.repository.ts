import { AuthError, type SupabaseClient } from "@supabase/supabase-js";
import type { AuthUser } from "@/domain/auth/auth-user.entity";
import {
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
  StudentIdTakenError,
  WeakPasswordError,
} from "@/domain/auth/auth.errors";
import type {
  AuthRepository,
  SignInInput,
  SignUpInput,
} from "@/domain/auth/auth.repository";
import { toAuthUser, type ProfileRow } from "@/data/mappers/auth-user.mapper";

const PROFILE_SELECT = "id, full_name, student_id, phone, role, created_at";

// Where password-reset / email-confirmation links land. The email template's
// {{ .ConfirmationURL }} carries a token_hash to /auth/confirm, which then
// forwards to `next`. Must be present in Supabase's redirect allow-list.
function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export class SupabaseAuthRepository implements AuthRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async signUp(input: SignUpInput): Promise<AuthUser> {
    const { data, error } = await this.supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        // Captured into raw_user_meta_data and persisted by the
        // internal.handle_new_user() signup trigger (see migration).
        data: {
          full_name: input.fullName,
          student_id: input.studentId,
          phone: input.phone ?? null,
        },
      },
    });

    if (error) throw translateSignUpError(error);

    const user = data.user;
    if (!user) {
      throw new Error("Sign up did not return a user.");
    }

    // When a user signs up with an already-registered email and confirmations
    // are off, Supabase obfuscates the response as a user with no identities
    // rather than a hard error. Treat that as a duplicate.
    if (user.identities && user.identities.length === 0) {
      throw new EmailAlreadyRegisteredError();
    }

    // Confirmations are off, so a session exists immediately and the trigger
    // has created the profile with role 'student'. Build the entity from the
    // known signup input rather than a follow-up read.
    return {
      id: user.id,
      email: user.email ?? input.email,
      fullName: input.fullName,
      studentId: input.studentId,
      phone: input.phone ?? null,
      role: "student",
    };
  }

  async signInWithPassword(input: SignInInput): Promise<AuthUser> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      // Any sign-in rejection (bad password, unknown/unconfirmed user) is
      // surfaced uniformly to avoid leaking which accounts exist.
      throw new InvalidCredentialsError({ cause: error });
    }

    const profile = await this.fetchProfile(data.user.id);
    if (!profile) throw new InvalidCredentialsError();
    return toAuthUser(data.user, profile);
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) return null;

    const profile = await this.fetchProfile(user.id);
    if (!profile) return null;

    return toAuthUser(user, profile);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl()}/auth/confirm?next=/reset-password`,
    });
    if (error) throw error;
  }

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      if (error.code === "weak_password") {
        throw new WeakPasswordError({ cause: error });
      }
      throw error;
    }
  }

  private async fetchProfile(userId: string): Promise<ProfileRow | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select(PROFILE_SELECT)
      .eq("id", userId)
      .maybeSingle<ProfileRow>();

    if (error) throw error;
    return data;
  }
}

// Maps Supabase auth error codes to domain errors. The signup trigger inserts
// into public.profiles, whose only unique constraint is student_id — so a
// database failure during user creation is treated as a duplicate student ID.
function translateSignUpError(error: AuthError): Error {
  switch (error.code) {
    case "user_already_exists":
    case "email_exists":
      return new EmailAlreadyRegisteredError({ cause: error });
    case "weak_password":
      return new WeakPasswordError({ cause: error });
    case "unexpected_failure":
      return new StudentIdTakenError({ cause: error });
    default:
      // The trigger's unique_violation surfaces as a 500 without a specific
      // code; still attribute it to the student ID constraint.
      if (error.status === 500) {
        return new StudentIdTakenError({ cause: error });
      }
      return error;
  }
}
