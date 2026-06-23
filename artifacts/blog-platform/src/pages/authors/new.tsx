import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateAuthor, getListAuthorsQueryKey } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const authorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Must be a valid email address"),
  bio: z.string().optional(),
  avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
});

export default function AuthorNew() {
  const [, setLocation] = useLocation();
  const createAuthor = useCreateAuthor();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof authorSchema>>({
    resolver: zodResolver(authorSchema),
    defaultValues: { name: "", email: "", bio: "", avatarUrl: "" }
  });

  const onSubmit = (values: z.infer<typeof authorSchema>) => {
    createAuthor.mutate({
      data: {
        ...values,
        bio: values.bio || undefined,
        avatarUrl: values.avatarUrl || undefined,
      }
    }, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListAuthorsQueryKey() });
        toast({ title: "Writer profile created." });
        setLocation(`/authors/${data.id}`);
      },
      onError: () => {
        toast({ title: "Failed to create profile.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link href="/authors" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to writers
      </Link>
      
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Join as a Writer</h1>
        <p className="text-muted-foreground text-lg">Create a profile to start publishing your work.</p>
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
                    <Input placeholder="Virginia Woolf" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="virginia@bloomsbury.com" {...field} />
                  </FormControl>
                  <FormDescription>Used for contact. Will be visible on your profile.</FormDescription>
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
                    <Textarea placeholder="A few words about yourself and your writing..." className="resize-none h-32" {...field} />
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

            <Button type="submit" disabled={createAuthor.isPending} className="w-full text-lg h-12 mt-4">
              {createAuthor.isPending ? "Creating Profile..." : "Create Profile"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}