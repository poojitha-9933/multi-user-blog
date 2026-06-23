import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useListAuthors, useListCategories } from "@workspace/api-client-react";

const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  coverImageUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  authorId: z.coerce.number().min(1, "Author is required"),
  categoryId: z.coerce.number().optional().nullable(),
  published: z.boolean().default(false),
});

export type PostFormValues = z.infer<typeof postSchema>;

interface PostFormProps {
  initialValues?: Partial<PostFormValues>;
  onSubmit: (values: PostFormValues) => void;
  isSubmitting?: boolean;
}

export function PostForm({ initialValues, onSubmit, isSubmitting }: PostFormProps) {
  const { data: authors } = useListAuthors();
  const { data: categories } = useListCategories();

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: initialValues?.title || "",
      slug: initialValues?.slug || "",
      excerpt: initialValues?.excerpt || "",
      content: initialValues?.content || "",
      coverImageUrl: initialValues?.coverImageUrl || "",
      authorId: initialValues?.authorId || 0,
      categoryId: initialValues?.categoryId || null,
      published: initialValues?.published || false,
    }
  });

  // Auto-generate slug from title if slug is empty or user is typing title
  const titleValue = form.watch("title");
  useEffect(() => {
    if (titleValue && !initialValues?.slug) {
      const generatedSlug = titleValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      
      // Only set if user hasn't manually edited the slug
      if (!form.formState.dirtyFields.slug) {
        form.setValue("slug", generatedSlug, { shouldValidate: true });
      }
    }
  }, [titleValue, form, initialValues?.slug]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-serif text-lg">Title</FormLabel>
                  <FormControl>
                    <Input placeholder="A captivating headline..." className="text-xl font-serif h-14 bg-background" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excerpt</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A brief summary of the piece..." className="resize-none bg-background" {...field} />
                  </FormControl>
                  <FormDescription>Shown in lists and search results.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell your story..." className="min-h-[400px] font-serif leading-relaxed text-base bg-background" {...field} />
                  </FormControl>
                  <FormDescription>Supports HTML content for rich formatting.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6 bg-secondary/20 p-6 rounded-xl border border-border/50 h-fit">
            <h3 className="font-serif font-bold text-lg mb-4 border-b border-border/50 pb-2">Publishing Details</h3>
            
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="my-article-title" {...field} className="bg-background" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="authorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author</FormLabel>
                  <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? field.value.toString() : undefined}>
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select an author" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {authors?.map(author => (
                        <SelectItem key={author.id} value={author.id.toString()}>{author.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={(val) => field.onChange(val === "none" ? null : Number(val))} value={field.value ? field.value.toString() : "none"}>
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {categories?.map(category => (
                        <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coverImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} className="bg-background" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4 bg-background">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base font-serif">Publish immediately</FormLabel>
                    <FormDescription>
                      Make this piece visible to all readers.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-lg">
              {isSubmitting ? "Saving..." : "Save Piece"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}