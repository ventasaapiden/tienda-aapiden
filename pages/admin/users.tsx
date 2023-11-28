import { PeopleOutline } from '@mui/icons-material';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import { Grid, MenuItem, Pagination, Select, Typography } from '@mui/material';
import useSWR from 'swr';
import { IUser } from '../../interfaces/users';
import mainApi from '../../apiFolder/mainApi';
import { useState, useEffect, ChangeEvent, useContext } from 'react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.js';
import { AuthContext } from '../../context/auth/AuthContext';

interface OrderResponse {
    users: IUser[];
    totalItems: number;
    totalPages: number;
}

const UsersPage = () => {

    const {user} = useContext(AuthContext);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 10; // Tamaño de página
    const {data, error, mutate} = useSWR<OrderResponse>(`/api/admin/users?page=${currentPage}&pageSize=${pageSize}`, {
        revalidateOnMount: true, 
    });
    const [users, setUsers] = useState<IUser[]>([]);

    useEffect(() => {
        // if (data) {
        //   mutate(data, false);
        // }
        if(data){
            setUsers(data.users);
        }
    }, [currentPage, data]);
    
    const handlePageChange = (event: ChangeEvent<unknown>, newPage: number) => {
        setCurrentPage(newPage);
    };

    const totalItems = data?.totalItems ?? 0;
    const totalPages = data?.totalPages ?? 0;

    if(!error && !data){
        return (
            <AdminLayout title={`Usuarios`} subtitle='Mantenimiento de usuarios' icon={<PeopleOutline />}>
            </AdminLayout>
        )
    }

    if(error){
        //console.log(error);
        return <Typography>Error al cargar la información</Typography>
    }

    const onRoleChange = async (userId: string, newRole: string) => {

        

        try {
            await mainApi.put('/admin/users', {userId, role: newRole, myUserId: user?._id});
            Swal.fire('Usuario actualizado!', 'El usuario ha sido actualizado correctamente!', 'success');

            const previousUsers = users.map((user) => ({...user}));
            const updatedUsers = users.map((user) => ({
                ...user,
                role: userId === user._id ? newRole : user.role
            }));
            setUsers(updatedUsers);
        } catch (error: any) {
            //console.log(error);
            Swal.fire('Error actualizando el usuario', error.response?.data?.message, 'error');
        } 
    }

    const onFreeShippingChange = async (userId: string, newFreeShipping: string) => {

        

        try {
            await mainApi.put('/admin/users', {userId, freeShipping: newFreeShipping});
            Swal.fire('Usuario actualizado!', 'El usuario ha sido actualizado correctamente!', 'success');

            const previousUsers = users.map((user) => ({...user}));
            const updatedUsers = users.map((user) => ({
                ...user,
                freeShipping: userId === user._id ? (newFreeShipping === 'true') : user.freeShipping
            }));
            setUsers(updatedUsers);
        } catch (error: any) {
            //console.log(error);
            Swal.fire('Error actualizando el usuario', error.response?.data?.message, 'error');
        } 
    }

    const columns: GridColDef[] = [
        {field: 'name', headerName: 'Nombre Completo', width: 300},
        {field: 'email', headerName: 'Correo', width: 250},
        {field: 'phone', headerName: 'Teléfono', width: 200},
        {field: 'role', headerName: 'Rol', width: 250, renderCell: ({row}: GridValueGetterParams) => {

            return (
                <Select value={row.role} label="Rol" onChange={({target}) => onRoleChange(row.id, target.value)} sx={{width: '300px'}}>
                    <MenuItem value='client'>Cliente</MenuItem>
                    <MenuItem value='admin'>Administrador</MenuItem>
                </Select>
            )
        }},
        {field: 'freeShipping', headerName: 'Envío gratis', width: 200, renderCell: ({row}: GridValueGetterParams) => {

            return (
                <Select value={row.freeShipping} label="Envío gratis" onChange={({target}) => onFreeShippingChange(row.id, target.value)} sx={{width: '250px'}}>
                    <MenuItem value='true'>Si</MenuItem>
                    <MenuItem value='false'>No</MenuItem>
                </Select>
            )
        }},
    ];

    const rows = users.map( (user) => ({
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        freeShipping: user.freeShipping,
    }))

    // Componente personalizado para ocultar la paginación por defecto y cambiarla
    const CustomPagination: React.FC = () => (
        <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} />
    );

  return (
    <AdminLayout title={`Usuarios (${data?.totalItems})`} subtitle='Mantenimiento de usuarios' icon={<PeopleOutline />}>

        <Grid container className='fadeIn'>
            <Grid item xs={12} sx={{height: 650, width: '100%'}}>
                <DataGrid rows={rows} columns={columns} components={{ Pagination: CustomPagination }} />
            </Grid>
        </Grid>

    </AdminLayout>
  )
}

export default UsersPage