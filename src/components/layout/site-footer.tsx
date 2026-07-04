import Image from "next/image";
import Link from "next/link";
import logoUbbs from "@/assets/logo_ubbs.jpg";
import { Container } from "@/components/ui/container";

// Site owner / point of contact (the client). Fill `email` in when available;
// the email line is hidden until then so no placeholder address ships.
const CLIENT = {
  name: "Suallah Bamba",
  email: "",
};

// Developer credit — links to the Usman Labs GitHub.
const DEVELOPER = {
  name: "Usman Labs",
  github: "https://github.com/uthman-lab",
};

export function SiteFooter() {
  // Server-rendered, so reading the clock here is fine.
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-card-border bg-surface/60 backdrop-blur-sm">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <Image src={logoUbbs} alt="UBBS crest" className="h-8 w-auto rounded" />
              <span className="text-lg font-semibold tracking-tight">UBBS</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted">
              University Bus Booking System — reserve campus bus trips, pay
              securely, and board with a QR ticket.
            </p>
          </div>

          <nav>
            <h3 className="text-sm font-semibold">Explore</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>
                <Link href="/trips" className="transition-colors hover:text-foreground">
                  Trips
                </Link>
              </li>
              <li>
                <Link href="/my-bookings" className="transition-colors hover:text-foreground">
                  My bookings
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition-colors hover:text-foreground">
                  Sign in
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h3 className="text-sm font-semibold">Contact</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>{CLIENT.name}</li>
              {CLIENT.email ? (
                <li>
                  <a
                    href={`mailto:${CLIENT.email}`}
                    className="transition-colors hover:text-foreground"
                  >
                    {CLIENT.email}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-card-border pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} UBBS · {CLIENT.name}
          </p>
          <p>
            Built by{" "}
            <a
              href={DEVELOPER.github}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground transition-colors hover:text-primary"
            >
              {DEVELOPER.name}
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
}
