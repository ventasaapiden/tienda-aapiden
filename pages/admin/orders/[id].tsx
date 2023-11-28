import { Card, CardContent, Grid, Typography, Divider, Chip, Button } from '@mui/material';
import { Box } from '@mui/system';
import { CartList } from '../../../components/cart/CartList';
import { OrderSummary } from '../../../components/cart/OrderSummary';
import { AirplaneTicketOutlined, CreditCardOffOutlined, CreditScoreOutlined } from '@mui/icons-material';
import { GetServerSideProps, NextPage } from 'next'
import { getOrderById } from '../../../database/dbOrders';
import { IOrder } from '../../../interfaces/order';
import { countries } from '../../../utils/countries';
import { AdminLayout } from '../../../components/layouts/AdminLayout';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.js';
import mainApi from '../../../apiFolder/mainApi';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface Props {
    order: IOrder
}

const OrderPage: NextPage<Props> = ({order}) => {
    
    const {shippingAddress} = order;
    const router = useRouter();
    const [orderState, setOrderState] = useState('');

    useEffect(() => {
      setOrderState(order.state);
      //console.log(orderState);
      
    }, [order.state])
    

    const onPayedOrder = async () => {
        try {
            const {data} = await mainApi({
                url: '/admin/orders',
                method: 'PUT',
                data: {id: order._id, state: 'pagada'}
            })

            order.state = 'pagada';
            setOrderState(order.state);
            Swal.fire('Orden actualizada!', 'El estado de la orden ha sido actualizado correctamente!', 'success');
            //router.reload();
        } catch (error: any) {
            Swal.fire('Error actualizando la orden', error.response?.data?.message, 'error');
        }
    }
    const onConfirmPayedOrder = () => {
        Swal.fire({
            title: '¿Está seguro que quiere actualizar el estado de esta orden?',
            text: "¡Si cambia el estado de la orden a Pagada ya no puede volverla a cambiar a Pendiente!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: '¡Sí, actualizar estado!',
            cancelButtonText: 'No, cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    onPayedOrder();
                    
                } catch (error) {
                    //console.log(error);
                    Swal.fire(
                        'Error',
                        'Error cambiando estado de la orden',
                        'error'
                    )
                }
            }
        })
    }

    const onDeliveredOrder = async () => {
        try {
            const {data} = await mainApi({
                url: '/admin/orders',
                method: 'PUT',
                data: {id: order._id, state: 'entregada'}
            })

            order.state = 'entregada';
            setOrderState(order.state);
            Swal.fire('Orden actualizada!', 'El estado de la orden ha sido actualizado correctamente!', 'success');
            //router.reload();
        } catch (error: any) {
            Swal.fire('Error actualizando la orden', error.response?.data?.message, 'error');
        }
    }
    const onConfirmDeliveredOrder = () => {
        Swal.fire({
            title: '¿Está seguro que quiere actualizar el estado de esta orden?',
            text: "¡Si cambia el estado de la orden a Entregada ya no puede volverla a cambiar a Pendiente o Pagada!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: '¡Sí, actualizar estado!',
            cancelButtonText: 'No, cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    onDeliveredOrder();
                } catch (error) {
                    //console.log(error);
                    Swal.fire(
                        'Error',
                        'Error cambiando estado de la orden',
                        'error'
                    )
                }
            }
        })
    }

    const onDeleteOrder = async () => {
        try {
            const {data} = await mainApi({
                url: '/admin/orders',
                method: 'DELETE',
                data: {id: order._id}
            })

            Swal.fire('Orden eliminada!', 'La orden fue eliminada correctamente!', 'success');
            router.push('/admin/orders');
        } catch (error: any) {
            Swal.fire('Error eliminando la orden', error.response?.data?.message, 'error');
        }
    }
    const onConfirmDeleteOrder = () => {
        Swal.fire({
            title: '¿Esta seguro que quiere eliminar esta orden?',
            text: "¡Esta acción no se puede revertir, si se elimina la orden no se puede recuperar!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar!',
            cancelButtonText: 'No, cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    onDeleteOrder();
                } catch (error) {
                    //console.log(error);
                    Swal.fire(
                        'Error',
                        'Error eliminado la orden',
                        'error'
                    )
                }
            }
        })
    }

  return (
    <AdminLayout title='Resumen de orden' subtitle={`Órden ID: ${order._id}`} icon={<AirplaneTicketOutlined />} >

        {
            orderState === 'entregada' ? (
                <Chip sx={{ my: 2 }} label="Orden entregada" variant="outlined" color="success" icon={<CreditScoreOutlined />} />
            ) : orderState === 'pagada' ? (
                <Chip sx={{ my: 2 }} label="Orden pagada" variant="outlined" color="warning" icon={<CreditScoreOutlined />} />
            ) : orderState === 'pendiente' ? (
                <Chip sx={{ my: 2 }} label="Orden pendiente" variant="outlined" color="error" icon={<CreditCardOffOutlined />} />
            ) : null
        }

        <Grid container className='fadeIn' spacing={4}>
            <Grid item xs={11} sm={11} md={6} lg={6} sx={{mt:2}}>
                <CartList products={order.orderItems} />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6} sx={{mt:2}}>
                <Card className='summary-card'>
                    <CardContent>
                        <Typography variant='h2'>Resumen ({order.numberOfItems} {order.numberOfItems > 1 ? 'productos' : 'producto'})</Typography>
                        <Divider sx={{my:1}} />

                        <Box display='flex' justifyContent='space-between'>
                            <Typography variant='subtitle1'>Dirección de facturación / envío</Typography>
                        </Box>

                        
                        <Typography>{shippingAddress.firstName} {shippingAddress.lastName}</Typography>
                        <Typography>{shippingAddress.address}{shippingAddress.address2 ? `, ${shippingAddress.address2}` : ''}</Typography>
                        <Typography>{shippingAddress.province}, {shippingAddress.canton}, {shippingAddress.district}, {shippingAddress.zip}</Typography>
                        <Typography>{countries.find(c => c.code === shippingAddress.country)?.name}</Typography>
                        <Typography>{shippingAddress?.phone}</Typography>

                        <Divider sx={{my:1}} />

                        <OrderSummary order={order} />

                        <Divider sx={{my:1}} />

                        <Box sx={{mt: 0}} display='flex' flexDirection='column'>

                            <Box display='flex' flexDirection='column' justifyContent='center' className='fadeIn'>
                            {
                                orderState === 'entregada' ? (
                                    <Chip sx={{ my: 2 }} label="Orden entregada" variant="outlined" color="success" icon={<CreditScoreOutlined />} />
                                ) : orderState === 'pagada' ? (
                                    <>
                                    <Chip sx={{ my: 2 }} label="Orden pagada" variant="outlined" color="warning" icon={<CreditScoreOutlined />} />
                                    <Divider sx={{my:1}} />
                                    <Box sx={{padding: '10px 20px'}}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Typography variant='h6' component='h6'>Cambiar estado de la orden a Entregada</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography>Puede cambiar el estado de la orden a Entregada si ya fue entregada al comprador.</Typography>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Button color='primary' sx={{backgroundColor: 'secondary.main', "&:hover": {backgroundColor: '#FBD080'}}} className='circular-btn' size='large' fullWidth type='button'
                                                onClick={() => onConfirmDeliveredOrder()}>
                                                    Cambiar estado a Entregada
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                    </>
                                ) : orderState === 'pendiente' ? (
                                    <>
                                    <Chip sx={{ my: 2 }} label="Orden pendiente" variant="outlined" color="error" icon={<CreditCardOffOutlined />} />
                                    <Divider sx={{my:1}} />
                                    <Box sx={{padding: '10px 20px'}}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Typography variant='h6' component='h6'>Cambiar estado de la orden a Pagada</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography>Puede cambiar el estado de la orden a Pagada si ya fue verificado el comprobante de pago.</Typography>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Button color='primary' sx={{backgroundColor: 'secondary.main', "&:hover": {backgroundColor: '#FBD080'}}} className='circular-btn' size='large' fullWidth type='button'
                                                onClick={() => onConfirmPayedOrder()}>
                                                    Cambiar estado a Pagada
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                    <Divider sx={{my:1}} />
                                    <Box sx={{padding: '10px 20px'}}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Typography variant='h6' component='h6'>Eliminar la orden</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography>Puede eliminar esta orden en caso de que el comprador no haya pagado y desee cancelar la orden y reestablecer el inventario de los productos de la orden.</Typography>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Button color='primary' sx={{backgroundColor: 'secondary.main', "&:hover": {backgroundColor: '#FBD080'}}} className='circular-btn' size='large' fullWidth type='button'
                                                onClick={() => onConfirmDeleteOrder()}>
                                                    Eliminar orden
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                    </>
                                ) : null
                            }
                                <>
                                    <Divider sx={{my:1}} />
                                    <Box sx={{padding: '10px 20px'}}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Typography variant='h6' component='h6'>Comprobante: {order.transactionId ? order.transactionId : 'No tiene'}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </>
                            </Box>

                            
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({req, query}) => {
    
    const {id = ''} = query;

    const order = await getOrderById(id.toString());

    if(!order){
        return {
            redirect: {
                destination: '/admin/orders',
                permanent: false
            }
        }
    }

    return {
        props: {
            order
        }
    }
}

export default OrderPage