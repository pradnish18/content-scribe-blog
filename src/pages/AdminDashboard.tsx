
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Calendar, FileText, LogOut, Search, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
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
} from '@/components/ui/alert-dialog';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
  createdDate: string;
  publishedDate?: string;
  excerpt: string;
}

const AdminDashboard = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncError, setSyncError] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const navigate = useNavigate();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncError(false);
      toast({
        title: "Connection Restored",
        description: "Syncing posts...",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Connection Lost",
        description: "Working in offline mode.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load posts from API (fallback to localStorage if offline)
  const loadPosts = async (showToast = false) => {
    const isAuth = localStorage.getItem('adminAuth');
    if (!isAuth) {
      navigate('/panel');
      return;
    }
    
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/posts?status=all`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      if (Array.isArray(data.items)) {
        const mapped = data.items.map((p: any) => ({
          id: p._id || p.id,
          title: p.title,
          slug: p.slug,
          status: p.status,
          createdDate: p.createdDate || p.createdAt,
          publishedDate: p.publishedDate,
          excerpt: p.excerpt || '',
        }));
        
        setPosts(mapped);
        localStorage.setItem('cachedPosts', JSON.stringify(mapped));
        setSyncError(false);
        
        if (showToast) {
          toast({
            title: "Synced Successfully",
            description: "All posts are up to date.",
          });
        }
        
        if (mapped.length === 0) {
          // Attempt migration from localStorage if any legacy posts exist
          const token = localStorage.getItem('adminToken');
          const saved = localStorage.getItem('blogPosts');
          if (token && saved) {
            const legacy: any[] = JSON.parse(saved);
            for (const lp of legacy) {
              try {
                await fetch('/api/admin/posts', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    title: lp.title,
                    slug: lp.slug,
                    content: lp.content || '',
                    excerpt: lp.excerpt || '',
                    featuredImage: lp.featuredImage || '',
                    status: lp.status || 'draft',
                  }),
                });
              } catch {}
            }
            // Clear legacy once migrated and refetch
            localStorage.removeItem('blogPosts');
            await loadPosts();
          }
        }
      }
    } catch (error) {
      setSyncError(true);
      toast({
        title: "Sync Failed",
        description: "Unable to load posts. Using cached data.",
        variant: "destructive",
      });
      
      // Fallback to cached posts
      const cached = localStorage.getItem('cachedPosts');
      if (cached) {
        try {
          setPosts(JSON.parse(cached));
        } catch {}
      }
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadPosts().finally(() => setIsLoading(false));
  }, [navigate, isOnline]);

  // Refresh posts when returning from edit
  useEffect(() => {
    const handleStorageChange = () => {
      const savedPosts = localStorage.getItem('blogPosts');
      if (savedPosts) {
        setPosts(JSON.parse(savedPosts));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Also listen for focus event to refresh when returning to tab
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminToken');
    navigate('/auth');
  };

  const handleDeletePost = async (postId: string) => {
    const token = localStorage.getItem('adminToken');
    if (token && /^[a-f\d]{24}$/i.test(postId)) {
      await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    setPosts(prev => prev.filter(p => p.id !== postId));
    setDeletePostId(null);
  };

  const handleViewPost = (slug: string) => {
    window.open(`/post/${slug}`, '_blank');
  };

  const handleEditPost = (postId: string) => {
    navigate(`/admin/post/${postId}/edit`);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || post.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Dynamic stats calculation
  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    drafts: posts.filter(p => p.status === 'draft').length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white">
        <div className="animate-pulse p-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white">
      {/* Floating Navigation */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-6">
        <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-lg shadow-black/20">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-white/80">Manage your blog posts and content</p>
              </div>
              <div className="flex items-center gap-4">
                {!isOnline && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 border border-red-500/50 rounded-md">
                    <WifiOff className="h-3 w-3 text-red-400" />
                    <span className="text-xs text-red-400">Offline</span>
                  </div>
                )}
                {syncError && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => loadPosts(true)}
                    disabled={isSyncing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                    Sync Now
                  </Button>
                )}
                <Link to="/">
                  <Button
                    variant="ghost"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Site
                  </Button>
                </Link>
                <Button onClick={handleLogout} variant="ghost" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-6 pt-32">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-lg shadow-black/20 animate-fade-in" style={{ animationDelay: '50ms' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-white/70">Total Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-white">{stats.total}</span>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-lg shadow-black/20 animate-fade-in" style={{ animationDelay: '50ms' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-white/70">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-green-600">{stats.published}</span>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Eye className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-lg shadow-black/20 animate-fade-in" style={{ animationDelay: '50ms' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-white/70">Drafts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-orange-600">{stats.drafts}</span>
                <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Edit className="h-4 w-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
          <Card className="bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-lg shadow-black/20 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-xl font-semibold text-white">Blog Posts</CardTitle>
              <Link to="/admin/post/new">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Write New Post
                </Button>
              </Link>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus('all')}
                >
                  All
                </Button>
                <Button
                  variant={selectedStatus === 'published' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus('published')}
                >
                  Published
                </Button>
                <Button
                  variant={selectedStatus === 'draft' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus('draft')}
                >
                  Drafts
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-white/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No posts found</h3>
                <p className="text-white/80 mb-6">
                  {searchTerm || selectedStatus !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : "You haven't created any posts yet"}
                </p>
                <Link to="/admin/post/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Post
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-white/70">Title</TableHead>
                      <TableHead className="text-white/70">Status</TableHead>
                      <TableHead className="text-white/70">Created</TableHead>
                      <TableHead className="text-white/70">Published</TableHead>
                      <TableHead className="text-white/70 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts.map((post) => (
                      <TableRow key={post.id} className="hover:bg-white/5">
                        <TableCell>
                          <div>
                            <div className="font-medium text-white">{post.title}</div>
                            <div className="text-sm text-white/70 mt-1">
                              {post.excerpt.substring(0, 60)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={post.status === 'published' ? 'default' : 'secondary'}
                            className={post.status === 'published' 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            }
                          >
                            {post.status === 'published' ? 'Published' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-white/70">
                            <Calendar className="h-4 w-4" />
                            {formatDate(post.createdDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {post.publishedDate ? (
                            <div className="flex items-center gap-2 text-white/70">
                              <Calendar className="h-4 w-4" />
                              {formatDate(post.publishedDate)}
                            </div>
                          ) : (
                            <span className="text-white/50">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {post.status === 'published' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleViewPost(post.slug)}
                                title="View post"
                              >
                                <Eye className="h-4 w-4 text-blue-400 hover:text-blue-600" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditPost(post.id)}
                              title="Edit post"
                            >
                              <Edit className="h-4 w-4 text-yellow-400 hover:text-yellow-600" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Delete post"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the post "{post.title}". This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeletePost(post.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
