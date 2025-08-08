import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Calendar } from "../../components/ui/calendar"; // Import the Calendar component
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import INSEALogo from '../../INSEA_Events_logo.png';
import ScraperPage from './ScraperPage';
import MyPostsView from './MyPostsView'; // Import the new component
import BlogView from './BlogView';

// Placeholder for user profile image
const userProfileImg = 'https://randomuser.me/api/portraits/men/32.jpg';

// Define a type for the sidebar links for better type safety
type SidebarLink = {
  name: string;
  icon: string;
  view?: string; // To switch views within the dashboard
  path?: string; // For external or separate page navigation
};

const sidebarLinks: SidebarLink[] = [
  { name: 'Dashboard', icon: '📊', view: 'dashboard' },
  { name: 'My Posts', icon: '✍️', view: 'my-posts' },
  { name: 'Create Post', icon: '✏️', view: 'create-post' },
  { name: 'Scraper', icon: '🤖', view: 'scraper' },
  { name: 'Blog', icon: '📄', view: 'blog' },
  { name: 'Widgets', icon: '🧮' },
  { name: 'Sidebar Layouts', icon: '📐' },
  { name: 'Basic UI Elements', icon: '🔲' },
  { name: 'Advanced UI', icon: '⚡' },
  { name: 'Popups', icon: '💬' },
  { name: 'Notifications', icon: '🔔' },
  { name: 'Icons', icon: '⭐' },
  { name: 'Forms', icon: '📝' },
  { name: 'Text editors', icon: '✏️' },
  { name: 'Code editors', icon: '💻' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [date, setDate] = useState<Date | undefined>(new Date()); // Add state for the calendar

  // State for blog post creation
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // State lifted from ScraperPage
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [scraperMessage, setScraperMessage] = useState<string>('');
  const eventSourceRef = useRef<EventSource | null>(null);

  // Add state for selected post
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState('');

  // Function to handle viewing a post
  const handleViewPost = async (postId: number) => {
    try {
      setPostLoading(true);
      setPostError('');
      
      const response = await fetch(`http://localhost:3000/api/posts/${postId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }
      
      const postData = await response.json();
      setSelectedPost(postData);
      setIsPostModalOpen(true);
    } catch (error) {
      setPostError('Error loading post. Please try again.');
      console.error('Error fetching post:', error);
    } finally {
      setPostLoading(false);
    }
  };

  // Cleanup EventSource on component unmount
  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  const handleScrape = async (keyword: string) => {
    if (!keyword) {
      setScraperMessage('Keyword is required.');
      return;
    }

    setIsScraping(true);
    // Do not clear logs here to persist them
    setScraperMessage('Scraping started...');

    eventSourceRef.current = new EventSource('http://localhost:5000/stream-logs');

    eventSourceRef.current.onmessage = (event) => {
      setLogs((prevLogs) => [...prevLogs, event.data]);
    };

    eventSourceRef.current.onerror = () => {
      setScraperMessage('Connection to log stream failed.');
      eventSourceRef.current?.close();
    };

    try {
      const response = await fetch('http://localhost:5000/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to start scraping');
      }
    } catch (error: any) {
      setScraperMessage(`Error: ${error.message}`);
      setIsScraping(false);
      eventSourceRef.current?.close();
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      navigate('/login', { replace: true });
    } else {
      setToken(storedToken);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  // Handle blog post creation
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!postTitle.trim() || !postContent.trim()) {
      setError('Please fill in both title and content');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      // Use FormData for file upload instead of JSON with base64
      const formData = new FormData();
      formData.append('title', postTitle.trim());
      formData.append('content', postContent.trim());
      
      // Append the actual file if present
      if (postImage) {
        formData.append('image', postImage);
      }

      console.log('=== DEBUG: Creating post ===');
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        if (key === 'image') {
          console.log(`${key}:`, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value);
        } else {
          console.log(`${key}:`, value);
        }
      }

      const response = await fetch('http://localhost:3000/api/posts', {
        method: 'POST',
        headers: {
          // Remove Content-Type header - let browser set it for FormData
          'Authorization': `Bearer ${token}`,
        },
        body: formData, // Send FormData instead of JSON
      });

      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);

      const responseText = await response.text();
      console.log('Response body:', responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { error: responseText || 'Unknown error occurred' };
        }
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const newPost = JSON.parse(responseText);
      console.log('Post created successfully:', newPost);

      // Reset form
      setPostTitle('');
      setPostContent('');
      setPostImage(null);
      setImagePreview(null);
      setError('');
      setSaveMessage('Post created successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);

    } catch (error) {
      console.error('Error creating post:', error);
      setError(error instanceof Error ? error.message : 'Failed to create post');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearForm = () => {
    setPostTitle('');
    setPostContent('');
    setPostImage(null);
    setImagePreview(null);
    setSaveMessage('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setError('Image file is too large. Please select an image under 2MB.');
            return;
        }
        
        setPostImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen w-full flex bg-[#181824]">
      {/* Sidebar */}
      <aside 
        className="flex flex-col min-h-screen h-screen w-64 min-w-[220px] max-w-xs p-4 text-gray-200 overflow-y-auto scrollbar-none" 
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          background: 'linear-gradient(135deg, rgba(26, 20, 67, 0.95) 0%, rgba(35, 32, 70, 0.9) 25%, rgba(45, 30, 79, 0.85) 50%, rgba(58, 34, 90, 0.9) 75%, rgba(67, 36, 104, 0.95) 100%)',
          boxShadow: '8px 0 32px rgba(26, 20, 67, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <style>{`
          aside::-webkit-scrollbar { display: none; }
        `}</style>
        <div className="flex flex-col items-center mb-8">
          <ImageWithFallback src={INSEALogo} alt="INSEA Logo" className="w-16 h-16 mb-2" />
          <span className="text-xl font-bold text-purple-400">INSEA</span>
        </div>
        <div className="flex flex-col items-center mb-8">
          <img src={userProfileImg} alt="Profile" className="w-14 h-14 rounded-full border-2 border-purple-400 mb-2" />
          <span className="font-semibold">David Grey. H</span>
          <span className="text-xs text-gray-400">Project Manager</span>
        </div>
        <nav className="flex-1 w-full">
          {sidebarLinks.map((link, idx) => (
            <button
              key={idx}
              className={`flex items-center w-full px-4 py-2 mb-1 rounded-lg hover:bg-purple-800/40 transition ${activeView === link.view ? 'bg-purple-800 text-white' : ''}`}
              onClick={() => {
                if (link.view) {
                  setActiveView(link.view);
                } else if (link.path) {
                  navigate(link.path);
                }
                // Do nothing if neither view nor path is defined
              }}
            >
              <span className="mr-3 text-lg">{link.icon}</span>
              <span className="text-sm font-medium">{link.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div 
        className="flex-1 flex flex-col min-h-0 h-full w-full overflow-hidden"
        style={{
          background: '#1B1A27',
          position: 'relative',
          overflow: 'auto'
        }}
      >
        {/* Gradient Overlay */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(47, 36, 72, 0.9) 0%, rgba(27, 26, 39, 0.95) 100%)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
        
        {/* Scrollable Content */}
        <div className="relative z-10">
          {/* Top Header */}
          <header 
            className="flex items-center justify-between px-8 py-4 relative z-20"
            style={{
              background: 'linear-gradient(135deg, rgba(26, 20, 67, 0.95) 0%, rgba(35, 32, 70, 0.9) 25%, rgba(45, 30, 79, 0.85) 50%, rgba(58, 34, 90, 0.9) 75%, rgba(67, 36, 104, 0.95) 100%)',
              boxShadow: '0 8px 32px rgba(26, 20, 67, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search projects"
                className="bg-[#23213a] text-gray-200 rounded-lg px-4 py-2 outline-none border-none placeholder-gray-400 w-64"
              />
            </div>
            <div className="flex items-center gap-4">
              <img src={userProfileImg} alt="Profile" className="w-8 h-8 rounded-full" />
              <span className="text-gray-200 font-medium">David Greymaax</span>
              <span className="text-xl">🔔</span>
              <span className="text-xl">⚙️</span>
              <Button onClick={handleLogout} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                Logout
              </Button>
            </div>
          </header>

          {/* Main Content Area */}
          {activeView === 'dashboard' ? (
            <main className="w-full h-full p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 relative z-10">
              {/* Visit And Sales Statistics (Bar Chart Placeholder) */}
              <section className="rounded-2xl p-4 md:p-6 flex flex-col min-h-[250px] h-full transition-all duration-300 hover:transform hover:-translate-y-1"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '20px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="flex items-center mb-4">
                  <span className="bg-purple-800 p-2 rounded-lg mr-2">📊</span>
                  <h2 className="text-lg font-bold text-white">Visit And Sales Statistics</h2>
                  <span className="ml-auto text-xs text-gray-400">CH | USA | UK</span>
                </div>
                <div className="flex-1 flex items-center justify-center text-gray-400 min-h-[120px]">
                  {/* Replace with chart library later */}
                  <span>[Bar Chart Placeholder]</span>
                </div>
              </section>

              {/* Traffic Sources (Donut Chart Placeholder) */}
              <section className="rounded-2xl p-4 md:p-6 flex flex-col min-h-[250px] h-full transition-all duration-300 hover:transform hover:-translate-y-1"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '20px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="flex items-center mb-4">
                  <span className="bg-pink-600 p-2 rounded-lg mr-2">🍩</span>
                  <h2 className="text-lg font-bold text-white">Traffic Sources</h2>
                  <span className="ml-auto text-xs text-gray-400">Overview</span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 min-h-[120px]">
                  {/* Replace with chart library later */}
                  <span>[Donut Chart Placeholder]</span>
                  <div className="mt-4 flex flex-col gap-1 text-sm">
                    <span className="text-cyan-400">● Search Engines <span className="ml-2 text-gray-300">30%</span></span>
                    <span className="text-green-400">● Direct Click <span className="ml-2 text-gray-300">30%</span></span>
                    <span className="text-pink-400">● Bookmarks Click <span className="ml-2 text-gray-300">40%</span></span>
                  </div>
                </div>
              </section>

              {/* Recent Updates */}
              <section className="rounded-2xl p-4 md:p-6 flex flex-col min-h-[250px] h-full transition-all duration-300 hover:transform hover:-translate-y-1"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '20px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              >
                <h2 className="text-lg font-bold text-white mb-4">Recent Updates</h2>
                <div className="flex gap-4 items-center">
                  <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=facearea&w=120&q=80" alt="update" className="w-16 h-16 rounded-lg object-cover" />
                  <div>
                    <p className="text-white font-semibold">jack Menqu</p>
                    <p className="text-gray-400 text-xs">October 3rd, 2018</p>
                    <p className="text-gray-300 mt-2">Updated project dashboard and added new widgets.</p>
                  </div>
                </div>
              </section>

              {/* Calendar Widget */}
              <section className="rounded-2xl p-4 flex flex-col transition-all duration-300 hover:transform hover:-translate-y-1"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '20px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="w-full"
                  classNames={{
                    root: "w-full h-full flex flex-col justify-center",
                    months: "w-full",
                    month: "w-full space-y-4",
                    table: "w-full border-collapse",
                    head_row: "flex justify-around",
                    row: "flex w-full mt-2 justify-around",
                    day: "h-9 w-9 text-center p-0 relative font-normal rounded-md hover:bg-purple-500/20",
                    day_selected: "bg-purple-600 text-white hover:bg-purple-700 focus:bg-purple-600",
                    day_today: "bg-gray-700/50 rounded-md",
                    day_outside: "text-gray-500 opacity-50",
                    day_disabled: "text-gray-600 opacity-50",
                  }}
                />
              </section>
            </main>
          ) : activeView === 'create-post' ? (
            <main className="flex-1 w-full h-full overflow-auto">
              <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-[#232135] rounded-2xl shadow-lg p-6 md:p-8">
                    <div className="flex items-center mb-6">
                      <span className="bg-purple-800 p-3 rounded-lg mr-4 text-2xl">✏️</span>
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white">Create New Blog Post</h1>
                        <p className="text-gray-400 mt-1">Share your thoughts and ideas with the community</p>
                      </div>
                    </div>

                    {saveMessage && (
                      <div className={`mb-6 p-4 rounded-lg ${saveMessage.includes('success') ? 'bg-green-800/20 border border-green-600 text-green-400' : 'bg-red-800/20 border border-red-600 text-red-400'}`}>
                        {saveMessage}
                      </div>
                    )}

                    {error && (
                      <div className="mb-6 p-4 rounded-lg bg-red-800/20 border border-red-600 text-red-400">
                        {error}
                      </div>
                    )}

                    <div className="space-y-6">
                      <div>
                        <label htmlFor="post-title" className="block text-sm font-medium text-gray-300 mb-2">
                          Post Title *
                        </label>
                        <Input
                          id="post-title"
                          value={postTitle}
                          onChange={(e) => setPostTitle(e.target.value)}
                          placeholder="Enter an engaging title for your post..."
                          className="bg-[#181824] border-gray-600 text-white placeholder-gray-400 text-lg h-12"
                          disabled={isSaving}
                        />
                      </div>

                      <div>
                        <label htmlFor="post-image" className="block text-sm font-medium text-gray-300 mb-2">
                          Featured Image
                        </label>
                        <div className="space-y-4">
                          <Input
                            id="post-image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full"
                          />
                          
                          {imagePreview && (
                            <div className="mt-4">
                              <p className="text-sm font-medium mb-2">Preview:</p>
                              <img
                                src={imagePreview}
                                alt="Featured image preview"
                                className="max-w-full h-auto rounded-lg border"
                                style={{ maxHeight: '300px' }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="post-content" className="block text-sm font-medium text-gray-300 mb-2">
                          Post Content *
                        </label>
                        <Textarea
                          id="post-content"
                          value={postContent}
                          onChange={(e) => setPostContent(e.target.value)}
                          placeholder="Write your post content here... You can use HTML tags for formatting."
                          className="bg-[#181824] border-gray-600 text-white placeholder-gray-400 min-h-[400px] resize-none"
                          disabled={isSaving}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Tip: You can use HTML tags like &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;ol&gt;, etc. for formatting.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button 
                          onClick={handleCreatePost} 
                          disabled={isSaving || !postTitle.trim() || !postContent.trim()}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors flex-1 sm:flex-none"
                        >
                          {isSaving ? (
                            <>
                              <span className="animate-spin mr-2">⏳</span>
                              Publishing...
                            </>
                          ) : (
                            <>
                              <span className="mr-2">🚀</span>
                              Publish Post
                            </>
                          )}
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          onClick={handleClearForm}
                          disabled={isSaving}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 py-3 px-6 rounded-lg transition-colors"
                        >
                          Clear Form
                        </Button>

                        <Button 
                          variant="outline" 
                          onClick={() => navigate('/blog')}
                          disabled={isSaving}
                          className="border-purple-600 text-purple-400 hover:bg-purple-800/20 py-3 px-6 rounded-lg transition-colors"
                        >
                          View Blog
                        </Button>
                      </div>
                    </div>

                    {/* Preview Section */}
                    {(postTitle || postContent || imagePreview) && (
                      <div className="mt-8 pt-8 border-t border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                          <span className="mr-2">👁️</span>
                          Preview
                        </h3>
                        <div className="bg-[#181824] rounded-lg p-6 border border-gray-700">
                          {postTitle && (
                            <h2 className="text-2xl font-bold text-white mb-4">{postTitle}</h2>
                          )}
                          {imagePreview && (
                            <div className="mb-6">
                              <p className="text-sm font-medium mb-2">Preview:</p>
                              <img
                                src={imagePreview}
                                alt="Featured image preview"
                                className="max-w-full h-auto rounded-lg border"
                                style={{ maxHeight: '300px' }}
                              />
                            </div>
                          )}
                          {postContent && (
                            <div 
                              className="text-gray-300 prose prose-invert max-w-none"
                              dangerouslySetInnerHTML={{ __html: postContent }}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </main>
          ) : activeView === 'scraper' ? (
            <main className="flex-1 w-full h-full overflow-auto">
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <ScraperPage 
                  isScraping={isScraping}
                  logs={logs}
                  message={scraperMessage}
                  handleScrape={handleScrape}
                />
              </div>
            </main>
          ) : activeView === 'my-posts' ? (
            <main className="flex-1 w-full h-full overflow-auto">
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <MyPostsView />
              </div>
            </main>
          ) : activeView === 'blog' ? (
            <main className="flex-1 w-full h-full overflow-auto">
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <BlogView onViewPost={handleViewPost} />
              </div>
            </main>
          ) : null}
        </div>
      </div>
    </div>
  );
}
