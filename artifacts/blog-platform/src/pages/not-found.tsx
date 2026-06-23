import { Link } from "wouter";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-2xl text-center">
      <div className="bg-secondary/20 p-12 rounded-2xl border border-border/50 shadow-sm flex flex-col items-center">
        <div className="h-20 w-20 bg-background rounded-full flex items-center justify-center shadow-sm mb-6">
          <AlertCircle className="h-10 w-10 text-primary opacity-80" />
        </div>
        
        <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Page Not Found</h1>
        <p className="text-lg text-muted-foreground mb-8">
          The page you're looking for seems to have been misplaced or never existed in our archives.
        </p>
        
        <Link href="/">
          <Button className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Return to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}