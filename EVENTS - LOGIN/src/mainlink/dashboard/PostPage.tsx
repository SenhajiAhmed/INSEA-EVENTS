import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Share2, 
  Heart, 
  Bookmark, 
  Clock, 
  MapPin, 
  Users, 
  Star,
  Calendar,
  Award,
  Zap,
  Snowflake
} from 'lucide-react';

import logo from '../../INSEA_Events_logo.png';

interface Post {
  id: number;
  title: string;
  content: string;
  slug: string;
  created_at: string;
  image_path?: string;
  technical_specs?: string;
  quick_info?: string;
  event_program?: string;
}

const PostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(true);

  // Build a robust image src that handles absolute and relative paths
  const getImageSrc = (imagePath?: string) => {
    if (!imagePath) return '';
    // Already an absolute URL
    if (/^https?:\/\//i.test(imagePath)) return imagePath;
    // Ensure leading slash then prefix API origin
    const normalized = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `http://localhost:3000${normalized}`;
  };

  // Reset loading when image path changes
  useEffect(() => {
    setImageLoading(true);
  }, [post?.image_path]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
                       const response = await fetch(`http://localhost:3000/api/posts/${slug}`);
        if (!response.ok) {
          throw new Error('Post not found');
        }
        const data = await response.json();
        console.log('Post data received:', data);
        console.log('Image path:', data.image_path);
        setPost(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(229,24%,10%)] to-[hsl(229,24%,8%)] flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(229,24%,10%)] to-[hsl(229,24%,8%)] flex items-center justify-center">
      <div className="text-red-400 text-xl">Error: {error}</div>
    </div>
  );
  
  if (!post) return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(229,24%,10%)] to-[hsl(229,24%,8%)] flex items-center justify-center">
      <div className="text-white text-xl">Post not found.</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(229,24%,10%)] via-[hsl(229,24%,12%)] to-[hsl(229,24%,8%)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[hsl(229,24%,10%)]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 relative">
            <Link 
              to="/blog" 
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Blog</span>
            </Link>
            
            {/* Center Logo */}
            <div className="absolute left-1/2 -translate-x-1/2">
              <img
                src={logo}
                alt="INSEA Events Logo"
                className="h-20 w-auto px-0 py-0"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                <Bookmark className="w-5 h-5" />
              </button>
              <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className="space-y-6 animate-in fade-in duration-700">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="text-white">Experience the Magic of</span>
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent">
                    Ice Skating at Mega Mall
                  </span>
                </h1>
                <p className="text-xl text-white/70 leading-relaxed max-w-3xl">
                  Discover the thrill of gliding across pristine ice in our state-of-the-art indoor rink. 
                  Perfect for beginners and experienced skaters alike, featuring professional equipment and 
                  expert guidance.
                </p>
              </div>
            </div>

            {/* Post Image */}
            <div className="animate-in fade-in duration-700 delay-100">
              <div className="relative group transform transition-all duration-300 hover:scale-[1.02]">
                <div className="relative bg-gradient-to-br from-[hsl(229,24%,12%)] to-[hsl(229,24%,14%)] rounded-xl overflow-hidden shadow-2xl">
                  {post.image_path ? (
                    <div className="relative cursor-pointer" onClick={() => setImageModalOpen(true)}>
                      {/* Loading State */}
                      {imageLoading && (
                        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(229,24%,12%)] to-[hsl(229,24%,14%)] flex items-center justify-center z-10">
                          <div className="text-center text-white/80">
                            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-lg font-medium">Loading Image...</p>
                            <p className="text-sm text-white/60">Please wait</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Main Image */}
                      <img 
                        src={getImageSrc(post.image_path)}
                        alt={post.title}
                        className={`w-full h-auto max-h-[600px] object-contain bg-gradient-to-br from-[hsl(229,24%,12%)] to-[hsl(229,24%,14%)] transition-all duration-500 group-hover:scale-[1.02] ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                        loading="lazy"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          console.error('Image failed to load:', e.currentTarget.src);
                          e.currentTarget.style.display = 'none';
                          setImageLoading(false);
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', post.image_path);
                          setImageLoading(false);
                        }}
                      />
                      
                      {/* Image Loading Placeholder */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(229,24%,12%)] to-[hsl(229,24%,14%)] flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        <div className="text-center text-white/80">
                          <div className="w-20 h-20 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <Snowflake className="w-10 h-10 text-purple-400" />
                          </div>
                          <p className="text-lg font-medium">View Full Image</p>
                          <p className="text-sm text-white/60">Hover to see details</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-purple-900/20 to-blue-900/20 flex items-center justify-center relative overflow-hidden">
                      {/* Animated Background Elements */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
                        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-purple-400/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
                      </div>
                      
                      <div className="text-center text-white/60 relative z-10">
                        <div className="w-24 h-24 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-purple-500/30">
                          <Snowflake className="w-12 h-12 text-purple-400/60 animate-bounce" />
                        </div>
                        <p className="text-xl font-medium mb-2">No Image Available</p>
                        <p className="text-sm text-white/40">This post doesn't have a featured image</p>
                        
                        {/* Decorative Elements */}
                        <div className="flex justify-center space-x-2 mt-4">
                          <div className="w-2 h-2 bg-purple-400/40 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-blue-400/40 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                          <div className="w-2 h-2 bg-purple-400/40 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Enhanced Image Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  
                  {/* Enhanced Bottom Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-1">Featured Image</h3>
                        <p className="text-white/70 text-sm">
                          {post.image_path ? 'Ice skating event showcase' : 'No featured image'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-white/60 text-sm mb-1">
                          {post.image_path ? 'Click to enlarge' : 'No image'}
                        </div>
                        {post.image_path && (
                          <div className="flex items-center space-x-2 text-purple-400">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                            <span className="text-xs">Interactive</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote Section */}
            <div className="animate-in fade-in duration-700 delay-200">
              <div className="relative bg-gradient-to-br from-[hsl(229,24%,12%)] to-[hsl(229,24%,14%)] rounded-xl p-8 border-t-4 border-gradient-to-r from-purple-500 to-purple-600">
                <div className="absolute -top-4 left-8 w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">"</span>
                </div>
                <blockquote className="text-xl italic text-white/90 leading-relaxed mb-4">
                  "Unite, Celebrate, Inspire"
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">S</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold">Unknown</div>
                    <div className="text-white/60 text-sm">INSEA EVENTS Member</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Article Content */}
            <div className="animate-in fade-in duration-700 delay-300">
              <div className="prose prose-invert prose-lg max-w-none">
                <div 
                  className="text-white/90 leading-relaxed space-y-6 text-lg"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 animate-in fade-in duration-700 delay-500">
            {/* Technical Specifications */}
            <div className="bg-gradient-to-br from-[hsl(229,24%,12%)] to-[hsl(229,24%,14%)] rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <span>Technical Specs</span>
              </h3>
              
              {post.technical_specs ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  {(() => {
                    try {
                      const techData = JSON.parse(post.technical_specs);
                      if (Array.isArray(techData) && techData.length > 0) {
                        return (
                          <div className="space-y-4">
                            {techData.map((spec, index) => (
                              <div 
                                key={index} 
                                className="group p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-105"
                                style={{ animationDelay: `${100 + index * 50}ms` }}
                              >
                                <div className="flex items-center space-x-3 mb-2">
                                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all">
                                    <div className="w-5 h-5 text-purple-400 flex items-center justify-center">
                                      {/* Icon mapping - you can expand this */}
                                      {spec.icon === 'Snowflake' && <Snowflake className="w-5 h-5" />}
                                      {spec.icon === 'MapPin' && <MapPin className="w-5 h-5" />}
                                      {spec.icon === 'Users' && <Users className="w-5 h-5" />}
                                      {spec.icon === 'Clock' && <Clock className="w-5 h-5" />}
                                      {spec.icon === 'Award' && <Award className="w-5 h-5" />}
                                      {spec.icon === 'Star' && <Star className="w-5 h-5" />}
                                      {spec.icon === 'Thermometer' && <div className="w-5 h-5 bg-purple-400 rounded-full"></div>}
                                      {spec.icon === 'Shield' && <div className="w-5 h-5 bg-purple-400 rounded-full"></div>}
                                      {!['Snowflake', 'MapPin', 'Users', 'Clock', 'Award', 'Star', 'Thermometer', 'Shield'].includes(spec.icon) && 
                                        <Star className="w-5 h-5" />
                                      }
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-white font-medium">{spec.label}</div>
                                    <div className="text-purple-400 font-semibold">{spec.value}</div>
                                  </div>
                                </div>
                                {spec.category && (
                                  <div className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded-full inline-block">
                                    {spec.category}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      }
                    } catch (e) {
                      // If parsing fails, treat as HTML content
                    }
                    return (
                      <div 
                        className="text-white/90 leading-relaxed space-y-4"
                        dangerouslySetInnerHTML={{ __html: post.technical_specs }}
                      />
                    );
                  })()}
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { icon: Snowflake, label: "Ice Quality", value: "Olympic Grade", category: "Surface" },
                    { icon: MapPin, label: "Rink Size", value: "60m x 30m", category: "Dimensions" },
                    { icon: Users, label: "Capacity", value: "200 skaters", category: "Capacity" },
                    { icon: Clock, label: "Session Length", value: "2 hours", category: "Timing" },
                    { icon: Award, label: "Equipment", value: "Professional", category: "Quality" },
                    { icon: Star, label: "Instructors", value: "Certified", category: "Staff" }
                  ].map((spec, index) => (
                    <div 
                      key={index} 
                      className="group p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-105"
                      style={{ animationDelay: `${100 + index * 50}ms` }}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all">
                          <spec.icon className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{spec.label}</div>
                          <div className="text-purple-400 font-semibold">{spec.value}</div>
                        </div>
                      </div>
                      <div className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded-full inline-block">
                        {spec.category}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Info */}
            <div className="bg-gradient-to-br from-[hsl(229,24%,12%)] to-[hsl(229,24%,14%)] rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Quick Info</h3>
              
              {post.quick_info ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  {(() => {
                    try {
                      const quickData = JSON.parse(post.quick_info);
                      if (Array.isArray(quickData) && quickData.length > 0) {
                        return (
                          <div className="space-y-3 text-sm">
                            {quickData.map((field, index) => (
                              <div key={index} className="flex justify-between">
                                <span className="text-white/70">{field.key}:</span>
                                <span className="text-white">{field.value}</span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                    } catch (e) {
                      // If parsing fails, treat as HTML content
                    }
                    return (
                      <div 
                        className="text-white/90 leading-relaxed space-y-3"
                        dangerouslySetInnerHTML={{ __html: post.quick_info }}
                      />
                    );
                  })()}
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Published:</span>
                    <span className="text-white">{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Location:</span>
                    <span className="text-purple-400">Mega Mall Center</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Duration:</span>
                    <span className="text-white">All Day Event</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Age Range:</span>
                    <span className="text-white">3+ Years</span>
                  </div>
                </div>
              )}
            </div>

            {/* Event Program & Schedule */}
            <div className="bg-gradient-to-br from-[hsl(229,24%,12%)] to-[hsl(229,24%,14%)] rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Event Program & Schedule</h3>
              
              {post.event_program ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  {(() => {
                    try {
                      const scheduleData = JSON.parse(post.event_program);
                      if (Array.isArray(scheduleData) && scheduleData.length > 0) {
                        return (
                          <div className="space-y-4">
                            {scheduleData.map((item, index) => (
                              <div key={index} className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                <div className="w-3 h-3 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <span className="text-purple-400 font-medium">{item.time}</span>
                                    <span className="text-white/70">-</span>
                                    <span className="text-white font-medium">{item.activity}</span>
                                  </div>
                                  {item.description && (
                                    <p className="text-white/70 text-sm leading-relaxed">{item.description}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      }
                    } catch (e) {
                      // If parsing fails, treat as HTML content
                    }
                    return (
                      <div 
                        className="text-white/90 leading-relaxed space-y-4"
                        dangerouslySetInnerHTML={{ __html: post.event_program }}
                      />
                    );
                  })()}
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { time: "10:00 AM", activity: "Rink Opens - Morning Session", description: "Perfect for early birds and families" },
                    { time: "12:00 PM", activity: "Lunch Break & Rink Maintenance", description: "Ice resurfacing and equipment check" },
                    { time: "1:00 PM", activity: "Afternoon Public Skating", description: "Open session for all skill levels" },
                    { time: "3:00 PM", activity: "Beginner Lessons", description: "Professional instruction for new skaters" },
                    { time: "5:00 PM", activity: "Advanced Skating Session", description: "For experienced skaters only" },
                    { time: "7:00 PM", activity: "Evening Family Skate", description: "Music and special lighting effects" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      <div className="w-3 h-3 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-purple-400 font-medium">{item.time}</span>
                          <span className="text-white/70">-</span>
                          <span className="text-white font-medium">{item.activity}</span>
                        </div>
                        {item.description && (
                          <p className="text-white/70 text-sm leading-relaxed">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-3">Ready to Skate?</h3>
              <p className="text-white/90 mb-4">Book your session now and experience the magic of ice skating!</p>
              <button className="w-full bg-white text-purple-600 font-semibold py-3 px-6 rounded-lg hover:bg-white/90 transition-colors transform hover:scale-105">
                Book Now
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Image Modal */}
      {imageModalOpen && post?.image_path && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setImageModalOpen(false)}
        >
          <div className="relative max-w-7xl max-h-full">
            {/* Close Button */}
            <button
              onClick={() => setImageModalOpen(false)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white text-4xl font-bold z-10 transition-colors"
            >
              ×
            </button>
            
            {/* Image */}
            <img 
              src={getImageSrc(post.image_path)}
              alt={post.title}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
            
            {/* Image Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white">
              <h3 className="text-lg font-semibold mb-1">{post.title}</h3>
              <p className="text-white/70 text-sm">Click outside to close</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostPage;
