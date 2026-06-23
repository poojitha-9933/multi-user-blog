import { Link, useLocation } from "wouter";
import { BookOpen, User, Tag, PlusSquare, CheckCircle2 } from "lucide-react";
import { useHealthCheck } from "@workspace/api-client-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { isSuccess } = useHealthCheck();

  const navItems = [
    { href: "/posts", label: "Read", icon: BookOpen },
    { href: "/authors", label: "Writers", icon: User },
    { href: "/categories", label: "Topics", icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="border-b border-border/40 sticky top-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <span>The Journal</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`transition-colors hover:text-primary ${location.startsWith(item.href) && item.href !== '/' ? "text-primary" : "text-muted-foreground"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {isSuccess && (
              <span className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5" /> API Connected
              </span>
            )}
            <Link href="/posts/new" className="hidden sm:inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 shadow-sm hover:shadow">
              <PlusSquare className="h-4 w-4" />
              Write
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border/40 py-12 mt-24 bg-muted/20">
        <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
          <p className="font-serif italic text-lg mb-4">"A word after a word after a word is power."</p>
          <p className="text-sm uppercase tracking-widest">&copy; {new Date().getFullYear()} The Journal. Crafted with care.</p>
        </div>
      </footer>
    </div>
  );
}
