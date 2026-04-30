import { useEffect, useRef } from 'react';
import { useAuth } from '../store/authStore';
import gsap from 'gsap';
import { Package, ClipboardCheck, Barcode } from 'lucide-react';

export default function Dashboard() {
  const { data, reset } = useAuth();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dashboardRef.current) {
      gsap.fromTo(
        dashboardRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
    if (cardsRef.current) {
      const cards = cardsRef.current.children;
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          stagger: 0.12,
          ease: 'power2.out',
          delay: 0.3,
        }
      );
    }
  }, []);

  const stats = [
    { label: "Today's Shipments", value: '120', icon: Package, color: '#FF9900' },
    { label: 'Active Tasks', value: '8', icon: ClipboardCheck, color: '#067D62' },
    { label: 'Scan Rate', value: '99.2%', icon: Barcode, color: '#232F3E' },
  ];

  return (
    <div ref={dashboardRef} className="w-full max-w-[600px]">
      <div className="mb-6">
        <h1 className="text-[32px] font-normal text-[#0F1111] mb-1">
          Welcome, {data.firstName || 'User'}!
        </h1>
        <p className="text-[13px] text-[#565959]">
          ECS Warehouse Employee Dashboard — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div ref={cardsRef} className="grid grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-lg p-4 text-center"
              style={{
                background: 'rgba(255,255,255,0.82)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
              }}
            >
              <div
                className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <Icon size={20} color={stat.color} />
              </div>
              <div className="text-[24px] font-normal text-[#0F1111] mb-1">{stat.value}</div>
              <div className="text-[11px] text-[#565959]">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div
        className="rounded-lg p-5 mb-4"
        style={{
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        }}
      >
        <h3 className="text-[16px] font-bold text-[#0F1111] mb-3">Quick Actions</h3>
        <div className="flex gap-3">
          <button className="btn-amazon" style={{ width: 'auto', padding: '0 24px' }}>
            Scan New Package
          </button>
          <button
            className="btn-amazon"
            style={{
              width: 'auto',
              padding: '0 24px',
              background: '#FFFFFF',
              borderColor: '#888C8C',
              color: '#0F1111',
            }}
            onClick={() => reset()}
          >
            Sign Out
          </button>
        </div>
      </div>

      <div
        className="rounded-lg p-5"
        style={{
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        }}
      >
        <h3 className="text-[16px] font-bold text-[#0F1111] mb-3">Recent Activity</h3>
        <div className="space-y-2">
          {[
            { action: 'Package scanned', detail: 'PKG-8842-91', time: '10:23 AM' },
            { action: 'Task completed', detail: 'Inventory check - Zone B', time: '9:45 AM' },
            { action: 'Package scanned', detail: 'PKG-8841-22', time: '9:12 AM' },
          ].map((item, i) => (
            <div
              key={i}
              className="flex justify-between items-center py-2 border-b border-[#E7E7E7] last:border-0"
            >
              <div>
                <span className="text-[13px] text-[#0F1111]">{item.action}</span>
                <span className="text-[11px] text-[#565959] ml-2">— {item.detail}</span>
              </div>
              <span className="text-[11px] text-[#565959]">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-center">
        <span className="text-[10px] text-[#565959] opacity-50">ECS Warehouse Access Portal v2.1</span>
      </div>
    </div>
  );
}
