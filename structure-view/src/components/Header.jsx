import React from 'react';
import { Menu, ChevronDown } from 'lucide-react';

const Header = ({ title }) => {
  return (
    <header style={{
      height: '64px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      flexShrink: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Menu size={24} style={{ cursor: 'pointer', color: '#374151' }} />
        <h1 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#111827' }}>{title}</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151', cursor: 'pointer', fontSize: '0.9rem' }}>
        <span>Olá, Fulano</span>
        <ChevronDown size={16} />
      </div>
    </header>
  );
};

export default Header;