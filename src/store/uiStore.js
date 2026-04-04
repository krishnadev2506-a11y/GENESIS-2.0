import { create } from 'zustand'

const useUiStore = create((set) => ({
  sidebarOpen: false,
  activeModal: null,
  theme: 'cyberpunk',
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  setActiveModal: (modal) => set({ activeModal: modal }),
  setTheme: (theme) => set({ theme }),
}))

export default useUiStore
