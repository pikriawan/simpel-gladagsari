import { Head } from '@inertiajs/react';
import { userManager } from '@/routes';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ShieldCheck, SquarePen, Trash } from 'lucide-react';

export default function UserManager({ users }) {
    console.log(users);

    return (
        <>
            <Head title='Users' />
            <div className='flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4'>
                <div className='flex'>
                    <Button>Tambah pegawai baru</Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Pegawai</TableHead>
                            <TableHead>NIP</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className='text-right'>Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.nip}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>{user.status}</TableCell>
                                <TableCell className='flex gap-2 justify-end'>
                                    <Button variant='outline' size='icon'>
                                        <ShieldCheck />
                                    </Button>
                                    <Button variant='outline' size='icon'>
                                        <SquarePen />
                                    </Button>
                                    <Button variant='outline' size='icon'>
                                        <Trash stroke='#FF2400' />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}

UserManager.layout = {
    breadcrumbs: [
        {
            title: 'User Manager',
            href: userManager(),
        },
    ],
};
