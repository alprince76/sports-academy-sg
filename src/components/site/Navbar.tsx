import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Trophy className="h-4 w-4" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            SportAcademy
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Fitur</a>
          <a href="#benefits" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Manfaat</a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Harga</a>
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Demo</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
            <Link to="/login">Masuk</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/login">Coba Demo</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
