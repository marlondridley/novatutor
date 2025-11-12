import Link from 'next/link';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Sample blog posts - in a real app, these would come from a CMS or database
const blogPosts = [
  {
    id: 1,
    title: "5 Study Techniques That Actually Work (Backed by Science)",
    excerpt: "Discover evidence-based study methods that can help you learn more effectively and retain information longer.",
    author: "Dr. Sarah Mitchell",
    date: "November 1, 2025",
    category: "Study Tips",
    readTime: "5 min read",
    featured: true,
  },
  {
    id: 2,
    title: "How AI is Revolutionizing Education: A Parent's Guide",
    excerpt: "Learn how artificial intelligence tools like Study Coach are transforming the way students learn and how parents can support this new approach.",
    author: "Michael Chen",
    date: "October 28, 2025",
    category: "AI & Education",
    readTime: "7 min read",
    featured: true,
  },
  {
    id: 3,
    title: "Building Better Study Habits: A Step-by-Step Guide",
    excerpt: "Transform your study routine with these practical strategies for developing consistent, effective study habits.",
    author: "Jennifer Lopez",
    date: "October 25, 2025",
    category: "Study Tips",
    readTime: "6 min read",
    featured: false,
  },
  {
    id: 4,
    title: "The Socratic Method: Why We Don't Just Give Answers",
    excerpt: "Understanding the teaching philosophy behind Study Coach and why guiding students to discover answers leads to deeper learning.",
    author: "Dr. Emily Roberts",
    date: "October 20, 2025",
    category: "Teaching Methods",
    readTime: "8 min read",
    featured: false,
  },
  {
    id: 5,
    title: "Test Anxiety: Strategies for Success",
    excerpt: "Practical tips and techniques to help students manage test anxiety and perform their best on exams.",
    author: "Dr. Sarah Mitchell",
    date: "October 15, 2025",
    category: "Mental Health",
    readTime: "5 min read",
    featured: false,
  },
  {
    id: 6,
    title: "How to Help Your Child with Homework (Without Doing It For Them)",
    excerpt: "A guide for parents on providing the right level of support to foster independence and confidence in students.",
    author: "Michael Chen",
    date: "October 10, 2025",
    category: "Parenting",
    readTime: "6 min read",
    featured: false,
  },
];

export default function BlogPage() {
  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Study Coach Blog
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tips, insights, and strategies to help students succeed
          </p>
        </div>

        {/* Featured Posts */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Featured Articles</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {featuredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge>{post.category}</Badge>
                    <span className="text-sm text-muted-foreground">• {post.readTime}</span>
                  </div>
                  <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{post.date}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Posts */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Recent Articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {regularPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{post.category}</Badge>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{post.date}</span>
                      </div>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16">
          <Card className="bg-muted">
            <CardHeader className="text-center">
              <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-2xl">Stay Updated</CardTitle>
              <CardDescription className="text-base">
                Get the latest study tips, educational insights, and Study Coach updates delivered to your inbox
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="max-w-md mx-auto flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2 whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
              <p className="text-xs text-center text-muted-foreground mt-4">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Message */}
        <div className="mt-12 text-center text-muted-foreground">
          <p className="text-sm italic">
            Note: This is a preview of our blog. Full articles coming soon!
          </p>
        </div>
      </div>
    </div>
  );
}

