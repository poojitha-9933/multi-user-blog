import { useListCategories } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Tag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CategoriesIndex() {
  const { data: categories, isLoading } = useListCategories();

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <header className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-border/50">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Topics</h1>
          <p className="text-muted-foreground text-lg">Explore the recurring themes in our journal.</p>
        </div>
        <Link href="/categories/new">
          <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            <Plus className="h-4 w-4" /> Add Topic
          </Button>
        </Link>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-muted rounded-xl h-40"></div>
          ))}
        </div>
      ) : categories?.length === 0 ? (
        <div className="text-center py-20 bg-muted/10 rounded-xl border border-border border-dashed">
          <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="font-serif text-2xl font-bold mb-2">No topics defined</h3>
          <p className="text-muted-foreground mb-6">Create the first topic to organize pieces.</p>
          <Link href="/categories/new">
            <Button>Create Topic</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories?.map(category => (
            <Link key={category.id} href={`/posts?category=${category.id}`}>
              <div className="group bg-secondary/20 p-8 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-secondary/40 transition-all h-full flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-2xl mb-3 group-hover:text-primary transition-colors flex items-center gap-2">
                    <Tag className="h-5 w-5 opacity-50" /> {category.name}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {category.description || "A collection of curated pieces exploring this theme."}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/50 text-sm font-medium flex items-center justify-between">
                  <span>Browse Collection</span>
                  <span className="bg-background px-3 py-1 rounded-full text-xs text-muted-foreground border border-border">
                    {category.postCount} {category.postCount === 1 ? 'Piece' : 'Pieces'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}