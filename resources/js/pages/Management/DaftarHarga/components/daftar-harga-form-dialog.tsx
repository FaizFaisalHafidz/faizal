import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

// Define a simpler interface for the form data
interface FormData {
    kategori: string | null;
    nama_paket: string | null;
    harga: string | null;
    deskripsi: string | null;
    [key: string]: any;
}

interface DaftarHarga {
    id: number;
    kategori: string | null;
    nama_paket: string | null;
    harga: number | null;
    deskripsi: string | null;
    created_at: string;
    updated_at: string;
}

interface DaftarHargaFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData: DaftarHarga | null;
    onSuccess?: (action: 'create' | 'update') => void;
    onError?: (errors: any) => void;
}

export function DaftarHargaFormDialog({ 
    open, 
    onOpenChange, 
    initialData,
    onSuccess,
    onError
}: DaftarHargaFormDialogProps) {
    // Initialize the form with Inertia's useForm
    const form = useForm<FormData>({
        kategori: '',
        nama_paket: '',
        harga: '',
        deskripsi: '',
    });

    // Reset form when initialData changes
    useEffect(() => {
        if (open) {
            if (initialData) {
                form.setData({
                    kategori: initialData.kategori || '',
                    nama_paket: initialData.nama_paket || '',
                    harga: initialData.harga ? String(initialData.harga) : '',
                    deskripsi: initialData.deskripsi || '',
                });
            } else {
                form.reset();
                form.clearErrors();
            }
        }
    }, [initialData, open]);

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (initialData) {
            // Update existing data
            form.post(route('daftar-harga.update', initialData.id), {
                onSuccess: () => {
                    onOpenChange(false);
                    onSuccess && onSuccess('update');
                },
                onError: (errors) => {
                    onError && onError(errors);
                },
            });
        } else {
            // Create new data
            form.post(route('daftar-harga.store'), {
                onSuccess: () => {
                    onOpenChange(false);
                    onSuccess && onSuccess('create');
                },
                onError: (errors) => {
                    onError && onError(errors);
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit' : 'Tambah'} Daftar Harga</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="kategori" className="text-sm font-medium">
                            Kategori
                        </label>
                        <select
                            id="kategori"
                            value={form.data.kategori || ''}
                            onChange={e => form.setData('kategori', e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="">Pilih Kategori</option>
                            <option value="cat_body">Cat Body</option>
                            <option value="velg">Velg</option>
                            <option value="kaki_kaki">Kaki Kaki</option>
                        </select>
                        {form.errors.kategori && (
                            <p className="text-sm text-red-500">{form.errors.kategori}</p>
                        )}
                    </div>
                    
                    <div className="space-y-2">
                        <label htmlFor="nama_paket" className="text-sm font-medium">
                            Nama Paket
                        </label>
                        <Input
                            id="nama_paket"
                            value={form.data.nama_paket || ''}
                            onChange={e => form.setData('nama_paket', e.target.value)}
                            placeholder="Masukkan nama paket"
                        />
                        {form.errors.nama_paket && (
                            <p className="text-sm text-red-500">{form.errors.nama_paket}</p>
                        )}
                    </div>
                    
                    <div className="space-y-2">
                        <label htmlFor="harga" className="text-sm font-medium">
                            Harga
                        </label>
                        <Input
                            id="harga"
                            type="number"
                            value={form.data.harga || ''}
                            onChange={e => form.setData('harga', e.target.value)}
                            placeholder="Masukkan harga"
                        />
                        {form.errors.harga && (
                            <p className="text-sm text-red-500">{form.errors.harga}</p>
                        )}
                    </div>
                    
                    <div className="space-y-2">
                        <label htmlFor="deskripsi" className="text-sm font-medium">
                            Deskripsi
                        </label>
                        <Textarea
                            id="deskripsi"
                            value={form.data.deskripsi || ''}
                            onChange={e => form.setData('deskripsi', e.target.value)}
                            placeholder="Masukkan deskripsi paket"
                            rows={4}
                        />
                        {form.errors.deskripsi && (
                            <p className="text-sm text-red-500">{form.errors.deskripsi}</p>
                        )}
                    </div>
                    
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing}
                        >
                            {initialData ? 'Update' : 'Save'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}