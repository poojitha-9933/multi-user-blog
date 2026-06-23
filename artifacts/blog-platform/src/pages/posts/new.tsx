import { useCreatePost, getListPostsQueryKey } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { PostForm, PostFormValues } from "@/components/post-form";
import { ArrowLeft } from "lucide-react";

export default function PostNew() {
  const [, setLocation] = useLocation();
  const createPost = useCreatePost();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = (values: PostFormValues) => {
    createPost.mutate({
      data: {
        ...values,
        categoryId: values.categoryId || undefined,
        coverImageUrl: values.coverImageUrl || undefined,
        excerpt: values.excerpt || undefined,
      }
    }, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
        toast({ title: "Piece saved successfully." });
        setLocation(`/posts/${data.id}`);
      },
      onError: () => {
        toast({ title: "Failed to save.", description: "Please check your inputs and try again.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Link href="/posts" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to reading room
      </Link>
      
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Craft a New Piece</h1>
        <p className="text-muted-foreground text-lg">Share your thoughts, stories, and ideas with the world.</p>
      </header>

      <PostForm onSubmit={handleSubmit} isSubmitting={createPost.isPending} />
    </div>
  );
}