import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import { MoreHorizontal, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { DaftarHargaFormDialog } from './components/daftar-harga-form-dialog';

interface DaftarHarga {
    id: number;
    kategori: string | null;
    nama_paket: string | null;
    harga: number | null;
    deskripsi: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    daftarHarga: DaftarHarga[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Daftar Harga',
        href: '/management/daftar-harga',
    },
];

export default function DaftarHargaIndex({ daftarHarga }: Props) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [editData, setEditData] = useState<DaftarHarga | null>(null);

    const columns: ColumnDef<DaftarHarga>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
            ),
            enableSorting: false,
            enableHiding: false,
        },

        {
            accessorKey: 'nama_paket',
            header: 'Nama Paket',
            cell: ({ row }) => <div>{row.original.nama_paket || '-'}</div>,
        },
        {
            accessorKey: 'kategori',
            header: 'Kategori',
            cell: ({ row }) => <div>{row.original.kategori || '-'}</div>,
        },
        {
            accessorKey: 'harga',
            header: 'Harga',
            cell: ({ row }) => (
                <div>
                    {row.original.harga ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(row.original.harga) : '-'}
                </div>
            ),
        },
        {
            accessorKey: 'deskripsi',
            header: 'Deskripsi',
            cell: ({ row }) => <div className="max-w-[300px] truncate">{row.original.deskripsi || '-'}</div>,
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const data = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(data)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(data.id)}>
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const table = useReactTable({
        data: daftarHarga,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    const handleAdd = () => {
        setEditData(null);
        setIsFormOpen(true);
    };

    const handleEdit = (data: DaftarHarga) => {
        setEditData(data);
        setIsFormOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            router.delete(route('daftar-harga.destroy', id), {
                onSuccess: () => {
                    toast.success('Data berhasil dihapus.');
                },
                onError: () => {
                    toast.error('Gagal menghapus data.');
                },
            });
        }
    };

    const handleFormSuccess = (action: 'create' | 'update') => {
        if (action === 'create') {
            toast.success('Data berhasil ditambahkan.');
        } else {
            toast.success('Data berhasil diperbarui.');
        }
    };

    const handleFormError = (errors: any) => {
        console.error(errors);
        toast.error('Gagal menyimpan data.');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Harga" />

            <Toaster position="top-right" richColors />

            <div className="p-6">
                <div className="container py-10">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Daftar Harga</h1>
                        <Button onClick={handleAdd}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Data
                        </Button>
                    </div>

                    <div className="rounded-md border">
                        <div className="p-4">
                            <Input
                                placeholder="Filter nama paket..."
                                value={(table.getColumn('nama_paket')?.getFilterValue() as string) ?? ''}
                                onChange={(event) => table.getColumn('nama_paket')?.setFilterValue(event.target.value)}
                                className="max-w-sm"
                            />
                        </div>

                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id}>
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            Tidak ada data.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        <div className="flex items-center justify-end space-x-2 p-4">
                            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                                Previous
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                                Next
                            </Button>
                        </div>
                    </div>

                    <DaftarHargaFormDialog
                        open={isFormOpen}
                        onOpenChange={setIsFormOpen}
                        initialData={editData}
                        onSuccess={handleFormSuccess}
                        onError={handleFormError}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
