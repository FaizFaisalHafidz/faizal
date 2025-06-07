import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { PageProps, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    File,
    LayoutGrid,
    PaintBucket,
    Users
} from 'lucide-react';
import AppLogo from './app-logo';

interface CustomProps extends PageProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            email_verified_at: string | null;
            created_at: string;
            updated_at: string;
            roles: { name: string }[];
            permissions: string[];
        };
    };
}

export function AppSidebar() {
    const { auth } = usePage<CustomProps>().props;
    const roles = auth.user?.roles?.map(role => role.name) || [];
    const permissions = auth.user?.permissions || [];

    // Helper function to check permission
    const hasPermission = (permission: string) => {
        return permissions.includes(permission);
    };

    // Menu dasar untuk authenticated users
    const dashboardMenu: NavItem[] = [];
    
    // Add dashboard if user has permission
    if (hasPermission('view-dashboard')) {
        dashboardMenu.push({
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        });
    }
    
    // Menu untuk Admin - Full access
    const adminMenu: NavItem[] = [];
    
    if (hasPermission('view-projects')) {
        adminMenu.push({
            title: 'Projects',
            href: '/management/projects',
            icon: PaintBucket,
        });
    }

    if (hasPermission('view-price-list')) {
        adminMenu.push({
            title: 'Daftar Harga',
            href: '/management/daftar-harga',
            icon: BookOpen,
        });
    }

    if (hasPermission('view-reports')) {
        adminMenu.push({
            title: 'Laporan',
            href: '/laporan',
            icon: File,
        });
    }

    // Additional admin menus
    // if (roles.includes('admin')) {
    //     adminMenu.push(
    //         {
    //             title: 'Pengaturan',
    //             href: '/admin/settings',
    //             icon: Settings,
    //         }
    //     );
    // }
    
    // Menu untuk Owner - Dashboard dan Laporan saja
    const ownerMenu: NavItem[] = [];
    
    if (hasPermission('view-reports')) {
        ownerMenu.push({
            title: 'Laporan',
            href: '/laporan',
            icon: File,
        });

        if (hasPermission('view-users')) {
            ownerMenu.push({
                title: 'Manajemen User',
                href: '/management/users',
                icon: Users,
            });
        }
        
        // ownerMenu.push({
        //     title: 'Analisis Bisnis',
        //     href: '/owner/analytics',
        //     icon: TrendingUp,
        // });
        
        // ownerMenu.push({
        //     title: 'Laporan Keuangan',
        //     href: '/owner/financial',
        //     icon: DollarSign,
        // });
    }
    
    // Menu untuk Customer - Hanya akses public (tidak ada menu khusus di sidebar)
    const customerMenu: NavItem[] = [
        // Customer akan diarahkan ke halaman public, tidak perlu menu sidebar khusus
    ];
    
    // Menentukan menu yang akan ditampilkan berdasarkan role
    let mainNavItems = [...dashboardMenu];
    
    if (roles.includes('admin')) {
        mainNavItems = [...mainNavItems, ...adminMenu];
    } else if (roles.includes('owner')) {
        mainNavItems = [...mainNavItems, ...ownerMenu];
    } else if (roles.includes('customer')) {
        // Customer tidak mendapat menu tambahan, hanya dashboard jika ada
        mainNavItems = [...dashboardMenu];
    }

    const footerNavItems: NavItem[] = [
        // Add footer items if needed
    ];

    return (
        <Sidebar collapsible="icon" variant="inset" className="">
            <SidebarHeader className="py-6">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="flex items-center justify-center">
                            <Link href="/dashboard" prefetch className="flex items-center gap-3">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-2">
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="mt-auto pt-4">
                <NavFooter items={footerNavItems} className="mb-4" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
