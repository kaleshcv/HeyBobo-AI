import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/uiStore'

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<any>
  href: string
}

interface SidebarProps {
  items: NavItem[]
  isOpen: boolean
  onClose?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ items, isOpen, onClose }) => {
  const location = useLocation()
  const theme    = useUIStore((s) => s.theme)
  const isRTL    = useUIStore((s) => s.isRTL)
  const isDark   = theme === 'dark'

  const accent      = isDark ? '#C9A84C' : '#00843D'
  const accentBg    = isDark ? 'rgba(201,168,76,0.12)' : 'rgba(0,132,61,0.09)'
  const hoverBg     = isDark ? 'rgba(201,168,76,0.06)' : 'rgba(0,132,61,0.05)'
  const sidebarBg   = isDark ? '#0a1628' : '#FFFFFF'
  const borderColor = isDark ? 'rgba(201,168,76,0.12)' : '#E2EBE8'
  const textActive  = isDark ? '#C9A84C' : '#00843D'
  const textDefault = isDark ? '#B8C8D8' : '#4A5568'
  const overlayBg   = isDark ? 'rgba(13,27,42,0.7)' : 'rgba(0,0,0,0.4)'

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: overlayBg,
            zIndex: 20,
            backdropFilter: 'blur(2px)',
          }}
          className="md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          background: sidebarBg,
          borderRight: isRTL ? 'none' : `1px solid ${borderColor}`,
          borderLeft:  isRTL ? `1px solid ${borderColor}` : 'none',
          boxShadow: isDark
            ? '4px 0 24px rgba(0,0,0,0.4)'
            : '4px 0 24px rgba(0,132,61,0.06)',
          fontFamily: '"Cairo", "Inter", sans-serif',
        }}
        className={cn(
          'fixed md:relative w-64 h-[calc(100vh-4rem)] z-30',
          'transition-transform duration-300 ease-in-out md:translate-x-0',
          'overflow-y-auto',
          isOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')
        )}
      >
        <nav style={{ padding: '16px 8px' }}>
          {items.map((item) => {
            const Icon     = item.icon
            const isActive = location.pathname === item.href

            return (
              <Link
                key={item.id}
                to={item.href}
                onClick={() => onClose?.()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 10,
                  marginBottom: 4,
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 14,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  color: isActive ? textActive : textDefault,
                  background: isActive ? accentBg : 'transparent',
                  borderLeft: (!isRTL && isActive) ? `3px solid ${accent}` : undefined,
                  borderRight: (isRTL && isActive) ? `3px solid ${accent}` : undefined,
                  paddingLeft: (!isRTL && isActive) ? '11px' : undefined,
                  paddingRight: (isRTL && isActive) ? '11px' : undefined,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.background = hoverBg
                    ;(e.currentTarget as HTMLAnchorElement).style.color = isDark ? '#F5F0E8' : '#1C1C1C'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
                    ;(e.currentTarget as HTMLAnchorElement).style.color = textDefault
                  }
                }}
              >
                <Icon
                  size={18}
                  style={{ color: isActive ? accent : textDefault, flexShrink: 0 }}
                />
                <span style={{ fontFamily: '"Cairo", "Inter", sans-serif' }}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
