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
  const [postTechnicalSpecs, setPostTechnicalSpecs] = useState('');
  const [postQuickInfo, setPostQuickInfo] = useState('');
  const [postEventProgram, setPostEventProgram] = useState('');
  const [postImage, setPostImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Dynamic section rows (table-like)
  const [techItems, setTechItems] = useState<Array<{ key: string; value: string; icon?: string; category?: string; show: boolean }>>([]);
  const [quickItems, setQuickItems] = useState<Array<{ key: string; value: string; show: boolean }>>([]);
  const [programItems, setProgramItems] = useState<Array<{ time: string; activity: string; description?: string; show: boolean }>>([]);

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

  const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

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

    if (!token) {
      setError('You are not authenticated. Please log in again.');
      navigate('/login', { replace: true });
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      // Use FormData for file upload instead of JSON with base64
      const formData = new FormData();
      formData.append('title', postTitle.trim());
      formData.append('content', postContent.trim());

      // Build JSON payloads only when there are visible rows
      const techPayload = techItems.filter(i => i.show && i.key.trim() && i.value.trim());
      if (techPayload.length > 0) {
        formData.append('technical_specs', JSON.stringify(techPayload));
      } else if (postTechnicalSpecs.trim()) {
        // fallback: allow raw HTML/text if user typed into legacy textarea
        formData.append('technical_specs', postTechnicalSpecs.trim());
      }

      const quickPayload = quickItems.filter(i => i.show && i.key.trim() && i.value.trim());
      if (quickPayload.length > 0) {
        formData.append('quick_info', JSON.stringify(quickPayload));
      } else if (postQuickInfo.trim()) {
        formData.append('quick_info', postQuickInfo.trim());
      }

      const programPayload = programItems.filter(i => i.show && (i.time.trim() || i.activity.trim() || (i.description ?? '').trim()));
      if (programPayload.length > 0) {
        formData.append('event_program', JSON.stringify(programPayload));
      } else if (postEventProgram.trim()) {
        formData.append('event_program', postEventProgram.trim());
      }

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

      const response = await fetch(`${API_BASE}/api/posts`, {
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
      setPostTechnicalSpecs('');
      setPostQuickInfo('');
      setPostEventProgram('');
      setTechItems([]);
      setQuickItems([]);
      setProgramItems([]);
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
    setPostTechnicalSpecs('');
    setPostQuickInfo('');
    setPostEventProgram('');
    setTechItems([]);
    setQuickItems([]);
    setProgramItems([]);
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
    <div 
      className="min-h-screen w-full flex"
      style={{
        backgroundColor: 'hsl(240 15% 9%)', // --background
        '--background': '240 15% 9%',
        '--card': '240 20% 12%',
        '--card-hover': '240 25% 15%',
        '--muted': '240 20% 15%',
        '--primary': '260 85% 55%',
        '--primary-dark': '260 90% 45%',
        '--primary-light': '260 80% 65%',
        '--secondary': '240 25% 18%',
        '--accent': '280 85% 60%',
        '--border': '240 25% 20%',
        '--input': '240 20% 15%',
        '--foreground': '270 10% 95%',
        '--card-foreground': '270 8% 92%',
        '--muted-foreground': '260 15% 65%',
        '--primary-foreground': '270 10% 98%',
        '--sidebar-background': '260 45% 8%',
        '--sidebar-primary': '260 85% 55%',
        '--sidebar-accent': '260 25% 12%'
      } as React.CSSProperties}
    >
      {/* Sidebar */}
      <aside 
        className="flex flex-col min-h-screen h-screen w-64 min-w-[240px] max-w-xs text-gray-200 overflow-y-auto scrollbar-none" 
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          backgroundColor: 'hsl(var(--sidebar-background))',
          borderRight: '1px solid hsl(var(--border) / 0.2)',
          padding: '0 16px 24px 16px'
        }}
      >
        <style>{`
          aside::-webkit-scrollbar { display: none; }
        `}</style>
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-0">
          <div className="h-40 h-21 flex items-center justify-center">
            <img 
              src={INSEALogo} 
              alt="INSEA Events Logo" 
              className="w-full h-full object-contain"
              style={{ 
                filter: 'drop-shadow(0 0 10px hsl(var(--primary) / 0.3))'
              }}
            />
          </div>
        </div>
        
        {/* User Profile Section */}
        <div className="flex items-center mb-8 pb-4" style={{ borderBottom: '1px solid hsl(var(--border) / 0.2)' }}>
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-lg flex-shrink-0"
            style={{ 
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
              boxShadow: '0 0 15px hsl(var(--primary) / 0.3)'
            }}
          >
            <span className="text-white font-semibold text-sm">DG</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm mb-0.5 truncate" style={{ color: 'hsl(var(--foreground))' }}>David Grey. H</div>
            <div className="text-xs truncate" style={{ color: 'hsl(var(--muted-foreground))' }}>Project Manager</div>
          </div>
        </div>
        
        {/* Navigation Section */}
        <nav className="flex-1 w-full space-y-2">
          {sidebarLinks.map((link, idx) => (
            <button
              key={idx}
              className="flex items-center w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 font-medium"
              style={{
                backgroundColor: activeView === link.view 
                  ? 'hsl(var(--primary))' 
                  : 'transparent',
                color: activeView === link.view 
                  ? 'hsl(var(--primary-foreground))' 
                  : 'hsl(var(--muted-foreground))',
                boxShadow: activeView === link.view 
                  ? '0 0 20px hsl(var(--primary) / 0.3)' 
                  : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeView !== link.view) {
                  e.currentTarget.style.backgroundColor = 'hsl(var(--secondary) / 0.5)';
                  e.currentTarget.style.color = 'hsl(var(--foreground))';
                }
              }}
              onMouseLeave={(e) => {
                if (activeView !== link.view) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
                }
              }}
              onClick={() => {
                if (link.view) {
                  setActiveView(link.view);
                } else if (link.path) {
                  navigate(link.path);
                }
              }}
            >
              <span className="mr-4 text-lg">{link.icon}</span>
              <span>{link.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div 
        className="flex-1 flex flex-col min-h-0 h-full w-full overflow-hidden"
        style={{
          backgroundColor: 'hsl(var(--background))',
          position: 'relative',
          overflow: 'auto'
        }}
      >
        {/* Top Header */}
        <header 
          className="flex items-center justify-between px-8 py-4 relative z-20 backdrop-blur-sm"
          style={{
            backgroundColor: 'hsl(var(--background) / 0.95)',
            borderBottom: '1px solid hsl(var(--border) / 0.3)',
            boxShadow: '0 8px 32px hsl(var(--background) / 0.8)'
          }}
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search projects"
                className="rounded-lg px-4 py-2 pl-10 outline-none text-sm transition-all duration-200"
                style={{
                  backgroundColor: 'hsl(var(--card) / 0.5)',
                  border: '1px solid hsl(var(--border) / 0.3)',
                  color: 'hsl(var(--foreground))',
                  width: '320px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'hsl(var(--primary) / 0.5)';
                  e.target.style.boxShadow = '0 0 0 2px hsl(var(--primary) / 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'hsl(var(--border) / 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <span 
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                🔍
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg transition-colors duration-200 cursor-pointer hover:text-purple-400" style={{ color: 'hsl(var(--muted-foreground))' }}>🔔</span>
            <span className="text-lg transition-colors duration-200 cursor-pointer hover:text-purple-400" style={{ color: 'hsl(var(--muted-foreground))' }}>⚙️</span>
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
              style={{ 
                background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                boxShadow: '0 0 15px hsl(var(--primary) / 0.3)'
              }}
            >
              <span className="text-white font-medium text-sm">DG</span>
            </div>
            <span className="font-medium text-sm" style={{ color: 'hsl(var(--foreground))' }}>David Greymaax</span>
            <Button 
              onClick={handleLogout} 
              className="font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-dark)))',
                color: 'hsl(var(--primary-foreground))',
                border: 'none',
                boxShadow: '0 4px 15px hsl(var(--primary) / 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px hsl(var(--primary) / 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px hsl(var(--primary) / 0.3)';
              }}
            >
              Logout
            </Button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="relative z-10 flex-1 overflow-auto">
          {/* Main Content Area */}
          {activeView === 'dashboard' ? (
            <main className="w-full h-full p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
              {/* Visit And Sales Statistics (Bar Chart) */}
              <section 
                className="lg:col-span-2 rounded-2xl p-6 flex flex-col transition-all duration-300 backdrop-blur-sm"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--card)), hsl(var(--card-hover)))',
                  border: '1px solid hsl(var(--border) / 0.3)',
                  boxShadow: '0 8px 32px hsl(var(--background) / 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px hsl(var(--background) / 0.4), 0 0 0 1px hsl(var(--primary) / 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px hsl(var(--background) / 0.3)';
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <span className="text-lg mr-3">📊</span>
                    <h2 className="text-lg font-semibold" style={{ color: 'hsl(var(--card-foreground))' }}>Visit And Sales Statistics</h2>
                  </div>
                  <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>CH | USA | UK</span>
                </div>
                <div className="flex-1 flex items-end justify-center gap-3 min-h-[200px] pb-4">
                  {/* Bar Chart */}
                  <div className="flex items-end gap-2 h-40">
                    {[60, 80, 70, 90, 75, 85, 65].map((height, index) => (
                      <div
                        key={index}
                        className="w-8 rounded-t transition-all duration-300 cursor-pointer"
                        style={{
                          height: `${height}%`,
                          background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                          boxShadow: '0 4px 15px hsl(var(--primary) / 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scaleY(1.05)';
                          e.currentTarget.style.boxShadow = '0 6px 20px hsl(var(--primary) / 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scaleY(1)';
                          e.currentTarget.style.boxShadow = '0 4px 15px hsl(var(--primary) / 0.2)';
                        }}
                      />
                    ))}
                  </div>
                </div>
              </section>

              {/* Traffic Sources (Donut Chart) */}
              <section 
                className="rounded-2xl p-6 flex flex-col transition-all duration-300 backdrop-blur-sm"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary-light)))',
                  boxShadow: '0 8px 32px hsl(var(--primary) / 0.2), 0 0 40px hsl(var(--primary) / 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px hsl(var(--primary) / 0.3), 0 0 60px hsl(var(--primary) / 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px hsl(var(--primary) / 0.2), 0 0 40px hsl(var(--primary) / 0.1)';
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold" style={{ color: 'hsl(var(--primary-foreground))' }}>Traffic Sources</h2>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center">
                  {/* Donut Chart */}
                  <div className="relative w-32 h-32 mb-4">
                    <div 
                      className="w-32 h-32 rounded-full transition-transform duration-300"
                      style={{
                        background: `conic-gradient(
                          #60a5fa 0deg 108deg,
                          #34d399 108deg 216deg,
                          #f472b6 216deg 360deg
                        )`,
                        boxShadow: '0 8px 25px hsl(var(--background) / 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <div 
                        className="absolute inset-4 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'hsl(var(--primary-dark))' }}
                      >
                        <span className="text-white text-xs">📈</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm w-full" style={{ color: 'hsl(var(--primary-foreground))' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-400 mr-2"></div>
                        <span>Search Engines</span>
                      </div>
                      <span>30%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                        <span>Direct Click</span>
                      </div>
                      <span>30%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-pink-400 mr-2"></div>
                        <span>Bookmarks Click</span>
                      </div>
                      <span>40%</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Recent Updates */}
              <section 
                className="lg:col-span-2 rounded-2xl p-6 flex flex-col transition-all duration-300 backdrop-blur-sm"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--card)), hsl(var(--card-hover)))',
                  border: '1px solid hsl(var(--border) / 0.3)',
                  boxShadow: '0 8px 32px hsl(var(--background) / 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px hsl(var(--background) / 0.4), 0 0 0 1px hsl(var(--primary) / 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px hsl(var(--background) / 0.3)';
                }}
              >
                <div className="flex items-center mb-6">
                  <span className="text-lg mr-3">👥</span>
                  <h2 className="text-lg font-semibold" style={{ color: 'hsl(var(--card-foreground))' }}>Recent Updates</h2>
                </div>
                <div className="flex gap-4 items-center">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                    style={{ 
                      background: '#f59e0b',
                      boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
                    }}
                  >
                    <span className="text-white font-medium text-sm">JM</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium" style={{ color: 'hsl(var(--card-foreground))' }}>jack Menou</p>
                    <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>October 3rd, 2018</p>
                    <p className="text-sm mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Updated project dashboard and added new widgets.</p>
                  </div>
                </div>
              </section>

              {/* Calendar Widget */}
              <section 
                className="rounded-2xl p-6 flex flex-col transition-all duration-300 backdrop-blur-sm"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--card)), hsl(var(--card-hover)))',
                  border: '1px solid hsl(var(--border) / 0.3)',
                  boxShadow: '0 8px 32px hsl(var(--background) / 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px hsl(var(--background) / 0.4), 0 0 0 1px hsl(var(--primary) / 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px hsl(var(--background) / 0.3)';
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium" style={{ color: 'hsl(var(--card-foreground))' }}>August 2025</h3>
                  <span className="text-lg" style={{ color: 'hsl(var(--primary))' }}>📅</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                    <div key={day} className="text-center py-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <div
                      key={day}
                      className="text-center py-2 rounded cursor-pointer transition-all duration-200"
                      style={{
                        backgroundColor: day === 9 
                          ? 'hsl(var(--primary))' 
                          : day === 16 
                            ? 'hsl(var(--primary) / 0.2)' 
                            : 'transparent',
                        color: day === 9 
                          ? 'hsl(var(--primary-foreground))' 
                          : day === 16 
                            ? 'hsl(var(--primary))' 
                            : 'hsl(var(--card-foreground))',
                        boxShadow: day === 9 ? '0 2px 8px hsl(var(--primary) / 0.3)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (day !== 9 && day !== 16) {
                          e.currentTarget.style.backgroundColor = 'hsl(var(--muted) / 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (day !== 9 && day !== 16) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </section>
            </main>
          ) : activeView === 'create-post' ? (
            <main className="flex-1 w-full h-full overflow-auto">
              <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto">
                  <div 
                    className="rounded-2xl shadow-lg p-8"
                    style={{
                      backgroundColor: 'hsl(var(--input))',
                      border: '1px solid hsl(var(--border) / 0.3)',
                      boxShadow: '0 8px 32px hsl(var(--background) / 0.3)'
                    }}
                  >
                    <div className="flex items-center mb-6">
                      <span className="bg-purple-600 p-3 rounded-lg mr-4 text-2xl">✏️</span>
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>Create New Blog Post</h1>
                        <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>Share your thoughts and ideas with the community</p>
                      </div>
                    </div>

                    {saveMessage && (
                      <div className={`mb-6 p-4 rounded-lg ${saveMessage.includes('success') ? 'bg-emerald-800/30 border border-emerald-500/50 text-emerald-300' : 'bg-red-800/30 border border-red-500/50 text-red-300'}`}>
                        {saveMessage}
                      </div>
                    )}

                    {error && (
                      <div className="mb-6 p-4 rounded-lg bg-red-800/30 border border-red-500/50 text-red-300">
                        {error}
                      </div>
                    )}

                    <div className="space-y-6">
                      <div>
                        <label htmlFor="post-title" className="block text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                          Post Title *
                        </label>
                        <Input
                          id="post-title"
                          value={postTitle}
                          onChange={(e) => setPostTitle(e.target.value)}
                          placeholder="Enter an engaging title for your post..."
                          className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 text-lg h-12 focus:border-purple-500 focus:ring-purple-500/20"
                          disabled={isSaving}
                          style={{
                            backgroundColor: 'hsl(var(--input))',
                            border: '1px solid hsl(var(--border) / 0.3)',
                            color: 'hsl(var(--foreground))'
                          }}
                        />
                      </div>

                      <div>
                        <label htmlFor="post-image" className="block text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                          Featured Image
                        </label>
                        <div className="space-y-4">
                          <Input
                            id="post-image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full bg-gray-800/50 border-gray-700/50 text-gray-300 file:bg-purple-600 file:text-white file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4"
                            style={{
                              backgroundColor: 'hsl(var(--input))',
                              border: '1px solid hsl(var(--border) / 0.3)',
                              color: 'hsl(var(--foreground))'
                            }}
                          />
                          
                          {imagePreview && (
                            <div className="mt-4">
                              <p className="text-sm font-medium mb-2" style={{ color: 'hsl(var(--foreground))' }}>Preview:</p>
                              <img
                                src={imagePreview}
                                alt="Featured image preview"
                                className="max-w-full h-auto rounded-lg border border-gray-700/50"
                                style={{ maxHeight: '300px' }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="post-content" className="block text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                          Post Content *
                        </label>
                        <Textarea
                          id="post-content"
                          value={postContent}
                          onChange={(e) => setPostContent(e.target.value)}
                          placeholder="Write your post content here... You can use HTML tags for formatting."
                          className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 min-h-[400px] resize-none focus:border-purple-500 focus:ring-purple-500/20"
                          disabled={isSaving}
                          style={{
                            backgroundColor: 'hsl(var(--input))',
                            border: '1px solid hsl(var(--border) / 0.3)',
                            color: 'hsl(var(--foreground))'
                          }}
                        />
                        <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          Tip: You can use HTML tags like &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;ol&gt;, etc. for formatting.
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                            Technical Specifications (table-like)
                          </label>
                          <Button
                            type="button"
                            onClick={() => setTechItems(prev => [...prev, { key: '', value: '', icon: '', category: '', show: true }])}
                            className="text-xs"
                          >+ Add Row</Button>
                        </div>
                        <div className="mt-3 space-y-2">
                          {techItems.map((item, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                              <Input className="col-span-3" placeholder="Label (e.g., Location)" value={item.key} onChange={e => setTechItems(s => s.map((r,i)=> i===idx? { ...r, key: e.target.value }: r))} />
                              <Input className="col-span-4" placeholder="Value" value={item.value} onChange={e => setTechItems(s => s.map((r,i)=> i===idx? { ...r, value: e.target.value }: r))} />
                              <Input className="col-span-2" placeholder="Icon (optional)" value={item.icon ?? ''} onChange={e => setTechItems(s => s.map((r,i)=> i===idx? { ...r, icon: e.target.value }: r))} />
                              <Input className="col-span-2" placeholder="Category (opt)" value={item.category ?? ''} onChange={e => setTechItems(s => s.map((r,i)=> i===idx? { ...r, category: e.target.value }: r))} />
                              <input type="checkbox" className="col-span-1 h-5 w-5" checked={item.show} onChange={e => setTechItems(s => s.map((r,i)=> i===idx? { ...r, show: e.target.checked }: r))} title="Show" />
                            </div>
                          ))}
                        </div>
                        <p className="text-xs mt-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          Tip: Leave icon/category blank to use a simple key/value look like the old static tables.
                        </p>
                        <div className="mt-3">
                          <label htmlFor="post-technical-specs" className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                            Or paste legacy HTML (optional)
                          </label>
                          <Textarea id="post-technical-specs" value={postTechnicalSpecs} onChange={(e)=>setPostTechnicalSpecs(e.target.value)} className="bg-gray-800/50 border-gray-700/50 text-white min-h-[90px]" placeholder="<table>...</table>" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                            Quick Info (key/value)
                          </label>
                          <Button type="button" onClick={() => setQuickItems(prev => [...prev, { key: '', value: '', show: true }])} className="text-xs">+ Add Row</Button>
                        </div>
                        <div className="mt-3 space-y-2">
                          {quickItems.map((item, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                              <Input className="col-span-5" placeholder="Title (e.g., Published)" value={item.key} onChange={e => setQuickItems(s => s.map((r,i)=> i===idx? { ...r, key: e.target.value }: r))} />
                              <Input className="col-span-6" placeholder="Value" value={item.value} onChange={e => setQuickItems(s => s.map((r,i)=> i===idx? { ...r, value: e.target.value }: r))} />
                              <input type="checkbox" className="col-span-1 h-5 w-5" checked={item.show} onChange={e => setQuickItems(s => s.map((r,i)=> i===idx? { ...r, show: e.target.checked }: r))} title="Show" />
                            </div>
                          ))}
                        </div>
                        <div className="mt-3">
                          <label htmlFor="post-quick-info" className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                            Or paste legacy text/HTML (optional)
                          </label>
                          <Textarea id="post-quick-info" value={postQuickInfo} onChange={(e)=>setPostQuickInfo(e.target.value)} className="bg-gray-800/50 border-gray-700/50 text-white min-h-[90px]" placeholder="Quick bullets or HTML" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                            Event Program & Schedule
                          </label>
                          <Button type="button" onClick={() => setProgramItems(prev => [...prev, { time: '', activity: '', description: '', show: true }])} className="text-xs">+ Add Row</Button>
                        </div>
                        <div className="mt-3 space-y-2">
                          {programItems.map((item, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                              <Input className="col-span-3" placeholder="Time" value={item.time} onChange={e => setProgramItems(s => s.map((r,i)=> i===idx? { ...r, time: e.target.value }: r))} />
                              <Input className="col-span-5" placeholder="Activity" value={item.activity} onChange={e => setProgramItems(s => s.map((r,i)=> i===idx? { ...r, activity: e.target.value }: r))} />
                              <Input className="col-span-3" placeholder="Description (opt)" value={item.description ?? ''} onChange={e => setProgramItems(s => s.map((r,i)=> i===idx? { ...r, description: e.target.value }: r))} />
                              <input type="checkbox" className="col-span-1 h-5 w-5" checked={item.show} onChange={e => setProgramItems(s => s.map((r,i)=> i===idx? { ...r, show: e.target.checked }: r))} title="Show" />
                            </div>
                          ))}
                        </div>
                        <div className="mt-3">
                          <label htmlFor="post-event-program" className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                            Or paste legacy HTML (optional)
                          </label>
                          <Textarea id="post-event-program" value={postEventProgram} onChange={(e)=>setPostEventProgram(e.target.value)} className="bg-gray-800/50 border-gray-700/50 text-white min-h-[90px]" placeholder="<ul>...</ul>" />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button 
                          onClick={handleCreatePost} 
                          disabled={isSaving || !postTitle.trim() || !postContent.trim()}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors flex-1 sm:flex-none"
                          style={{
                            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-dark)))',
                            color: 'hsl(var(--primary-foreground))',
                            border: 'none',
                            boxShadow: '0 4px 15px hsl(var(--primary) / 0.3)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px hsl(var(--primary) / 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px hsl(var(--primary) / 0.3)';
                          }}
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
                          style={{
                            border: '1px solid hsl(var(--border) / 0.3)',
                            color: 'hsl(var(--foreground))'
                          }}
                        >
                          Clear Form
                        </Button>

                        <Button 
                          variant="outline" 
                          onClick={() => navigate('/blog')}
                          disabled={isSaving}
                          className="border-purple-600 text-purple-400 hover:bg-purple-800/20 py-3 px-6 rounded-lg transition-colors"
                          style={{
                            border: '1px solid hsl(var(--primary))',
                            color: 'hsl(var(--primary))'
                          }}
                        >
                          View Blog
                        </Button>
                      </div>
                    </div>

                    {/* Preview Section */}
                    {(postTitle || postContent || imagePreview) && (
                      <div className="mt-8 pt-8 border-t border-gray-700/50">
                        <h3 className="text-lg font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                          <span className="mr-2">👁️</span>
                          Preview
                        </h3>
                        <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700/50">
                          {postTitle && (
                            <h2 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>{postTitle}</h2>
                          )}
                          {imagePreview && (
                            <div className="mb-6">
                              <p className="text-sm font-medium mb-2" style={{ color: 'hsl(var(--foreground))' }}>Preview:</p>
                              <img
                                src={imagePreview}
                                alt="Featured image preview"
                                className="max-w-full h-auto rounded-lg border border-gray-700/50"
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
