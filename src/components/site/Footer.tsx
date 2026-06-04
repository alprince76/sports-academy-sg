import { Trophy } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Trophy className="h-4 w-4" />
              </div>
              <span className="font-display text-lg font-bold">SportAcademy</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Digitalisasi akademi olahraga anak dengan transparansi dan profesionalisme.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Produk</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Fitur</li><li>Harga</li><li>Demo</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Perusahaan</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Tentang</li><li>Kontak</li><li>Privacy</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          © 2026 SportAcademy. Build future champions.
        </div>
      </div>
    </footer>
  );
}
