import { Image, Library, Map, MapPin, Info, Database, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
    isOpen: boolean;
}

const NavItem = ({
    icon,
    label,
    isOpen,
    active = false
}: {
    icon: React.ReactNode;
    label: string;
    isOpen: boolean;
    active?: boolean;
}) => (
    <button
        style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            gap: '16px',
            background: active ? 'rgba(52, 168, 83, 0.1)' : 'transparent',
            border: 'none',
            color: active ? '#34A853' : 'var(--text-secondary)',
            cursor: 'pointer',
            borderRadius: '0 24px 24px 0',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            margin: '4px 0',
            paddingLeft: '24px',
        }}
        onMouseEnter={e => {
            if (!active) {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                e.currentTarget.style.color = 'var(--text-primary)';
            }
        }}
        onMouseLeave={e => {
            if (!active) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
            }
        }}
    >
        <div style={{ minWidth: '24px', display: 'flex', justifyContent: 'center' }}>
            {icon}
        </div>
        <span style={{
            fontSize: '14px',
            fontWeight: active ? 500 : 400,
            opacity: isOpen ? 1 : 0,
            transition: 'opacity 0.2s',
            marginLeft: '4px'
        }}>
            {label}
        </span>
    </button>
);

const Divider = () => (
    <div style={{
        height: '1px',
        backgroundColor: 'var(--border-subtle)',
        margin: '12px 0 12px 24px'
    }} />
);

const SectionHeader = ({ label, isOpen }: { label: string, isOpen: boolean }) => (
    <div style={{
        paddingLeft: '24px',
        paddingBottom: '8px',
        paddingTop: '16px',
        opacity: isOpen ? 1 : 0,
        height: isOpen ? 'auto' : '0px',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        pointerEvents: 'none'
    }}>
        <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
        }}>
            {label}
        </span>
    </div>
);

export function Sidebar({ isOpen }: SidebarProps) {
    const [activeItem, setActiveItem] = useState('Photos');

    return (
        <aside
            style={{
                width: isOpen ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed-width)',
                height: '100%',
                backgroundColor: 'var(--bg-primary)',
                transition: 'width var(--transition-smooth)',
                display: 'flex',
                flexDirection: 'column',
                paddingTop: '20px',
                borderRight: '1px solid var(--border-subtle)',
                overflow: 'hidden',
                zIndex: 100,
                flexShrink: 0
            }}
        >
            <div onClick={() => setActiveItem('Photos')}>
                <NavItem icon={<Image size={20} />} label="Photos" isOpen={isOpen} active={activeItem === 'Photos'} />
            </div>
            <div onClick={() => setActiveItem('Albums')}>
                <NavItem icon={<Library size={20} />} label="Albums" isOpen={isOpen} active={activeItem === 'Albums'} />
            </div>
            <div onClick={() => setActiveItem('Map')}>
                <NavItem icon={<Map size={20} />} label="Map" isOpen={isOpen} active={activeItem === 'Map'} />
            </div>

            <SectionHeader label="Manage" isOpen={isOpen} />

            <div onClick={() => setActiveItem('Locations')}>
                <NavItem icon={<MapPin size={20} />} label="Locations" isOpen={isOpen} active={activeItem === 'Locations'} />
            </div>
            <div onClick={() => setActiveItem('Metadata')}>
                <NavItem icon={<Info size={20} />} label="Metadata" isOpen={isOpen} active={activeItem === 'Metadata'} />
            </div>
            <div onClick={() => setActiveItem('Sources')}>
                <NavItem icon={<Database size={20} />} label="Sources" isOpen={isOpen} active={activeItem === 'Sources'} />
            </div>

            <Divider />

            <div onClick={() => setActiveItem('Trash')}>
                <NavItem icon={<Trash2 size={20} />} label="Trash" isOpen={isOpen} active={activeItem === 'Trash'} />
            </div>
        </aside>
    );
}
