import { Head, useForm } from '@inertiajs/react';
import gsap from 'gsap';
import { LoaderCircle, Lock, Mail } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    // Animasi dengan GSAP
    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        
        tl.fromTo(
            '.login-title, .login-description', 
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }
        );
        
        tl.fromTo(
            '.form-field', 
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
            '-=0.4'
        );
        
        tl.fromTo(
            '.login-button, .login-footer', 
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
            '-=0.2'
        );
        
        // Highlight status message if exists
        if (status) {
            gsap.fromTo(
                '.status-message',
                { scale: 0.9, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.5, delay: 0.5 }
            );
        }
    }, [status]);

    return (
        <AuthLayout 
            title="Log in to Garasi Armstrong" 
            description="Masuk untuk mengelola layanan repaint motor anda"
        >
            <Head title="Login Garasi Armstrong" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="form-field grid gap-2">
                        <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            Alamat Email
                        </Label>
                        <div className="relative">
                            <Input
                                id="email"
                                type="email"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="email@example.com"
                                className="pl-3 pr-3 py-2 h-11 bg-gray-50 border border-gray-200 focus:ring-2 text-gray-600 focus:ring-offset-1 focus:ring-[#FF4433]/50 focus:border-[#FF4433]"
                            />
                        </div>
                        <InputError message={errors.email} />
                    </div>

                    <div className="form-field grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Lock className="h-4 w-4 text-muted-foreground" />
                                Password
                            </Label>
                            {canResetPassword && (
                                <TextLink 
                                    href={route('password.request')} 
                                    className="ml-auto text-sm text-[#FF4433] hover:text-[#D63626] transition-colors duration-200" 
                                    tabIndex={5}
                                >
                                    Lupa password?
                                </TextLink>
                            )}
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type="password"
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Masukkan password anda"
                                className="pl-3 pr-3 py-2 h-11 bg-gray-50 border text-gray-600 border-gray-200 focus:ring-2 focus:ring-offset-1 focus:ring-[#FF4433]/50 focus:border-[#FF4433]"
                            />
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    <div className="form-field flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                            className="border-gray-300 text-[#FF4433] focus:ring-[#FF4433]/25"
                        />
                        <Label htmlFor="remember" className="text-sm text-gray-700">Ingat saya</Label>
                    </div>

                    <Button 
                        type="submit" 
                        className="login-button mt-6 w-full h-11 bg-gradient-to-r from-[#FF4433] to-[#FF6347] hover:from-[#D63626] hover:to-[#E55A40] text-white font-medium text-base shadow-md transition-all duration-300 hover:shadow-lg" 
                        tabIndex={4} 
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-5 w-5 mr-2 animate-spin" />}
                        {processing ? 'Memproses...' : 'Masuk'}
                    </Button>
                </div>

                {/* <div className="login-footer text-center text-sm text-gray-600">
                    Belum punya akun?{' '}
                    <TextLink 
                        href={route('register')} 
                        tabIndex={5}
                        className="text-[#FF4433] font-medium hover:text-[#D63626] transition-colors duration-200"
                    >
                        Daftar sekarang
                    </TextLink>
                </div> */}
            </form>

            {status && <div className="status-message mt-6 px-4 py-3 rounded-md bg-green-50 text-center text-sm font-medium text-green-600 border border-green-200">{status}</div>}
        </AuthLayout>
    );
}
