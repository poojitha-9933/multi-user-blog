import { useGetPost, useListComments, useCreateComment, useDeleteComment, getListCommentsQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Edit, ArrowLeft, Clock, Trash2 } from "lucide-react";

const commentSchema = z.object({
  authorName: z.string().min(1, "Name is required"),
  content: z.string().min(1, "Comment cannot be empty")
});

export default function PostShow() {
  const { id } = useParams();
  const postId = Number(id);
  const { data: post, isLoading } = useGetPost(postId);
  const { data: comments } = useListComments(postId);
  
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: { authorName: "", content: "" }
  });

  const onSubmit = (values: z.infer<typeof commentSchema>) => {
    createComment.mutate({
      data: {
        postId,
        ...values
      }
    }, {
      onSuccess: () => {
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey(postId) });
        toast({ title: "Comment published", description: "Thank you for sharing your thoughts." });
      }
    });
  };

  const handleDeleteComment = (commentId: number) => {
    if (confirm("Delete this comment?")) {
      deleteComment.mutate({ id: commentId }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey(postId) });
          toast({ title: "Comment deleted" });
        }
      });
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-20 text-center font-serif text-xl text-muted-foreground animate-pulse">Loading story...</div>;
  }

  if (!post) {
    return <div className="container mx-auto py-20 text-center font-serif text-xl">Story not found.</div>;
  }

  return (
    <article className="pb-24">
      {post.coverImageUrl && (
        <div className="w-full h-[40vh] md:h-[60vh] bg-muted relative">
          <img src={post.coverImageUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>
      )}
      
      <div className="container mx-auto px-4 max-w-3xl -mt-20 relative z-10">
        <Link href="/posts" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors bg-background/50 backdrop-blur px-3 py-1 rounded-full">
          <ArrowLeft className="h-4 w-4" /> Back to reading room
        </Link>
        
        <header className="mb-12 bg-background p-8 md:p-12 rounded-xl shadow-sm border border-border/50">
          <div className="flex items-center gap-3 text-sm mb-6 uppercase tracking-wider font-medium text-primary">
            {post.categoryName && <Link href={`/posts?category=${post.categoryId}`} className="hover:underline">{post.categoryName}</Link>}
            <span>&middot;</span>
            <time className="text-muted-foreground">{format(new Date(post.createdAt), "MMMM d, yyyy")}</time>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-8 leading-[1.1]">{post.title}</h1>
          
          <div className="flex items-center justify-between border-t border-border/50 pt-6">
            <div className="flex items-center gap-4">
              {post.authorAvatarUrl ? (
                <img src={post.authorAvatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-serif text-xl">
                  {post.authorName.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-bold text-foreground">
                  <Link href={`/authors/${post.authorId}`} className="hover:text-primary transition-colors">{post.authorName}</Link>
                </p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" /> {post.readingTimeMinutes} min read
                </div>
              </div>
            </div>
            
            <Link href={`/posts/${post.id}/edit`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="h-4 w-4" /> Edit Piece
              </Button>
            </Link>
          </div>
        </header>

        {post.excerpt && (
          <div className="my-10 border-l-4 border-primary pl-6 py-2">
            <p className="text-xl md:text-2xl font-serif italic text-foreground/80 leading-relaxed">
              {post.excerpt}
            </p>
          </div>
        )}

        <div className="prose prose-lg prose-stone dark:prose-invert max-w-none font-serif leading-relaxed mb-16" dangerouslySetInnerHTML={{ __html: post.content }} />
        
        <section className="border-t border-border/50 pt-12">
          <h3 className="text-2xl font-serif font-bold mb-8">Responses ({post.commentCount || 0})</h3>
          
          <div className="bg-secondary/20 p-6 md:p-8 rounded-xl mb-12">
            <h4 className="font-serif font-bold text-lg mb-4">Leave a response</h4>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="authorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Thoughts</FormLabel>
                      <FormControl>
                        <Textarea placeholder="What did you think of this piece?" className="min-h-[100px] bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={createComment.isPending} className="w-full sm:w-auto">
                  {createComment.isPending ? "Publishing..." : "Publish Response"}
                </Button>
              </form>
            </Form>
          </div>

          <div className="space-y-8">
            {comments?.length === 0 ? (
              <p className="text-muted-foreground italic font-serif text-center py-8">Be the first to respond.</p>
            ) : (
              comments?.map(comment => (
                <div key={comment.id} className="flex gap-4 group">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-serif text-lg">
                    {comment.authorName.charAt(0)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold">{comment.authorName}</span>
                        <span className="text-xs text-muted-foreground">{format(new Date(comment.createdAt), "MMM d, yyyy")}</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 p-1 rounded transition-opacity"
                        title="Delete comment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-foreground leading-relaxed text-sm md:text-base">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </article>
  );
}