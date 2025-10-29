
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Search, WifiOff, RefreshCw, Clock, ArrowRight, Sparkles, TrendingUp, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AuthModal } from '@/components/AuthModal';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  createdDate: string;
  featuredImage: string;
  status: 'published' | 'draft';
}

const Index = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('favorites') || '[]'); } catch { return []; }
  });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncError, setSyncError] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const postsRef = useRef<HTMLDivElement>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleOnline = () => {
      setIsOnline(true);
      setSyncError(false);
      toast({
        title: "Connection Restored",
        description: "You're back online. Syncing data...",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Connection Lost",
        description: "You're offline. Changes will sync when connection is restored.",
        variant: "destructive",
      });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadPosts = async (controller: AbortController, retry = 0) => {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('q', search.trim());
      const res = await fetch(`/api/posts?${params.toString()}`, { signal: controller.signal });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      const items = (data.items || []).sort((a: any, b: any) => 
        new Date(b.publishedDate || b.createdAt).getTime() - new Date(a.publishedDate || a.createdAt).getTime()
      ).map((p: any) => ({
        id: p._id || p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        createdDate: p.createdDate || p.createdAt,
        featuredImage: p.featuredImage,
        status: p.status,
      }));
      setPosts(items);
      setSyncError(false);
      retryCount.current = 0;
      
      // Cache successful response
      localStorage.setItem('cachedPosts', JSON.stringify(items));
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      
      // Retry with exponential backoff
      if (retry < maxRetries && isOnline) {
        const delay = Math.min(1000 * Math.pow(2, retry), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return loadPosts(controller, retry + 1);
      }
      
      // Fallback to localStorage silently
      const cached = localStorage.getItem('cachedPosts');
      if (cached) {
        try {
          setPosts(JSON.parse(cached));
          // Only show error if we have no cached data
          if (retry >= maxRetries) {
            setSyncError(true);
          }
        } catch {}
      } else if (retry >= maxRetries) {
        // Only show error toast if no cached data and all retries failed
        setSyncError(true);
        toast({
          title: "Unable to connect",
          description: "Please check your internet connection.",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setIsLoading(true);
      await loadPosts(controller);
      setIsLoading(false);
    }
    const t = setTimeout(load, 250);
    return () => { controller.abort(); clearTimeout(t); };
  }, [search, isOnline]);

  useEffect(() => {
    document.title = search ? `Search: ${search} | My Blog` : 'My Blog';
  }, [search]);

  const toggleFavorite = async (slug: string) => {
    // Check if user is logged in
    const token = localStorage.getItem('userToken');
    if (!token) {
      setShowAuthModal(true);
      toast({
        title: "Sign in required",
        description: "Please sign in to add favorites.",
      });
      return;
    }

    // optimistic update
    const previousFavorites = [...favorites];
    setFavorites(prev => {
      const exists = prev.includes(slug);
      const next = exists ? prev.filter(s => s !== slug) : [...prev, slug];
      localStorage.setItem('favorites', JSON.stringify(next));
      return next;
    });
    
    // sync to API
    if (token && isOnline) {
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
          throw new Error('Failed to sync favorite');
        }
      } catch (error) {
        // Revert on error
        setFavorites(previousFavorites);
        localStorage.setItem('favorites', JSON.stringify(previousFavorites));
        toast({
          title: "Sync Failed",
          description: "Unable to sync favorite. Please try again.",
          variant: "destructive",
        });
      }
    } else if (!isOnline) {
      toast({
        title: "Offline Mode",
        description: "Favorite saved locally. Will sync when online.",
      });
    }
  };

  // on mount, if logged in, sync favorites from API
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token || !isOnline) return;
    
    (async () => {
      try {
        const res = await fetch('/api/user/favorites', { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        
        if (res.ok) {
          const data = await res.json();
          setFavorites(data.favorites || []);
          localStorage.setItem('favorites', JSON.stringify(data.favorites || []));
        }
      } catch (error) {
        console.error('Failed to sync favorites:', error);
      }
    })();
  }, [isOnline]);

  const handleManualRefresh = async () => {
    setIsLoading(true);
    const controller = new AbortController();
    await loadPosts(controller);
    setIsLoading(false);
    toast({
      title: "Refreshed",
      description: "Posts have been reloaded.",
    });
  };

  const calculateReadTime = (excerpt: string) => {
    const words = excerpt.split(' ').length;
    const minutes = Math.ceil(words / 200);
    return minutes;
  };

  const featuredPost = posts.length > 0 ? posts[0] : null;
  const regularPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  ContentScribe
                </span>
              </Link>
              {!isOnline && (
                <Badge variant="destructive" className="gap-1">
                  <WifiOff className="h-3 w-3" />
                  Offline
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4">
              {syncError && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleManualRefresh}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
              )}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search articles..."
                  className="pl-10 pr-4 py-2 w-64 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                />
              </div>
              <button
                onClick={() => {
                  if (!localStorage.getItem('userToken')) {
                    setShowAuthModal(true);
                    toast({
                      title: "Sign in required",
                      description: "Please sign in to view this page.",
                    });
                  } else {
                    navigate('/about');
                  }
                }}
              >
                <Button variant="ghost" size="sm">About</Button>
              </button>
              {localStorage.getItem('userToken') && (
                <Link to="/favorites">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Heart className="h-4 w-4" />
                    My Favorites
                  </Button>
                </Link>
              )}
              <button onClick={() => {
                if (localStorage.getItem('userToken')) {
                  // Show account menu or logout
                  localStorage.removeItem('userToken');
                  localStorage.removeItem('username');
                  localStorage.removeItem('favorites');
                  window.location.reload();
                } else {
                  setShowAuthModal(true);
                }
              }}>
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  {localStorage.getItem('userToken') ? 'Sign out' : 'Sign in'}
                </Button>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Featured Post */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Header */}
          <div className="text-center mb-16 animate-fade-in">
            <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
              <TrendingUp className="h-3 w-3 mr-1" />
              Latest Insights
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent leading-tight">
              Stories, Ideas & Insights
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Exploring technology, design, and creativity through thoughtful writing and analysis.
            </p>
          </div>

          {syncError && (
            <Alert className="mb-8 border-blue-200 bg-blue-50">
              <WifiOff className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 flex items-center justify-between">
                <span>Showing cached content. Server may be starting up...</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualRefresh}
                  className="ml-4 border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Featured Post */}
          {featuredPost && (
            <Link to={`/post/${featuredPost.slug}`} className="block group mb-16 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <Card className="overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative h-64 md:h-full overflow-hidden">
                    {featuredPost.featuredImage ? (
                      <img
                        src={featuredPost.featuredImage}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <BookOpen className="h-24 w-24 text-white/20" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 text-gray-900 backdrop-blur-sm">
                        Featured
                      </Badge>
                    </div>
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {calculateReadTime(featuredPost.excerpt)} min read
                      </span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(featuredPost.createdDate), { addSuffix: true })}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 group-hover:text-blue-600 transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-gray-600 text-lg mb-6 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center gap-4">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 group-hover:gap-3 transition-all">
                        Read Article
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(featuredPost.slug);
                        }}
                        className="hover:scale-110 transition-transform"
                      >
                        <Heart
                          className={`h-5 w-5 transition-colors ${
                            favorites.includes(featuredPost.slug)
                              ? 'fill-red-500 text-red-500'
                              : 'text-gray-400 hover:text-red-500'
                          }`}
                        />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          )}
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Latest Articles</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{regularPosts.length} articles</span>
            </div>
          </div>
          <div 
            ref={postsRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
          {isLoading ? (
            // Modern skeleton loaders
            [...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse overflow-hidden border-gray-200">
                <div className="h-48 bg-gray-200"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-3 w-1/4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))
          ) : regularPosts.length === 0 && !featuredPost ? (
            <div className="col-span-full text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {search ? 'No articles found' : 'No articles yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {search ? 'Try adjusting your search terms' : 'Start creating amazing content!'}
              </p>
              {search && (
                <Button onClick={() => setSearch('')} variant="outline">
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            regularPosts.map((post, index) => (
              <Card
                key={post.id}
                className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-gray-200 hover:border-blue-300 animate-fade-in bg-white"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Link to={`/post/${post.slug}`} className="block">
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    {post.featuredImage ? (
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-white/30" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {calculateReadTime(post.excerpt)} min
                      </span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(post.createdDate), { addSuffix: true })}</span>
                    </div>
                    <CardTitle className="text-xl mb-3 text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 font-bold">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </CardDescription>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-600 group-hover:gap-2 flex items-center transition-all">
                        Read more
                        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(post.slug);
                        }}
                        className="hover:scale-110 transition-transform h-8 w-8"
                      >
                        <Heart
                          className={`h-4 w-4 transition-colors ${
                            favorites.includes(post.slug)
                              ? 'fill-red-500 text-red-500'
                              : 'text-gray-400 hover:text-red-500'
                          }`}
                        />
                      </Button>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))
          )}
          </div>
        </div>
      </section>

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
                A modern platform for sharing stories, ideas, and insights. Built with passion for great content and exceptional user experience.
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
                <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; 2024 ContentScribe. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
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

export default Index;
