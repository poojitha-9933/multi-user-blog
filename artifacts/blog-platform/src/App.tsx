import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Posts from "@/pages/posts/index";
import PostShow from "@/pages/posts/show";
import PostNew from "@/pages/posts/new";
import PostEdit from "@/pages/posts/edit";
import Authors from "@/pages/authors/index";
import AuthorShow from "@/pages/authors/show";
import AuthorNew from "@/pages/authors/new";
import AuthorEdit from "@/pages/authors/edit";
import Categories from "@/pages/categories/index";
import CategoryNew from "@/pages/categories/new";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/posts" component={Posts} />
        <Route path="/posts/new">
          <ProtectedRoute><PostNew /></ProtectedRoute>
        </Route>
        <Route path="/posts/:id/edit">
          <ProtectedRoute><PostEdit /></ProtectedRoute>
        </Route>
        <Route path="/posts/:id" component={PostShow} />
        <Route path="/authors" component={Authors} />
        <Route path="/authors/new">
          <ProtectedRoute><AuthorNew /></ProtectedRoute>
        </Route>
        <Route path="/authors/:id/edit">
          <ProtectedRoute><AuthorEdit /></ProtectedRoute>
        </Route>
        <Route path="/authors/:id" component={AuthorShow} />
        <Route path="/categories" component={Categories} />
        <Route path="/categories/new">
          <ProtectedRoute><CategoryNew /></ProtectedRoute>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
