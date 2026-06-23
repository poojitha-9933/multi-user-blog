import { useListPosts, useListCategories } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function Posts() {
  const [location] = useLocation();

  const categoryId = (() => {
    const search =
      typeof window !== "undefined" ? window.location.search : "";
    const val = new URLSearchParams(search).get("category") ||
      new URLSearchParams(search).get("categoryId");
    return val ? Number(val) : undefined;
  })();

  const { data: posts, isLoading } = useListPosts(
    categoryId ? { categoryId } : undefined,
    { query: { queryKey: ["posts", categoryId] } }
  );
  const { data: categories } = useListCategories();

  const activeCategory = categories?.find((c) => c.id === categoryId);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground flex items-center gap-1 transition-colors">
          <Home className="h-3.5 w-3.5" /> Home
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">
          {activeCategory ? activeCategory.name : "All Posts"}
        </span>
      </div>

      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
          {activeCategory ? activeCategory.name : "Reading Room"}
        </h1>
        <p className="text-muted-foreground text-lg">
          {activeCategory
            ? activeCategory.description || `Pieces tagged under ${activeCategory.name}.`
            : "Browse our collection of essays, stories, and thoughts."}
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-64 shrink-0 space-y-8">
          <div>
            <h3 className="font-serif text-lg font-bold mb-4 border-b border-border/50 pb-2">
              Filter by Topic
            </h3>
            <div className="flex flex-col gap-2">
              <Link
                href="/posts"
                className={`text-sm py-1.5 px-3 rounded-md transition-colors ${
                  !categoryId
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground"
                }`}
              >
                All Topics
              </Link>
              {categories?.map((c) => (
                <Link
                  key={c.id}
                  href={`/posts?category=${c.id}`}
                  className={`text-sm py-1.5 px-3 rounded-md transition-colors ${
                    categoryId === c.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {c.name}{" "}
                  <span className="text-xs opacity-60">({c.postCount})</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="bg-secondary/30 p-6 rounded-lg text-center">
            <h4 className="font-serif font-bold mb-2">Have a story?</h4>
            <p className="text-sm text-muted-foreground mb-4">
              We are always looking for new voices to join our publication.
            </p>
            <Link href="/posts/new">
              <Button className="w-full">Submit a Piece</Button>
            </Link>
          </div>
        </div>

        <div className="flex-1 space-y-10">
          {isLoading ? (
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex gap-6">
                  <div className="w-48 h-32 bg-muted rounded-md shrink-0 hidden sm:block"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-24 bg-muted rounded"></div>
                    <div className="h-8 w-3/4 bg-muted rounded"></div>
                    <div className="h-4 w-full bg-muted rounded"></div>
                    <div className="h-4 w-5/6 bg-muted rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts?.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-lg border border-border border-dashed">
              <p className="text-muted-foreground font-serif italic text-lg mb-4">
                No pieces found for this selection.
              </p>
              <Link href="/posts">
                <Button variant="outline">Clear Filters</Button>
              </Link>
            </div>
          ) : (
            posts?.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col sm:flex-row gap-6 items-start pb-10 border-b border-border/40 last:border-0"
              >
                {post.coverImageUrl && (
                  <div className="w-full sm:w-48 h-48 sm:h-32 shrink-0 overflow-hidden rounded-md">
                    <img
                      src={post.coverImageUrl}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 text-xs mb-2">
                    <span className="text-primary font-medium tracking-wide uppercase">
                      {post.categoryName || "Uncategorized"}
                    </span>
                    <span className="text-muted-foreground">&middot;</span>
                    <time className="text-muted-foreground">
                      {format(new Date(post.createdAt), "MMMM d, yyyy")}
                    </time>
                  </div>
                  <h2 className="text-2xl font-serif font-bold mb-2 group-hover:text-primary transition-colors">
                    <Link href={`/posts/${post.id}`}>{post.title}</Link>
                  </h2>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4 leading-relaxed">
                    {post.excerpt || post.content.substring(0, 160) + "..."}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{post.authorName}</span>
                    <span className="text-muted-foreground">&middot;</span>
                    <span className="text-muted-foreground">
                      {post.readingTimeMinutes} min read
                    </span>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
