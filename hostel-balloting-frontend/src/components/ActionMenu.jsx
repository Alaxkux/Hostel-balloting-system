import { useState, useRef, useEffect } from 'react'

const MENU_WIDTH = 176
const ITEM_HEIGHT = 36

function ActionMenu({ items }) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef(null)
  const menuRef = useRef(null)

  const openMenu = () => {
    const rect = buttonRef.current.getBoundingClientRect()
    const menuHeight = items.length * ITEM_HEIGHT + 8
    const opensUpward = rect.bottom + menuHeight > window.innerHeight

    setPosition({
      top: opensUpward ? rect.top - menuHeight - 4 : rect.bottom + 4,
      left: Math.max(8, rect.right - MENU_WIDTH),
    })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e) => {
      const clickedMenu = menuRef.current && menuRef.current.contains(e.target)
      const clickedButton = buttonRef.current && buttonRef.current.contains(e.target)
      if (!clickedMenu && !clickedButton) setOpen(false)
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const close = () => setOpen(false)

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [open])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label="Row actions"
        aria-haspopup="menu"
        onClick={() => (open ? setOpen(false) : openMenu())}
        className="w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 text-lg leading-none"
      >
        ⋮
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          style={{ top: position.top, left: position.left, width: MENU_WIDTH }}
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false)
                item.onClick()
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed ${
                item.danger ? 'text-red-600' : 'text-gray-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>
  )
}

export default ActionMenu