import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

interface NavMainProps {
    items: NavItem[];
    className?: string;
}

export function NavMain({ items, className }: NavMainProps) {
    const { url } = usePage();
    
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu className={cn('space-y-1', className)}>
                {items.map((item) => {
                    const isActive = url.startsWith(item.href);
                    const Icon = item.icon;
                    
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                className="transition-all duration-200 font-instrument-sans"
                                tooltip={item.title}
                            >
                                <Link href={item.href} prefetch>
                                    {Icon && <Icon className="text-zinc-400 group-hover:text-gray-500" />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
