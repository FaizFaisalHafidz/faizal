import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    Copy,
    Edit,
    Globe,
    Mail,
    MoreHorizontal,
    Pencil,
    RefreshCw,
    Settings,
    Shield,
    Trash2,
    User,
    UserCheck,
    UserMinus,
    XCircle
} from 'lucide-react';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';

interface Role {
    id: number;
    name: string;
    display_name: string;
}

interface Permission {
    id: number;
    name: string;
    display_name: string;
}

interface UserData {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles: Role[];
    status: 'active' | 'inactive';
    is_current_user: boolean;
}

interface ActivityLog {
    id: number;
    action: string;
    description: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
}

interface Props {
    user: UserData;
    permissions: Permission[];
}

export default function UserShow({ user, permissions }: Props) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [loadingActivity, setLoadingActivity] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Management', href: '/management' },
        { title: 'Users', href: '/management/users' },
        { title: user.name, href: '#' },
    ];

    const handleDeleteUser = () => {
        if (user.is_current_user) {
            toast.error('Anda tidak dapat menghapus akun Anda sendiri');
            return;
        }
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route('users.destroy', user.id), {
            onSuccess: () => {
                toast.success('User berhasil dihapus');
                router.visit(route('users.index'));
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] as string);
            },
        });
    };

    const handleToggleStatus = () => {
        if (user.is_current_user) {
            toast.error('Anda tidak dapat mengubah status akun Anda sendiri');
            return;
        }

        router.post(route('users.toggle-status', user.id), {}, {
            onSuccess: () => {
                const newStatus = user.status === 'active' ? 'dinonaktifkan' : 'diaktifkan';
                toast.success(`User berhasil ${newStatus}`);
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] as string);
            },
        });
    };

    const handleSendPasswordReset = () => {
        router.post(route('users.send-password-reset', user.id), {}, {
            onSuccess: () => {
                toast.success(`Link reset password dikirim ke ${user.email}`);
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] as string);
            },
        });
    };

    const loadActivityLogs = async () => {
        setLoadingActivity(true);
        try {
            const response = await fetch(route('users.activity-logs', user.id));
            const data = await response.json();
            
            if (data.success) {
                setActivityLogs(data.data);
            } else {
                toast.error('Gagal memuat activity logs');
            }
        } catch (error) {
            toast.error('Gagal memuat activity logs');
        } finally {
            setLoadingActivity(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Berhasil disalin ke clipboard');
    };

    const getStatusBadge = (status: string) => {
        return status === 'active' ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Aktif
            </Badge>
        ) : (
            <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                <XCircle className="h-3 w-3 mr-1" />
                Nonaktif
            </Badge>
        );
    };

    const getRoleBadgeVariant = (roleName: string) => {
        const variants: Record<string, any> = {
            admin: 'destructive',
            owner: 'default',
            customer: 'secondary',
        };
        return variants[roleName] || 'outline';
    };

    const formatUserAgent = (userAgent: string) => {
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Unknown Browser';
    };

    const getActivityIcon = (action: string) => {
        switch (action) {
            case 'login':
                return <User className="h-4 w-4" />;
            case 'logout':
                return <XCircle className="h-4 w-4" />;
            case 'profile_update':
                return <Edit className="h-4 w-4" />;
            case 'password_change':
                return <Shield className="h-4 w-4" />;
            default:
                return <Activity className="h-4 w-4" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`User - ${user.name}`} />
            <Toaster position="top-right" richColors />

            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                                {user.is_current_user && (
                                    <Badge variant="outline">You</Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                                {getStatusBadge(user.status)}
                                {user.email_verified_at && (
                                    <Badge variant="outline" className="text-xs">
                                        <Mail className="h-3 w-3 mr-1" />
                                        Verified
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={route('users.edit', user.id)}>
                            <Button>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit User
                            </Button>
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                    onClick={handleToggleStatus}
                                    disabled={user.is_current_user}
                                >
                                    {user.status === 'active' ? (
                                        <>
                                            <UserMinus className="mr-2 h-4 w-4" />
                                            Nonaktifkan
                                        </>
                                    ) : (
                                        <>
                                            <UserCheck className="mr-2 h-4 w-4" />
                                            Aktifkan
                                        </>
                                    )}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleSendPasswordReset}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    onClick={handleDeleteUser}
                                    disabled={user.is_current_user}
                                    className="text-red-600"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete User
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Link href={route('users.index')}>
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Users
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Content Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
                        <TabsTrigger value="activity">Activity Logs</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Informasi Dasar
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-muted-foreground">User ID</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm">#{user.id}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(user.id.toString())}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-muted-foreground">Nama</span>
                                            <span className="font-medium">{user.name}</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-muted-foreground">Email</span>
                                            <div className="flex items-center gap-2">
                                                <span>{user.email}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(user.email)}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-muted-foreground">Status</span>
                                            {getStatusBadge(user.status)}
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-muted-foreground">Email Verified</span>
                                            {user.email_verified_at ? (
                                                <Badge variant="default" className="bg-green-100 text-green-800">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Verified
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    <XCircle className="h-3 w-3 mr-1" />
                                                    Not Verified
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Account Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Detail Akun
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-muted-foreground">Bergabung</span>
                                            <span className="text-sm">{user.created_at}</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-muted-foreground">Terakhir Update</span>
                                            <span className="text-sm">{user.updated_at}</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-muted-foreground">Total Roles</span>
                                            <Badge variant="outline">{user.roles.length} role(s)</Badge>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-muted-foreground">Total Permissions</span>
                                            <Badge variant="outline">{permissions.length} permission(s)</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Current Roles */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Current Roles
                                </CardTitle>
                                <CardDescription>
                                    Role yang saat ini dimiliki oleh user ini
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {user.roles.length > 0 ? (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {user.roles.map((role) => (
                                            <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <Shield className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium">{role.display_name}</h3>
                                                        <p className="text-sm text-muted-foreground">{role.name}</p>
                                                    </div>
                                                </div>
                                                <Badge variant={getRoleBadgeVariant(role.name)}>
                                                    {role.name}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Shield className="mx-auto h-8 w-8 mb-2" />
                                        <p>User tidak memiliki role</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Roles & Permissions Tab */}
                    <TabsContent value="roles" className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Roles */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        User Roles
                                    </CardTitle>
                                    <CardDescription>
                                        Semua role yang dimiliki user ini
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {user.roles.length > 0 ? (
                                        <div className="space-y-3">
                                            {user.roles.map((role) => (
                                                <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div>
                                                        <h4 className="font-medium">{role.display_name}</h4>
                                                        <p className="text-sm text-muted-foreground">{role.name}</p>
                                                    </div>
                                                    <Badge variant={getRoleBadgeVariant(role.name)}>
                                                        {role.name}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Shield className="mx-auto h-8 w-8 mb-2" />
                                            <p>No roles assigned</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Permissions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings className="h-5 w-5" />
                                        Permissions
                                    </CardTitle>
                                    <CardDescription>
                                        Permission yang dimiliki melalui roles
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {permissions.length > 0 ? (
                                        <div className="space-y-2">
                                            {permissions.map((permission) => (
                                                <div key={permission.id} className="flex items-center justify-between py-2 px-3 rounded border">
                                                    <span className="text-sm">{permission.display_name}</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {permission.name}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Settings className="mx-auto h-8 w-8 mb-2" />
                                            <p>No permissions available</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Activity Logs Tab */}
                    <TabsContent value="activity" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Activity Logs
                                </CardTitle>
                                <CardDescription>
                                    Log aktivitas user dalam sistem
                                </CardDescription>
                                <div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={loadActivityLogs}
                                        disabled={loadingActivity}
                                    >
                                        {loadingActivity ? (
                                            <>
                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                Load Activity Logs
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {activityLogs.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Activity</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>IP Address</TableHead>
                                                <TableHead>Browser</TableHead>
                                                <TableHead>Time</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {activityLogs.map((log) => (
                                                <TableRow key={log.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {getActivityIcon(log.action)}
                                                            <span className="capitalize">{log.action.replace('_', ' ')}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm">{log.description}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Globe className="h-3 w-3" />
                                                            <span className="font-mono text-xs">{log.ip_address}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm">{formatUserAgent(log.user_agent)}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-3 w-3" />
                                                            <span className="text-sm">{log.created_at}</span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Activity className="mx-auto h-8 w-8 mb-2" />
                                        <p>Click "Load Activity Logs" to view user activities</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Konfirmasi Hapus</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus user <strong>{user.name}</strong>?
                                Tindakan ini tidak dapat dibatalkan.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button variant="destructive" onClick={confirmDelete}>
                                Ya, Hapus
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}