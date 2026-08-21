import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-4xl font-bold text-foreground">Halaman Tidak Ditemukan</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Halaman yang Anda tuju sudah tidak tersedia atau telah dipindahkan.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Ke Halaman Utama
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

function isAuthenticated(): boolean {
  try {
    if (typeof window === "undefined") return false; // SSR tidak punya localStorage
    return !!localStorage.getItem("sportacademy.session");
  } catch {
    return false;
  }
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: async ({ location }) => {
    // Lapisan kedua: blok akses URL langsung bila belum login (backend tetap benteng utama)
    // Pada SSR (server-render) kita tidak tahu sesi → biarkan, client saat hydration yang akan redirect.
    if (typeof window === "undefined") return;
    const isLogin = location.pathname === "/login";
    const authed = isAuthenticated();
    if (!isLogin && !authed) {
      return { redirect: { to: "/login", search: { next: location.pathname } as any } };
    }
    if (isLogin && authed) {
      return { redirect: { to: "/dashboard" } };
    }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SportAcademy — Digitalisasi Akademi Olahraga Anak" },
      { name: "description", content: "Platform manajemen akademi olahraga modern untuk SSB dan akademi olahraga anak." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "SportAcademy — Digitalisasi Akademi Olahraga Anak" },
      { name: "twitter:title", content: "SportAcademy — Digitalisasi Akademi Olahraga Anak" },
      { property: "og:description", content: "Platform manajemen akademi olahraga modern untuk SSB dan akademi olahraga anak." },
      { name: "twitter:description", content: "Platform manajemen akademi olahraga modern untuk SSB dan akademi olahraga anak." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b104cf84-6b9d-4d1c-ad85-45bc52616c42/id-preview-77cdfbba--e0a0c268-9525-4111-bbc0-1ca61211d8bb.lovable.app-1780589195398.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b104cf84-6b9d-4d1c-ad85-45bc52616c42/id-preview-77cdfbba--e0a0c268-9525-4111-bbc0-1ca61211d8bb.lovable.app-1780589195398.png" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <AuthGuard />
    </QueryClientProvider>
  );
}

/** Lapisan kedua: guard otentikasi client-side (SSR-safe). Redirect ke /login bila belum login. */
function AuthGuard() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const authed = isAuthenticated();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isLogin = pathname === "/login";
    if (!isLogin && !authed) {
      navigate({ to: "/login", search: { next: pathname } as any });
    } else if (isLogin && authed) {
      navigate({ to: "/dashboard" as any });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, authed]);

  // Biarkan login page dirender apa adanya; tanpa login langsung redirect via effect di atas.
  return <Outlet />;
}
