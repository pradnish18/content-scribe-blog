
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, ArrowLeft, Share2, Clock, Sparkles, Twitter, Facebook, Linkedin, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DOMPurify from 'dompurify';
import { AuthModal } from '@/components/AuthModal';
import { toast } from '@/hooks/use-toast';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  featuredImage: string;
  publishedDate: string;
  status: 'published' | 'draft';
}

const Post = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Favorites state (local + server sync)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('favorites') || '[]'); } catch { return []; }
  });

  const toggleFavorite = async (slug: string) => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      setShowAuthModal(true);
      toast({
        title: "Sign in required",
        description: "Please sign in to add favorites.",
      });
      return;
    }

    const previous = [...favorites];
    const next = previous.includes(slug)
      ? previous.filter(s => s !== slug)
      : [...previous, slug];
    setFavorites(next);
    localStorage.setItem('favorites', JSON.stringify(next));
    if (token) {
      try {
        const res = await fetch(`/api/user/favorites/${slug}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setFavorites(data.favorites || []);
          localStorage.setItem('favorites', JSON.stringify(data.favorites || []));
        } else {
          // revert on failure
          setFavorites(previous);
          localStorage.setItem('favorites', JSON.stringify(previous));
        }
      } catch {
        setFavorites(previous);
        localStorage.setItem('favorites', JSON.stringify(previous));
      }
    }
  };

  useEffect(() => {
    let cancel = false;
    async function load() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/posts/slug/${slug}`);
        if (!cancel) {
          if (res.ok) setPost(await res.json());
          else setPost(null);
        }
      } catch {
        if (!cancel) setPost(null);
      }
      if (!cancel) setIsLoading(false);
    }
    load();
    return () => { cancel = true; };
  }, [slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateReadTime = (content: string) => {
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / 200);
    return minutes;
  };

  const handleShare = (platform?: string) => {
    const url = window.location.href;
    const title = post?.title || '';
    
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    } else if (navigator.share) {
      navigator.share({ title, url });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  useEffect(() => {
    if (post?.title) {
      document.title = `${post.title} | Creative Insights`;
    }
  }, [post?.title]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse max-w-4xl mx-auto">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded-xl mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Post Not Found</h1>
          <p className="text-slate-600 mb-8">The post you're looking for doesn't exist.</p>
          <Link to="/">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                ContentScribe
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              {post?.slug && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(post.slug)}
                  aria-label="Toggle favorite"
                >
                  <Heart
                    className={`h-4 w-4 ${favorites.includes(post.slug) ? 'text-red-500 fill-red-500' : 'text-slate-600'}`}
                  />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => handleShare()}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Post Content */}
      <article className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Post Header */}
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-6 animate-fade-in">
              <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                Article
              </Badge>
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {calculateReadTime(post.content)} min read
              </span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">{formatDate(post.publishedDate)}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight animate-fade-in" style={{ animationDelay: '100ms' }}>
              {post.title}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed animate-fade-in" style={{ animationDelay: '200ms' }}>
              A deep dive into the topic with insights and practical examples.
            </p>
          </header>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="mb-12 -mx-4 sm:-mx-6 lg:-mx-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-64 md:h-[500px] object-cover"
              />
            </div>
          )}

          {/* Post Content */}
          <div 
            className="prose prose-lg prose-gray max-w-none animate-fade-in break-words overflow-wrap-anywhere"
            style={{ 
              animationDelay: '400ms',
              fontSize: '1.125rem',
              lineHeight: '1.8',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto'
            }}
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(post.content, {
                ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code', 'pre', 'img'],
                ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'class'],
                ALLOW_DATA_ATTR: false
              })
            }}
          />

          {/* Share Section */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share this article</h3>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('twitter')}
                className="gap-2"
              >
                <Twitter className="h-4 w-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('facebook')}
                className="gap-2"
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('linkedin')}
                className="gap-2"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Button>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Want to read more?</h3>
            <p className="text-gray-600 mb-6">Discover more insightful articles on our blog</p>
            <Link to="/">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Explore All Articles
              </Button>
            </Link>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold">ContentScribe</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                A modern platform for sharing stories, ideas, and insights.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 ContentScribe. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          toast({
            title: "Welcome!",
            description: "You're now signed in.",
          });
          window.location.reload();
        }}
      />
    </div>
  );
};

export default Post;
