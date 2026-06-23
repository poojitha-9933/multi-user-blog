import { useGetAuthor, useUpdateAuthor, getGetAuthorQueryKey, getListAuthorsQueryKey } from "@workspace/api-client-react";
import { useParams, useLocation, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const authorUpdateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().optional(),
  avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
});

export default function AuthorEdit() {
  const { id } = useParams();
  const authorId = Number(id);
  const [, setLocation] = useLocation();
  const { data: author, isLoading } = useGetAuthor(authorId);
  const updateAuthor = useUpdateAuthor();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof authorUpdateSchema>>({
    resolver: zodResolver(authorUpdateSchema),
    defaultValues: {
      name: "",
      bio: "",
      avatarUrl: "",
    }
  });

  useEffect(() => {
    if (author) {
      form.reset({
        name: author.name,
        bio: author.bio || "",
        avatarUrl: author.avatarUrl || "",
      });
    }
  }, [author, form]);

  const onSubmit = (values: z.infer<typeof authorUpdateSchema>) => {
    updateAuthor.mutate({
      id: authorId,
      data: {
        ...values,
        bio: values.bio || undefined,
        avatarUrl: values.avatarUrl || undefined,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAuthorQueryKey(authorId) });
        queryClient.invalidateQueries({ queryKey: getListAuthorsQueryKey() });
        toast({ title: "Profile updated successfully." });
        setLocation(`/authors/${authorId}`);
      },
      onError: () => {
        toast({ title: "Failed to update profile.", variant: "destructive" });
      }
    });
  };

  if (isLoading) {
    return <div className="container mx-auto py-20 text-center font-serif text-xl animate-pulse text-muted-foreground">Loading profile...</div>;
  }

  if (!author) {
    return <div className="container mx-auto py-20 text-center font-serif text-xl">Author not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link href={`/authors/${authorId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to profile
      </Link>
      
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Edit Profile</h1>
        <p className="text-muted-foreground text-lg">Update {author.name}'s writer details.</p>
      </header>

      <div className="bg-background p-8 rounded-xl border border-border/50 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biography</FormLabel>
                  <FormControl>
                    <Textarea className="resize-none h-32" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={updateAuthor.isPending} className="w-full text-lg h-12 mt-4">
              {updateAuthor.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}