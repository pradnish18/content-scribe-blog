import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, Sparkles, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  createdDate: string;
  featuredImage: string;
  status: 'published' | 'draft';
}

const Favorites = () => {
  const [favoritePosts, setFavoritePosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('favorites') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    loadFavoritePosts();
  }, [favorites]);

  const loadFavoritePosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        const allPosts = data.items || [];
        const filtered = allPosts.filter((post: any) =>
          favorites.includes(post.slug)
        );
        setFavoritePosts(
          filtered.map((p: any) => ({
            id: p._id || p.id,
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt,
            createdDate: p.createdDate || p.createdAt,
            featuredImage: p.featuredImage,
            status: p.status,
          }))
        );
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
    setIsLoading(false);
  };

  const removeFavorite = async (slug: string) => {
    const updated = favorites.filter((s) => s !== slug);
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));

    const token = localStorage.getItem('userToken');
    if (token) {
      try {
        await fetch(`/api/user/favorites/${slug}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Silent fail
      }
    }
  };

  const calculateReadTime = (excerpt: string) => {
    const words = excerpt.split(' ').length;
    return Math.ceil(words / 200);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                ContentScribe
              </span>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-8 w-8 text-red-500 fill-red-500" />
              <h1 className="text-4xl font-bold text-gray-900">My Favorites</h1>
            </div>
            <p className="text-lg text-gray-600">
              {favoritePosts.length} {favoritePosts.length === 1 ? 'article' : 'articles'} saved
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
                  <div className="bg-gray-200 h-6 rounded w-3/4 mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-full"></div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && favoritePosts.length === 0 && (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                No favorites yet
              </h2>
              <p className="text-gray-600 mb-6">
                Start adding articles to your favorites to see them here
              </p>
              <Link to="/">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Explore Articles
                </Button>
              </Link>
            </div>
          )}

          {/* Favorites Grid */}
          {!isLoading && favoritePosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoritePosts.map((post) => (
                <Card
                  key={post.id}
                  className="group hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <Link to={`/post/${post.slug}`}>
                    {post.featuredImage && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <Badge className="absolute top-3 right-3 bg-white/90 text-gray-900">
                          {post.status}
                        </Badge>
                      </div>
                    )}
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {calculateReadTime(post.excerpt)} min read
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            removeFavorite(post.slug);
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Heart className="h-4 w-4 fill-red-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">&copy; 2024 ContentScribe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Favorites;
