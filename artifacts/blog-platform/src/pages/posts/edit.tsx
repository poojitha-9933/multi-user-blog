import { useGetPost, useUpdatePost, useDeletePost, getGetPostQueryKey, getListPostsQueryKey } from "@workspace/api-client-react";
import { useLocation, useParams, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { PostForm, PostFormValues } from "@/components/post-form";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function PostEdit() {
  const { id } = useParams();
  const postId = Number(id);
  const [, setLocation] = useLocation();
  const { data: post, isLoading } = useGetPost(postId);
  
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = (values: PostFormValues) => {
    updatePost.mutate({
      id: postId,
      data: {
        ...values,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(postId) });
        queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
        toast({ title: "Changes saved successfully." });
        setLocation(`/posts/${postId}`);
      },
      onError: () => {
        toast({ title: "Failed to save changes.", description: "Please try again.", variant: "destructive" });
      }
    });
  };

  const handleDelete = () => {
    deletePost.mutate({ id: postId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
        toast({ title: "Piece deleted permanently." });
        setLocation('/posts');
      }
    });
  };

  if (isLoading) {
    return <div className="container mx-auto py-20 text-center font-serif text-xl text-muted-foreground animate-pulse">Loading piece...</div>;
  }

  if (!post) {
    return <div className="container mx-auto py-20 text-center font-serif text-xl">Story not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Link href={`/posts/${post.id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to piece
      </Link>
      
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Edit Piece</h1>
          <p className="text-muted-foreground text-lg">Refining "{post.title}"</p>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground">
              <Trash2 className="h-4 w-4 mr-2" /> Delete Piece
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you completely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your piece and remove it from the platform.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete Permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </header>

      <PostForm 
        initialValues={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || "",
          content: post.content,
          coverImageUrl: post.coverImageUrl || "",
          authorId: post.authorId,
          categoryId: post.categoryId || null,
          published: post.published,
        }} 
        onSubmit={handleSubmit} 
        isSubmitting={updatePost.isPending} 
      />
    </div>
  );
}