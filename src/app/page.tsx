import { redirect } from "next/navigation";

// The app has no marketing landing page yet; the home route just forwards to
// the trips list. Unauthenticated visitors are caught by the proxy first and
// bounced to /login.
export default function Home() {
  redirect("/trips");
}
