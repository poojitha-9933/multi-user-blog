import { useGetPostStats, useGetRecentPosts, useListCategories } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function Home() {
  const { data: stats, isLoading: statsLoading } = useGetPostStats();
  const { data: recentPosts, isLoading: postsLoading } = useGetRecentPosts();
  const { data: categories, isLoading: categoriesLoading } = useListCategories();

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <section className="text-center max-w-3xl mx-auto mb-20">
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-6 leading-tight">Stories that matter, <br/><span className="text-primary italic">voices that linger.</span></h1>
        <p className="text-xl text-muted-foreground font-sans">A modern literary magazine for thoughtful readers and passionate writers.</p>
        
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/posts" className="inline-flex items-center justify-center rounded-sm bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
            Start Reading
          </Link>
          <Link href="/authors" className="inline-flex items-center justify-center rounded-sm border border-input bg-background px-8 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
            Meet our Writers
          </Link>
        </div>
      </section>

      {(statsLoading || postsLoading || categoriesLoading) ? (
        <div className="text-center py-20 text-muted-foreground">Loading the journal...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            <h2 className="text-3xl font-serif font-bold border-b border-border/50 pb-4">Latest Issues</h2>
            <div className="grid gap-10">
              {recentPosts?.map(post => (
                <article key={post.id} className="group relative flex flex-col items-start justify-between">
                  <div className="flex items-center gap-x-4 text-xs">
                    <time dateTime={post.createdAt} className="text-muted-foreground uppercase tracking-wider">
                      {format(new Date(post.createdAt), "MMM d, yyyy")}
                    </time>
                    {post.categoryName && (
                      <Link href={`/posts?category=${post.categoryId}`} className="relative z-10 rounded-full bg-secondary px-3 py-1 font-medium text-secondary-foreground hover:bg-secondary/80">
                        {post.categoryName}
                      </Link>
                    )}
                  </div>
                  <div className="group relative">
                    <h3 className="mt-3 text-2xl font-serif font-bold group-hover:text-primary transition-colors">
                      <Link href={`/posts/${post.id}`}>
                        <span className="absolute inset-0" />
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {post.excerpt || post.content.substring(0, 150) + "..."}
                    </p>
                  </div>
                  <div className="relative mt-6 flex items-center gap-x-4">
                    {post.authorAvatarUrl ? (
                      <img src={post.authorAvatarUrl} alt="" className="h-10 w-10 rounded-full bg-muted object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-serif text-lg">
                        {post.authorName.charAt(0)}
                      </div>
                    )}
                    <div className="text-sm leading-6">
                      <p className="font-semibold text-foreground">
                        <Link href={`/authors/${post.authorId}`}>
                          <span className="absolute inset-0" />
                          {post.authorName}
                        </Link>
                      </p>
                      <p className="text-muted-foreground">{post.readingTimeMinutes} min read</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            
            {recentPosts?.length === 0 && (
              <div className="text-center py-12 border border-dashed border-border rounded-lg">
                <p className="text-muted-foreground italic">No stories published yet.</p>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-4 space-y-12">
            <div className="bg-secondary/30 p-8 rounded-lg">
              <h3 className="text-xl font-serif font-bold mb-6">The Archives</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Published Works</span>
                  <span className="font-serif font-medium text-lg">{stats?.publishedPosts || 0}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Contributing Authors</span>
                  <span className="font-serif font-medium text-lg">{stats?.totalAuthors || 0}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Reader Responses</span>
                  <span className="font-serif font-medium text-lg">{stats?.totalComments || 0}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-serif font-bold mb-6">Explore Topics</h3>
              <div className="flex flex-wrap gap-2">
                {categories?.map(category => (
                  <Link key={category.id} href={`/posts?category=${category.id}`} className="px-4 py-2 bg-background border border-border rounded-full text-sm hover:border-primary hover:text-primary transition-colors">
                    {category.name} <span className="text-muted-foreground ml-1">{category.postCount}</span>
                  </Link>
                ))}
                {categories?.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No topics defined.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
