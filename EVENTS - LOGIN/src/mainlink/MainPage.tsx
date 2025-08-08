import React, { useEffect, useState } from 'react';
import INSEALogo from '../INSEA_Events_logo.png';
import INSEAImg from '../INSEA.jpeg';

const features = [
  {
    title: 'Hasty Pudding Club',
    img: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Hasty_Pudding_Club_Logo.png',
    desc: 'As the oldest social club in the U.S., the Pudding has continued as a cornerstone of the Harvard experience for over two centuries. There is no other collegiate organization quite like it.',
    link: '#',
    linkText: 'View more',
  },
  {
    title: 'Hasty Pudding Theatricals',
    img: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Hasty_Pudding_Theatricals_Logo.png',
    desc: 'The Hasty Pudding Theatricals is the third oldest theater organization in the world, preceded only by the Comédie-Française and the Oberammergau Passion Players.',
    link: '#',
    linkText: 'Buy tickets!',
  },
  {
    title: 'Harvard Krokodiloes',
    img: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Harvard_Krokodiloes_Logo.png',
    desc: "Harvard University's oldest and most prestigious a cappella singing group, the Krokodiloes perform popular music from the 1920s through the 1960s.",
    link: '#',
    linkText: 'View more',
  },
];

const navLinks = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Hasty Pudding Club', href: '#' },
  { label: 'Hasty Pudding Theatricals', href: '#' },
  { label: 'Kroks', href: '#' },
  { label: 'Contact', href: '#' },
];

export default function MainPage() {
  const [showContent, setShowContent] = useState(false);
  const [hideBackground, setHideBackground] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 80) {
        setShowContent(true);
      } else {
        setShowContent(false);
      }
      
      if (window.scrollY > 200) {
        setHideBackground(true);
      } else {
        setHideBackground(false);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col relative">
      {/* Background Image with Overlay */}
      <div
        className={`fixed inset-0 w-full h-full z-0 transition-opacity duration-700 ${hideBackground ? 'opacity-0' : 'opacity-100'}`}
        style={{
          backgroundImage: `url(${INSEAImg})`,
          backgroundSize: '100vw auto',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#1a1443',
        }}
        aria-hidden="true"
      />
      {/* Header */}
      <header className="w-full sticky top-0 z-20 backdrop-blur-md border-b border-white/10" 
        style={{ 
          background: 'linear-gradient(135deg, rgba(26, 20, 67, 0.95) 0%, rgba(35, 32, 70, 0.9) 25%, rgba(45, 30, 79, 0.85) 50%, rgba(58, 34, 90, 0.9) 75%, rgba(67, 36, 104, 0.95) 100%)',
          boxShadow: '0 8px 32px rgba(26, 20, 67, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
        }}>
        <div className="max-w-7xl mx-auto flex flex-row items-center py-3 px-6">
          <div className="relative">
            <img 
              src={INSEALogo} 
              alt="Logo" 
              className="h-16 w-auto mr-10 animate-fade-in transition-transform duration-300 hover:scale-105" 
              style={{
                minWidth: '5rem',
                filter: 'drop-shadow(0 4px 12px rgba(139, 92, 246, 0.4)) drop-shadow(0 0 20px rgba(255, 255, 255, 0.2))'
              }} 
            />
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-lg opacity-75"></div>
          </div>
          <nav className="flex gap-8 flex-1">
            {navLinks.map((link, index) => (
              <a
                key={link.label}
                href={link.href}
                className="relative px-1 py-1 text-lg font-medium transition-colors duration-200 hover:text-purple-300 group"
                style={{
                  color: 'rgba(255, 255, 255, 0.9)'
                }}
              >
                {link.label}
                <span
                  className="absolute left-0 -bottom-1 w-full h-0.5 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                />
              </a>
            ))}
          </nav>
          {/* Additional header decoration */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
        {/* Bottom gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </header>
      {/* Hero Section with Background */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 relative z-10">
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-4 tracking-tight text-white drop-shadow-lg">The Hasty Pudding Institute of 1770</h1>
        <hr className="w-24 border-t-2 border-purple-400 mx-auto mb-6" />
        <p className="max-w-2xl text-center text-lg text-purple-200">
          The <span className="italic">Hasty Pudding Institute of 1770</span> comprises the <span className="font-semibold text-purple-300">Hasty Pudding Club</span>, the <span className="font-semibold text-purple-300">Hasty Pudding Theatricals</span> and the <span className="font-semibold text-purple-300">Harvard Krokodiloes</span>. Over the last two centuries, it has grown into a premiere performing arts organization, a patron for the arts and comedy, and an advocate for satire and discourse as tools for change worldwide.
        </p>
      </section>
      {/* Main Content Section */}
      <section className={`min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h2 className="text-4xl font-bold text-center mb-8 text-white">Our Programs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mb-16">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="bg-gradient-to-br from-gray-800 via-gray-900 to-purple-950 rounded-xl shadow-lg p-6 flex flex-col items-center transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl group border border-purple-800/40"
              style={{ animationDelay: `${0.2 + i * 0.1}s` }}
            >
              <img src={feature.img} alt={feature.title} className="h-32 w-32 object-contain mb-4 rounded-full border-4 border-purple-400 group-hover:scale-105 transition-transform duration-300 bg-white" />
              <h3 className="text-xl font-semibold mb-2 text-center group-hover:text-purple-300 transition-colors duration-200">{feature.title}</h3>
              <p className="text-purple-100 text-center mb-4">{feature.desc}</p>
              <a
                href={feature.link}
                className="text-purple-300 hover:text-pink-400 font-medium transition-colors duration-200 underline underline-offset-4"
              >
                {feature.linkText}
              </a>
            </div>
          ))}
        </div>
        {/* Additional Content */}
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6 text-white">Join Our Community</h3>
          <p className="text-lg text-purple-200 mb-8">
            Experience the rich tradition and vibrant culture of the Hasty Pudding Institute. Whether you're interested in theater, music, or social activities, there's a place for you in our community.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-6 border border-purple-700">
              <h4 className="text-xl font-semibold mb-4 text-white">Upcoming Events</h4>
              <p className="text-purple-200 mb-4">Don't miss our next theatrical performance and musical showcase.</p>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
                View Events
              </button>
            </div>
            <div className="bg-gradient-to-br from-pink-900 to-pink-800 rounded-xl p-6 border border-pink-700">
              <h4 className="text-xl font-semibold mb-4 text-white">Get Involved</h4>
              <p className="text-pink-200 mb-4">Join our community and become part of this historic institution.</p>
              <button className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg transition-colors">
                Join Now
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Animations */}
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-slow { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-down { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes grow-in { from { width: 0; } to { width: 6rem; } }
        .animate-fade-in { animation: fade-in 0.8s both; }
        .animate-fade-in-slow { animation: fade-in-slow 1.2s both; }
        .animate-slide-down { animation: slide-down 0.7s both; }
        .animate-grow-in { animation: grow-in 1s both; }
      `}</style>
    </div>
  );
}