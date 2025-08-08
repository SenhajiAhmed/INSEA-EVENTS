import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "../../components/ui/button";
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import INSEALogo from '../../INSEA_Events_logo.png';

// Placeholder for user profile image
const userProfileImg = 'https://randomuser.me/api/portraits/men/32.jpg';

const sidebarLinks = [
  { name: 'Dashboard', icon: '📊', path: '/dashboard' },
  { name: 'Scraper', icon: '🤖', path: '/scraper' },
  { name: 'Apps', icon: '🧩' },
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
  const [token, setToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      navigate('/login', { replace: true });
    } else {
      setToken(storedToken);
    }
  }, [navigate]);

  if (!token) return null;

  return (
    <div className="min-h-screen w-full flex bg-[#181824]">
      {/* Sidebar */}
      <aside className="flex flex-col min-h-screen h-screen w-64 min-w-[220px] max-w-xs bg-[#232135] p-4 text-gray-200 overflow-y-auto scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
              className={`flex items-center w-full px-4 py-2 mb-1 rounded-lg hover:bg-purple-800/40 transition ${window.location.pathname === link.path ? 'bg-purple-800 text-white' : ''}`}
              onClick={() => link.path && navigate(link.path)}
            >
              <span className="mr-3 text-lg">{link.icon}</span>
              <span className="text-sm font-medium">{link.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 h-full w-full">
        {/* Top Header */}
        <header className="flex items-center justify-between px-8 py-4 bg-[#232135] border-b border-[#23213a]">
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
          </div>
        </header>

        {/* Widgets Grid */}
        <main className="flex-1 w-full h-full p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 overflow-auto">
          {/* Visit And Sales Statistics (Bar Chart Placeholder) */}
          <section className="bg-[#232135] rounded-2xl shadow-lg p-4 md:p-6 flex flex-col min-h-[250px] h-full">
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
          <section className="bg-[#232135] rounded-2xl shadow-lg p-4 md:p-6 flex flex-col min-h-[250px] h-full">
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
          <section className="bg-[#232135] rounded-2xl shadow-lg p-4 md:p-6 flex flex-col min-h-[250px] h-full">
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
          <section className="bg-[#232135] rounded-2xl shadow-lg p-4 md:p-6 flex flex-col min-h-[250px] h-full items-center justify-center">
            <h2 className="text-lg font-bold text-white mb-4">August 2019</h2>
            <div className="bg-teal-300 text-[#232135] rounded-lg p-4 w-full flex flex-col items-center">
              <div className="flex justify-between w-full mb-2">
                <span className="font-bold">«</span>
                <span className="font-bold">August 2019</span>
                <span className="font-bold">»</span>
              </div>
              <div className="grid grid-cols-7 gap-2 w-full">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d, i) => (
                  <span key={i} className="font-bold text-center">{d}</span>
                ))}
                {[...Array(31)].map((_, i) => (
                  <span key={i} className="text-center">{i+1}</span>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
