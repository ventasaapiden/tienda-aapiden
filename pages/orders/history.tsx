import { Typography, Grid, Chip, Link, capitalize, Pagination } from '@mui/material';
import { ShopLayout } from '../../components/layouts/ShopLayout';
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import NextLink from "next/link"
import { GetServerSideProps, NextPage } from 'next'
import { getSession } from 'next-auth/react';
import { getOrdersByUser } from '../../database/dbOrders';
import { IOrder, IOrderState } from '../../interfaces/order';
import { currencyFormat } from '../../utils/currency';
import OrderFilter from '../../components/ui/OrderFilter';
import { ChangeEvent, useEffect, useState } from 'react';
import useSWR from 'swr';

const columns: GridColDef[] = [
    {field: 'id', headerName: 'ID', width: 250},
    {field: 'fullname', headerName: 'Nombre Completo', width: 250},
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
        field: 'orden',
        headerName: 'Ver orden',
        width: 150,
        sortable: false,
        renderCell: (params: GridValueGetterParams) => {
            return (
                <NextLink href={`/orders/${params.row.orderId}`} passHref>
                    <Link underline='always'>
                        Ver orden
                    </Link>
                </NextLink>
            )
        }
    },
]

interface Props {
    //orders: IOrder[],
    userId: string,
}

interface OrderResponse {
    data: IOrder[];
    totalItems: number;
    totalPages: number;
}

const HistoryPage: NextPage<Props> = ({userId}) => {

    const [selectedState, setSelectedState] = useState<string>('todas');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 10; // Tamaño de página
    const { data, error, mutate } = useSWR<OrderResponse>(`/api/orders?userId=${userId}&state=${selectedState}&page=${currentPage}&pageSize=${pageSize}`, {
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
            <ShopLayout title='Historial de órdenes' pageDescription='Historial de órdenes del cliente'>
            </ShopLayout>
        )
    }

    if(error){
        //console.log(error);
        return <Typography>Error al cargar la información</Typography>
    }

    const rows = data!.data.map((order, index) => {
        return {
            // id: index+1, 
            id: order._id,
            total: currencyFormat(order.total),
            transactionId: order.transactionId ? order.transactionId : "No tiene",
            deliveryType: capitalize(order.deliveryType),
            state: capitalize(order.state),
            paidAt: order.paidAt ? new Date(order.paidAt!).toLocaleDateString('es-CR', { day: 'numeric',  month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }) : "No ha sido enviado",
            noProducts: order.numberOfItems,
            fullname: order.shippingAddress.firstName + " " + order.shippingAddress.lastName, orderId: order._id,
            createdAt: new Date(order.createdAt!).toLocaleDateString('es-CR', { day: 'numeric',  month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })
        }
    })
    
    // Componente personalizado para ocultar la paginación por defecto y cambiarla
    const CustomPagination: React.FC = () => (
        <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} />
    );

  return (
    <ShopLayout title='Historial de ordenes' pageDescription='Historial de ordenes del cliente'>
        <Typography variant='h1' component='h1'>Historial de órdenes</Typography>

        <Grid container className='fadeIn' sx={{mt:1}}>
            <Grid item xs={12} sx={{height: 650, width: '100%', mb: 5}}>
                <OrderFilter selectedState={selectedState} handleChange={handleStateChange} />
                <DataGrid rows={rows} columns={columns} components={{ Pagination: CustomPagination }} />
            </Grid>
        </Grid>

    </ShopLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({req}) => {
    
    const session: any = await getSession({req});

    if(!session){
        return {
            redirect: {
                destination: '/auth/login?p=/orders/history',
                permanent: false
            }
        }
    }

    //const orders = await getOrdersByUser(session.user._id, 'todas');

    return {
        props: {
            //orders,
            userId: session.user._id
        }
    }
}

export default HistoryPage