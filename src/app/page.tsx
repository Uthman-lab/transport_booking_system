import Link from "next/link";
import { DestinationScene } from "@/components/graphics/destination-scene";
import { HeroIllustration } from "@/components/graphics/hero-illustration";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SupabaseAuthRepository } from "@/data/repositories/supabase-auth.repository";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/use-cases/auth/get-current-user";

const DESTINATIONS = [
  { name: "City Center", variant: "city" as const, blurb: "Downtown runs on the hour" },
  { name: "Airport", variant: "airport" as const, blurb: "Catch your flight on time" },
  { name: "Mega Mall", variant: "mall" as const, blurb: "Weekend shopping trips" },
];

const STEPS = [
  { title: "Pick a trip", body: "Browse upcoming departures and live seat availability." },
  { title: "Reserve your seat", body: "Choose a seat on the map — it's held while you pay." },
  { title: "Pay & confirm", body: "Simulated mobile-money checkout confirms in seconds." },
  { title: "Board with a QR ticket", body: "Show your digital ticket; staff scan you in." },
];

export default async function Home() {
  const supabase = await createClient();
  const user = await getCurrentUser({
    authRepository: new SupabaseAuthRepository(supabase),
  });

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="bg-surface">
        <Container className="grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              AAMUSTED campus transport
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
              Book your campus bus in a few taps.
            </h1>
            <p className="mt-4 max-w-md text-lg text-muted">
              Reserve a seat for the next departure, pay securely, and board with
              a QR ticket. No queues, no guesswork.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {user ? (
                <Link href="/trips" className={buttonClasses("primary", "lg")}>
                  Browse trips →
                </Link>
              ) : (
                <>
                  <Link href="/register" className={buttonClasses("primary", "lg")}>
                    Create account
                  </Link>
                  <Link href="/login" className={buttonClasses("outline", "lg")}>
                    Sign in
                  </Link>
                </>
              )}
            </div>
            <dl className="mt-10 flex gap-8">
              {[
                ["Live", "seat availability"],
                ["Instant", "QR tickets"],
                ["Fair", "1 seat per student"],
              ].map(([big, small]) => (
                <div key={small}>
                  <dt className="text-2xl font-semibold text-primary">{big}</dt>
                  <dd className="text-sm text-muted">{small}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="overflow-hidden rounded-card shadow-md">
            <HeroIllustration />
          </div>
        </Container>
      </section>

      {/* Destinations */}
      <section className="py-16">
        <Container>
          <h2 className="text-2xl font-semibold tracking-tight">Where we go</h2>
          <p className="mt-2 text-muted">Regular routes from campus.</p>
          <ul className="mt-8 grid gap-6 sm:grid-cols-3">
            {DESTINATIONS.map((d) => (
              <li key={d.name}>
                <Card interactive className="overflow-hidden">
                  <div className="relative h-40">
                    <DestinationScene variant={d.variant} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                    <p className="absolute bottom-3 left-4 text-lg font-semibold text-white drop-shadow">
                      {d.name}
                    </p>
                  </div>
                  <p className="p-4 text-sm text-muted">{d.blurb}</p>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* How it works */}
      <section className="bg-surface py-16">
        <Container>
          <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title}>
                <Card className="h-full p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted">{step.body}</p>
                </Card>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    </main>
  );
}
