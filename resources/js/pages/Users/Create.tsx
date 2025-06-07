import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Eye,
    EyeOff,
    Info,
    Mail,
    Save,
    Shield,
    User
} from 'lucide-react';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';

interface Role {
    id: number;
    name: string;
    display_name: string;
}

interface Props {
    roles: Role[];
}

export default function UserCreate({ roles }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Management', href: '/management' },
        { title: 'Users', href: '/management/users' },
        { title: 'Create User', href: '#' },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [] as string[],
        email_verified: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (data.roles.length === 0) {
            toast.error('Pilih minimal 1 role untuk user');
            return;
        }

        post(route('users.store'), {
            onSuccess: () => {
                toast.success('User berhasil dibuat');
                reset();
            },
            onError: (errors) => {
                console.log('Validation errors:', errors);
                const firstError = Object.values(errors)[0];
                if (typeof firstError === 'string') {
                    toast.error(firstError);
                }
            },
        });
    };

    const handleRoleChange = (roleName: string, checked: boolean) => {
        if (checked) {
            setData('roles', [...data.roles, roleName]);
        } else {
            setData('roles', data.roles.filter(role => role !== roleName));
        }
    };

    const getRoleDescription = (roleName: string) => {
        const descriptions: Record<string, string> = {
            admin: 'Akses penuh ke sistem termasuk manajemen user dan konfigurasi',
            owner: 'Akses untuk melihat proyek dan laporan yang berkaitan dengan bisnis',
            customer: 'Akses terbatas untuk melihat proyek sendiri dan komunikasi',
        };
        return descriptions[roleName] || 'Role khusus dengan permission tertentu';
    };

    const getRoleBadgeVariant = (roleName: string) => {
        const variants: Record<string, any> = {
            admin: 'destructive',
            owner: 'default',
            customer: 'secondary',
        };
        return variants[roleName] || 'outline';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create User" />
            <Toaster position="top-right" richColors />

            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create New User</h1>
                        <p className="text-muted-foreground">
                            Buat user baru dan assign role yang sesuai
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={route('users.index')}>
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Users
                            </Button>
                        </Link>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Informasi Dasar
                                    </CardTitle>
                                    <CardDescription>
                                        Masukkan informasi dasar user
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">
                                                Nama Lengkap <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Masukkan nama lengkap"
                                                className={errors.name ? 'border-red-500' : ''}
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-red-500">{errors.name}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">
                                                Email <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    placeholder="user@example.com"
                                                    className={`pl-8 ${errors.email ? 'border-red-500' : ''}`}
                                                />
                                            </div>
                                            {errors.email && (
                                                <p className="text-sm text-red-500">{errors.email}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="password">
                                                Password <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    placeholder="Minimal 8 karakter"
                                                    className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {errors.password && (
                                                <p className="text-sm text-red-500">{errors.password}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation">
                                                Konfirmasi Password <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="password_confirmation"
                                                    type={showPasswordConfirmation ? 'text' : 'password'}
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    placeholder="Ulangi password"
                                                    className={`pr-10 ${errors.password_confirmation ? 'border-red-500' : ''}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                                    className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showPasswordConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {errors.password_confirmation && (
                                                <p className="text-sm text-red-500">{errors.password_confirmation}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Role Assignment */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Role Assignment
                                    </CardTitle>
                                    <CardDescription>
                                        Pilih role yang sesuai untuk user ini (bisa lebih dari satu)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {roles.length > 0 ? (
                                        <div className="space-y-3">
                                            {roles.map((role) => (
                                                <div
                                                    key={role.id}
                                                    className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    <Checkbox
                                                        id={`role-${role.id}`}
                                                        checked={data.roles.includes(role.name)}
                                                        onCheckedChange={(checked) => 
                                                            handleRoleChange(role.name, checked as boolean)
                                                        }
                                                    />
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Label htmlFor={`role-${role.id}`} className="font-medium cursor-pointer">
                                                                {role.display_name}
                                                            </Label>
                                                            <Badge variant={getRoleBadgeVariant(role.name)}>
                                                                {role.name}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {getRoleDescription(role.name)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Shield className="mx-auto h-8 w-8 mb-2" />
                                            <p>Tidak ada role yang tersedia</p>
                                        </div>
                                    )}

                                    {errors.roles && (
                                        <p className="text-sm text-red-500">{errors.roles}</p>
                                    )}

                                    {data.roles.length > 0 && (
                                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
                                                <Info className="h-4 w-4" />
                                                Role Terpilih:
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {data.roles.map((roleName) => {
                                                    const role = roles.find(r => r.name === roleName);
                                                    return (
                                                        <Badge key={roleName} variant={getRoleBadgeVariant(roleName)}>
                                                            {role?.display_name || roleName}
                                                        </Badge>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Account Settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Account Settings</CardTitle>
                                    <CardDescription>
                                        Pengaturan akun user
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="email_verified"
                                            checked={data.email_verified}
                                            onCheckedChange={(checked) => setData('email_verified', checked as boolean)}
                                        />
                                        <div className="space-y-1">
                                            <Label htmlFor="email_verified" className="cursor-pointer">
                                                Email Verified
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Tandai email sebagai terverifikasi
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Info Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Info className="h-4 w-4" />
                                        Informasi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="space-y-2">
                                        <h4 className="font-medium">Password Requirements:</h4>
                                        <ul className="space-y-1 text-muted-foreground">
                                            <li>• Minimal 8 karakter</li>
                                            <li>• Harus dikonfirmasi dengan benar</li>
                                            <li>• Disarankan kombinasi huruf, angka, dan simbol</li>
                                        </ul>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <h4 className="font-medium">Role Guidelines:</h4>
                                        <ul className="space-y-1 text-muted-foreground">
                                            <li>• <strong>Admin:</strong> Akses penuh sistem</li>
                                            <li>• <strong>Owner:</strong> Akses bisnis/laporan</li>
                                            <li>• <strong>Customer:</strong> Akses terbatas</li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Actions */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="space-y-3">
                                        <Button 
                                            type="submit" 
                                            className="w-full" 
                                            disabled={processing}
                                        >
                                            {processing ? (
                                                <>
                                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Create User
                                                </>
                                            )}
                                        </Button>
                                        
                                        <Link href={route('users.index')} className="block">
                                            <Button variant="outline" className="w-full">
                                                Cancel
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}