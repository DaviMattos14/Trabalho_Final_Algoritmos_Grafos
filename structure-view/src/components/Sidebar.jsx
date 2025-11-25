import React from 'react';
import { LayoutDashboard, BookOpen, Box, Archive, BarChart3, Moon, Network } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Início', active: true },
    { icon: <BookOpen size={20} />, label: 'Aulas', active: false },
    { icon: <Box size={20} />, label: 'Problema Atual', active: false },
    { icon: <Archive size={20} />, label: 'Problemas Passados', active: false },
    { icon: <BarChart3 size={20} />, label: 'Resultados', active: false },
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: '#f3f4f6', // Cinza do Figma
      borderRight: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 0',
      flexShrink: 0 
    }}>
      {/* Logo */}
      <div style={{ padding: '0 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Network color="#2563eb" size={28} />
        <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827' }}>StructureView</span>
      </div>

      {/* Menu */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {menuItems.map((item, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 1.5rem',
            cursor: 'pointer',
            color: item.active ? '#1d4ed8' : '#64748b',
            backgroundColor: item.active ? '#ffffff' : 'transparent',
            borderLeft: item.active ? '4px solid #2563eb' : '4px solid transparent',
            fontWeight: '500',
            fontSize: '0.95rem',
            transition: 'all 0.2s'
          }}>
            {item.icon}
            {item.label}
          </div>
        ))}
      </nav>

      {/* Footer Sidebar */}
      <div style={{ padding: '0 1.5rem', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', cursor: 'pointer' }}>
        <Moon size={20} />
        <span>Dark Mode</span>
      </div>
    </aside>
  );
};

export default Sidebar;