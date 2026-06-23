import { useListAuthors } from "@workspace/api-client-react";
import { Link } from "wouter";
import { PenTool, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthorsIndex() {
  const { data: authors, isLoading } = useListAuthors();

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="mb-16 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Our Writers</h1>
        <p className="text-muted-foreground text-lg mb-8">The voices and minds behind the stories that make our journal what it is.</p>
        <Link href="/authors/new">
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" /> Become a Writer
          </Button>
        </Link>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse bg-secondary/20 p-8 rounded-xl border border-border/50">
              <div className="h-20 w-20 bg-muted rounded-full mx-auto mb-6"></div>
              <div className="h-6 w-3/4 bg-muted mx-auto rounded mb-4"></div>
              <div className="h-4 w-1/2 bg-muted mx-auto rounded"></div>
            </div>
          ))}
        </div>
      ) : authors?.length === 0 ? (
        <div className="text-center py-20 bg-muted/10 rounded-xl border border-border border-dashed">
          <PenTool className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="font-serif text-2xl font-bold mb-2">No writers yet</h3>
          <p className="text-muted-foreground">Be the first to join our community.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {authors?.map(author => (
            <Link key={author.id} href={`/authors/${author.id}`}>
              <div className="group bg-background p-8 rounded-xl border border-border/50 text-center hover:border-primary/50 hover:shadow-sm transition-all h-full flex flex-col">
                {author.avatarUrl ? (
                  <img src={author.avatarUrl} alt={author.name} className="h-24 w-24 rounded-full object-cover mx-auto mb-6 border-4 border-background shadow-sm" />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-serif text-3xl mx-auto mb-6 border-4 border-background shadow-sm">
                    {author.name.charAt(0)}
                  </div>
                )}
                
                <h3 className="font-serif font-bold text-2xl mb-2 group-hover:text-primary transition-colors">{author.name}</h3>
                
                <p className="text-muted-foreground text-sm mb-6 flex-1 line-clamp-3">
                  {author.bio || "No biography provided."}
                </p>
                
                <div className="pt-4 border-t border-border/50 text-sm font-medium">
                  {author.postCount} {author.postCount === 1 ? 'Piece' : 'Pieces'} Published
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}