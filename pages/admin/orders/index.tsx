import { ConfirmationNumberOutlined } from '@mui/icons-material';
import { Chip, Grid, Typography, capitalize, Link, Pagination, Box } from '@mui/material';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { AdminLayout } from '../../../components/layouts/AdminLayout'
import useSWR from 'swr';
import { IOrder, IOrderState } from '../../../interfaces/order';
import { IUser } from '../../../interfaces/users';
import { currencyFormat } from '../../../utils/currency';
import { ChangeEvent, useEffect, useState } from 'react';
import OrderFilter from '../../../components/ui/OrderFilter';
import NextLink from 'next/link';

const columns: GridColDef[] = [
    {field: 'id', headerName: 'Orden ID', width: 250},
    {field: 'email', headerName: 'Correo', width: 250},
    {field: 'name', headerName: 'Nombre Completo', width: 250},
    {field: 'noProducts', headerName: 'Cant. Productos', align: 'center', width: 150},
    {field: 'total', headerName: 'Monto total', width: 150},
    {field: 'deliveryType', headerName: 'Tipo de entrega', width: 150},
    {field: 'createdAt', headerName: 'Creada en', align: 'left', width: 250},
    {field: 'transactionId', headerName: 'Comprobante', align: 'left', width: 300},
    {field: 'paidAt', headerName: 'Comprobante enviado en', align: 'left', width: 250},
    {
        field: 'state',
        headerName: 'Estado',
        width: 150,
        renderCell: ({row}: GridValueGetterParams) => {
            if(row.state === 'Pendiente') return (<Chip variant="outlined" label="Pendiente" color="error" />);
            if(row.state === 'Pagada') return (<Chip variant="outlined" label="Pagada" color="warning" />);
            if(row.state === 'Entregada') return (<Chip variant="outlined" label="Entregada" color="success" />);
        }
    },
    {
        field: 'check',
        headerName: 'Ver orden',
        width: 150,
        renderCell: ({row}: GridValueGetterParams) => {
            return (
                <NextLink href={`/admin/orders/${row.id}`} passHref>
                    <Link underline='always'>
                        {/* <a target="_blank" rel="noreferrer">Ver orden</a> */}
                        Ver orden
                    </Link>
                </NextLink>
            )
        }
    },
];

interface OrderResponse {
    data: IOrder[];
    totalItems: number;
    totalPages: number;
}

const OrdersPage = () => {

    const [selectedState, setSelectedState] = useState<string>('pendiente');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 10; // Tamaño de página
    const { data, error, mutate } = useSWR<OrderResponse>(`/api/admin/orders?state=${selectedState}&page=${currentPage}&pageSize=${pageSize}`, {
        revalidateOnMount: true, 
    });

    useEffect(() => {
    //   if (data) {
    //     mutate(data, false);
    //   }
    }, [selectedState, currentPage, data]);

    const handleStateChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSelectedState(event.target.value as string);
        setCurrentPage(1); // Reiniciar la página al cambiar el estado
    };

    //const {data, error} = useSWR<IOrder[]>('/api/admin/orders');

    const handlePageChange = (event: ChangeEvent<unknown>, newPage: number) => {
        setCurrentPage(newPage);
    };

    const totalItems = data?.totalItems ?? 0;
    const totalPages = data?.totalPages ?? 0;

    if(!error && !data){
        return (
            <AdminLayout title='Órdenes' subtitle='Mantenimiento de órdenes' icon={<ConfirmationNumberOutlined />}>
            </AdminLayout>
          )
    }

    if(error){
        //console.log(error);
        return <Typography>Error al cargar la información</Typography>
    }

    const rows = data!.data.map( (order) => ({
        id: order._id,
        email: (order.user as IUser).email,
        name: (order.user as IUser).name,
        total: currencyFormat(order.total),
        transactionId: order.transactionId ? order.transactionId : "No tiene",
        deliveryType: capitalize(order.deliveryType),
        state: capitalize(order.state),
        noProducts: order.numberOfItems,
        paidAt: order.paidAt ? new Date(order.paidAt!).toLocaleDateString('es-CR', { day: 'numeric',  month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }) : "No ha sido enviado",
        createdAt: new Date(order.createdAt!).toLocaleDateString('es-CR', { day: 'numeric',  month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })
    }))

    // Componente personalizado para ocultar la paginación por defecto y cambiarla
    const CustomPagination: React.FC = () => (
        <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} />
    );

  return (
    <AdminLayout title='Órdenes' subtitle='Mantenimiento de órdenes' icon={<ConfirmationNumberOutlined />}>

        <Grid container className='fadeIn'>
            <Grid item xs={12} sx={{height: 650, width: '100%', mb: 5}}>
                <OrderFilter selectedState={selectedState} handleChange={handleStateChange} />
                <DataGrid rows={rows} columns={columns} components={{ Pagination: CustomPagination }} />
            </Grid>
        </Grid>

    </AdminLayout>
  )
}

export default OrdersPage