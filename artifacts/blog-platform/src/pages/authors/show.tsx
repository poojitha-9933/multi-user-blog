import { useGetAuthor, useListPosts } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { ArrowLeft, Mail, Calendar } from "lucide-react";

export default function AuthorShow() {
  const { id } = useParams();
  const authorId = Number(id);
  const { data: author, isLoading: authorLoading } = useGetAuthor(authorId);
  const { data: posts, isLoading: postsLoading } = useListPosts({ authorId });

  if (authorLoading) {
    return <div className="container mx-auto py-20 text-center font-serif text-xl text-muted-foreground animate-pulse">Loading author profile...</div>;
  }

  if (!author) {
    return <div className="container mx-auto py-20 text-center font-serif text-xl">Author not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/authors" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-12 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to writers
      </Link>
      
      <header className="flex flex-col md:flex-row gap-8 items-start mb-16 bg-secondary/20 p-8 md:p-12 rounded-2xl border border-border/50">
        {author.avatarUrl ? (
          <img src={author.avatarUrl} alt={author.name} className="h-32 w-32 md:h-40 md:w-40 rounded-full object-cover shrink-0 border-4 border-background shadow-sm" />
        ) : (
          <div className="h-32 w-32 md:h-40 md:w-40 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif text-5xl shrink-0 border-4 border-background shadow-sm">
            {author.name.charAt(0)}
          </div>
        )}
        
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">{author.name}</h1>
          <p className="text-lg leading-relaxed text-muted-foreground mb-6 font-serif">
            {author.bio || "A quiet observer who lets their work speak for itself."}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> {author.email}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Joined {format(new Date(author.createdAt), "MMMM yyyy")}
            </div>
          </div>
        </div>
      </header>

      <section>
        <div className="flex items-center justify-between mb-8 border-b border-border/50 pb-4">
          <h2 className="text-2xl font-serif font-bold">Pieces by {author.name}</h2>
          <span className="text-muted-foreground bg-muted px-3 py-1 rounded-full text-sm">{author.postCount} Published</span>
        </div>

        <div className="space-y-10">
          {postsLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-1/3 bg-muted rounded"></div>
              <div className="h-4 w-full bg-muted rounded"></div>
            </div>
          ) : posts?.length === 0 ? (
            <p className="text-muted-foreground italic text-center py-8">No pieces published yet.</p>
          ) : (
            posts?.map(post => (
              <article key={post.id} className="group">
                <div className="flex items-center gap-3 text-xs mb-2">
                  <span className="text-primary font-medium tracking-wide uppercase">
                    {post.categoryName || 'Uncategorized'}
                  </span>
                  <span className="text-muted-foreground">&middot;</span>
                  <time className="text-muted-foreground">
                    {format(new Date(post.createdAt), "MMMM d, yyyy")}
                  </time>
                </div>
                <h3 className="text-2xl font-serif font-bold mb-3 group-hover:text-primary transition-colors">
                  <Link href={`/posts/${post.id}`}>{post.title}</Link>
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                  {post.excerpt || post.content.substring(0, 160) + '...'}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}