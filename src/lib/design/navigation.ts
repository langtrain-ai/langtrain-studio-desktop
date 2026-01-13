export interface NavItem {
    id: string;
    title: string;
    icon: string;
    path: string;
}

export const sidebarItems: readonly NavItem[] = [
    { id: 'dashboard', title: 'Dashboard', icon: 'Home', path: '/' },
    { id: 'agents', title: 'Agents', icon: 'Bot', path: '/agents' },
    { id: 'projects', title: 'Projects', icon: 'Layers', path: '/projects' },
    { id: 'datasets', title: 'Datasets', icon: 'Database', path: '/datasets' },
    { id: 'models', title: 'Models', icon: 'Cpu', path: '/models' },
    { id: 'training', title: 'Training', icon: 'Terminal', path: '/training' },
    { id: 'analytics', title: 'Analytics', icon: 'LineChart', path: '/analytics' },
] as const;

export const systemItems: readonly NavItem[] = [
    { id: 'settings', title: 'Settings', icon: 'Settings', path: '/settings' },
    { id: 'documentation', title: 'Documentation', icon: 'BookOpen', path: '/documentation' },
] as const;

export type SidebarItemId = typeof sidebarItems[number]['id'] | typeof systemItems[number]['id'];
