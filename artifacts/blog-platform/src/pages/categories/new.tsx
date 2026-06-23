import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateCategory, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
});

export default function CategoryNew() {
  const [, setLocation] = useLocation();
  const createCategory = useCreateCategory();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", slug: "", description: "" }
  });

  const nameValue = form.watch("name");
  useEffect(() => {
    if (nameValue) {
      const generatedSlug = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      
      if (!form.formState.dirtyFields.slug) {
        form.setValue("slug", generatedSlug, { shouldValidate: true });
      }
    }
  }, [nameValue, form]);

  const onSubmit = (values: z.infer<typeof categorySchema>) => {
    createCategory.mutate({
      data: {
        ...values,
        description: values.description || undefined,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
        toast({ title: "Topic added successfully." });
        setLocation("/categories");
      },
      onError: () => {
        toast({ title: "Failed to add topic.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Link href="/categories" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to topics
      </Link>
      
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Define a New Topic</h1>
        <p className="text-muted-foreground text-lg">Create a new organizational category for pieces.</p>
      </header>

      <div className="bg-background p-8 rounded-xl border border-border/50 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Personal Essays" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="personal-essays" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What is this topic about?" className="resize-none h-32" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={createCategory.isPending} className="w-full text-lg h-12 mt-4">
              {createCategory.isPending ? "Adding Topic..." : "Add Topic"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}