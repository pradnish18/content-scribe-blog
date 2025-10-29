
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Eye, ArrowLeft, Upload, X, Bold, Italic, List, Quote, Link2, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import DOMPurify from 'dompurify';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  status: 'published' | 'draft';
  createdDate: string;
  publishedDate?: string;
}

const PostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';
  
  const [post, setPost] = useState<BlogPost>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    status: 'draft',
    createdDate: new Date().toISOString()
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [initialPost, setInitialPost] = useState<BlogPost | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingContentImage, setIsUploadingContentImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    const isAuth = localStorage.getItem('adminAuth');
    if (!isAuth) {
      navigate('/panel');
      return;
    }

    // Load post if editing
    if (isEditing) {
      setIsLoading(true);
      const load = async () => {
        try {
          const token = localStorage.getItem('adminToken');
          if (token) {
            const res = await fetch(`/api/admin/posts/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
              const data = await res.json();
              const loadedPost = {
                id: data._id || data.id,
                title: data.title || '',
                slug: data.slug || '',
                content: data.content || '',
                excerpt: data.excerpt || '',
                featuredImage: data.featuredImage || '',
                status: data.status || 'draft',
                createdDate: data.createdDate || data.createdAt || new Date().toISOString(),
                publishedDate: data.publishedDate,
              };
              setPost(loadedPost);
              setInitialPost(loadedPost);
              setUnsavedChanges(false);
              setIsLoading(false);
              return;
            }
          }
        } catch {}
        // Fallback to localStorage
        const savedPosts = localStorage.getItem('blogPosts');
        if (savedPosts) {
          const posts = JSON.parse(savedPosts);
          const existingPost = posts.find((p: BlogPost) => p.id === id);
          if (existingPost) {
            setPost(existingPost);
            setInitialPost(existingPost);
          }
        }
        setUnsavedChanges(false);
        setIsLoading(false);
      };
      load();
    } else {
      // For new posts, set initial post to empty state
      setInitialPost(post);
      setUnsavedChanges(false);
    }
  }, [id, isEditing, navigate]);

  // Check for unsaved changes
  useEffect(() => {
    if (!initialPost) return;
    
    const hasChanges = 
      post.title !== initialPost.title ||
      post.slug !== initialPost.slug ||
      post.content !== initialPost.content ||
      post.excerpt !== initialPost.excerpt ||
      post.featuredImage !== initialPost.featuredImage ||
      post.status !== initialPost.status;
    
    setUnsavedChanges(hasChanges);
  }, [post, initialPost]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setPost(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
    
  };

  const handleSave = async (newStatus?: 'published' | 'draft') => {
    setIsSaving(true);
    // Generate excerpt if not provided
    const excerpt = post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
    const payload = {
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt,
      featuredImage: post.featuredImage,
      status: newStatus || post.status,
    };
    const token = localStorage.getItem('adminToken');
    try {
      if (token) {
        const res = await fetch(isEditing ? `/api/admin/posts/${id}` : '/api/admin/posts', {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          const updatedPost: BlogPost = {
            id: data._id || data.id,
            title: data.title,
            slug: data.slug,
            content: data.content,
            excerpt: data.excerpt,
            featuredImage: data.featuredImage,
            status: data.status,
            createdDate: data.createdDate || data.createdAt,
            publishedDate: data.publishedDate,
          };
          setPost(updatedPost);
          setInitialPost(updatedPost);
          setUnsavedChanges(false);
          setIsSaving(false);
          navigate('/admin/dashboard');
          return;
        } else {
          const err = await res.json().catch(() => ({}));
          alert(err.error || 'Save failed');
        }
      }
    } catch {}

    // Fallback to localStorage when API/token not available
    const localUpdated: BlogPost = {
      ...post,
      id: post.id || Date.now().toString(),
      excerpt,
      status: newStatus || post.status,
      publishedDate: newStatus === 'published' ? new Date().toISOString() : post.publishedDate,
    };
    const savedPosts = localStorage.getItem('blogPosts');
    let posts = savedPosts ? JSON.parse(savedPosts) : [];
    if (isEditing) posts = posts.map((p: BlogPost) => p.id === localUpdated.id ? localUpdated : p);
    else posts.push(localUpdated);
    localStorage.setItem('blogPosts', JSON.stringify(posts));
    window.dispatchEvent(new Event('storage'));
    setPost(localUpdated);
    setUnsavedChanges(false);
    setIsSaving(false);
    navigate('/admin/dashboard');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setIsUploadingImage(true);
    setError(null);
    console.log('Starting featured image upload...');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      console.log('Featured image uploaded successfully:', data.url);
      setPost(prev => ({ ...prev, featuredImage: data.url }));
      
      setError(null);
    } catch (error: any) {
      console.error('Featured image upload error:', error);
      const errorMsg = 'Failed to upload featured image. Please try again.';
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      if (e.target) e.target.value = '';
    }
  };

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setIsUploadingContentImage(true);
    setError(null);
    console.log('Starting content image upload...');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      console.log('Content image uploaded successfully:', data.url);
      
      // Insert image tag at cursor position
      const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const imageTag = `<img src="${data.url}" alt="Uploaded image" class="w-full rounded-lg my-4" />`;
        const newContent = textarea.value.substring(0, start) + imageTag + textarea.value.substring(end);
        setPost(prev => ({ ...prev, content: newContent }));
        
        setError(null);
        
        // Set cursor after inserted image
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + imageTag.length, start + imageTag.length);
        }, 0);
      } else {
        console.warn('Textarea not found for cursor positioning');
      }
    } catch (error: any) {
      console.error('Content image upload error:', error);
      const errorMsg = 'Failed to upload content image. Please try again.';
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setIsUploadingContentImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const insertFormatting = (type: string) => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let replacement = '';

    switch (type) {
      case 'bold':
        replacement = `<strong>${selectedText || 'bold text'}</strong>`;
        break;
      case 'italic':
        replacement = `<em>${selectedText || 'italic text'}</em>`;
        break;
      case 'list':
        replacement = `<ul>\n<li>${selectedText || 'list item'}</li>\n</ul>`;
        break;
      case 'quote':
        replacement = `<blockquote>${selectedText || 'quote'}</blockquote>`;
        break;
      case 'link':
        replacement = `<a href="https://example.com">${selectedText || 'link text'}</a>`;
        break;
      case 'image':
        // Trigger file input for image upload
        document.getElementById('content-image-upload')?.click();
        return;
    }

    const newContent = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    setPost(prev => ({ ...prev, content: newContent }));
    
  };

  // Error boundary
  if (error && !post.title) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/admin/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="animate-pulse p-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Floating Navigation */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-7xl px-6">
        <div className="bg-white/90 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg shadow-black/5">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/admin/dashboard')}
                  className="text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    {isEditing ? 'Edit Post' : 'New Post'}
                  </h1>
                  {unsavedChanges && (
                    <p className="text-sm text-orange-600">Unsaved changes</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                  {post.status === 'published' ? 'Published' : 'Draft'}
                </Badge>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? 'Edit' : 'Preview'}
                </Button>
                
                <Button
                  onClick={() => handleSave('draft')}
                  disabled={isSaving}
                  variant="outline"
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                
                <Button
                  onClick={() => handleSave('published')}
                  disabled={isSaving || !post.title.trim()}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Publishing...
                    </div>
                  ) : (
                    'Publish'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-6 pt-32">
        <div className="max-w-7xl mx-auto">
          {showPreview ? (
            /* Preview Mode */
            <Card className="animate-fade-in">
              <CardContent className="p-8">
                <article className="prose prose-lg max-w-none">
                  {post.featuredImage && (
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-64 object-cover rounded-lg mb-8"
                    />
                  )}
                  <h1>{post.title || 'Untitled Post'}</h1>
                  <div dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(post.content || '<p>Start writing your post...</p>', {
                      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code', 'pre', 'img'],
                      ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'class'],
                      ALLOW_DATA_ATTR: false
                    })
                  }} />
                </article>
              </CardContent>
            </Card>
          ) : (
            /* Edit Mode */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Editor */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle>Post Content</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={post.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Enter your post title..."
                        className="text-lg font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slug">URL Slug</Label>
                      <Input
                        id="slug"
                        value={post.slug}
                        onChange={(e) => {
                          setPost(prev => ({ ...prev, slug: e.target.value }));
                          
                        }}
                        placeholder="url-friendly-slug"
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-slate-500">
                        This will be the URL: /post/{post.slug || 'your-slug'}
                      </p>
                    </div>

                    <Separator />

                    {/* Formatting Toolbar */}
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700 mr-2">Format:</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertFormatting('bold')}
                      >
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertFormatting('italic')}
                      >
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertFormatting('list')}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertFormatting('quote')}
                      >
                        <Quote className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertFormatting('link')}
                        title="Insert Link"
                      >
                        <Link2 className="h-4 w-4" />
                      </Button>
                      <Separator orientation="vertical" className="h-6" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertFormatting('image')}
                        disabled={isUploadingContentImage}
                        title="Insert Image"
                      >
                        {isUploadingContentImage ? (
                          <div className="animate-spin h-4 w-4 border-2 border-slate-600 border-t-transparent rounded-full" />
                        ) : (
                          <ImageIcon className="h-4 w-4" />
                        )}
                      </Button>
                      <input
                        type="file"
                        id="content-image-upload"
                        accept="image/*"
                        onChange={handleContentImageUpload}
                        className="hidden"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        name="content"
                        value={post.content}
                        onChange={(e) => {
                          setPost(prev => ({ ...prev, content: e.target.value }));
                          
                        }}
                        placeholder="Start writing your post... You can use HTML tags for formatting."
                        className="min-h-96 font-mono text-sm"
                      />
                      <p className="text-xs text-slate-500">
                        You can use HTML tags for formatting. Use the toolbar buttons above to insert common formatting.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Featured Image */}
                <Card className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                  <CardHeader>
                    <CardTitle className="text-lg">Featured Image</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {post.featuredImage ? (
                      <div className="relative">
                        <img
                          src={post.featuredImage}
                          alt="Featured"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setPost(prev => ({ ...prev, featuredImage: '' }));
                            
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600 mb-3">
                          {isUploadingImage ? 'Uploading...' : 'Upload a featured image (Max 5MB)'}
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="featured-image"
                          disabled={isUploadingImage}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('featured-image')?.click()}
                          disabled={isUploadingImage}
                        >
                          {isUploadingImage ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            'Choose Image'
                          )}
                        </Button>
                        <p className="text-xs text-slate-500 mt-2">Images are uploaded to Cloudinary</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Post Settings */}
                <Card className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                  <CardHeader>
                    <CardTitle className="text-lg">Post Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="excerpt">Excerpt</Label>
                      <Textarea
                        id="excerpt"
                        value={post.excerpt}
                        onChange={(e) => {
                          setPost(prev => ({ ...prev, excerpt: e.target.value }));
                          
                        }}
                        placeholder="Brief description for the homepage..."
                        rows={3}
                        className="text-sm"
                      />
                      <p className="text-xs text-slate-500">
                        If left empty, the first 150 characters of your post will be used.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={post.status === 'draft' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setPost(prev => ({ ...prev, status: 'draft' }));
                            
                          }}
                        >
                          Draft
                        </Button>
                        <Button
                          type="button"
                          variant={post.status === 'published' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setPost(prev => ({ ...prev, status: 'published' }));
                            
                          }}
                        >
                          Published
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Help */}
                <Card className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                  <CardHeader>
                    <CardTitle className="text-lg">Writing Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm text-slate-600">
                      <p>• Use the formatting toolbar to add structure to your content</p>
                      <p>• Add a featured image to make your post more engaging</p>
                      <p>• Write a compelling excerpt to draw readers in</p>
                      <p>• Save as draft while working, publish when ready</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostEditor;
