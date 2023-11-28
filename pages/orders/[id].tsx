import { Card, CardContent, Grid, Typography, Divider, Button, Link, Chip, CircularProgress, TextField, capitalize } from '@mui/material';
import { Box } from '@mui/system';
import { CartList } from '../../components/cart/CartList';
import { OrderSummary } from '../../components/cart/OrderSummary';
import { ShopLayout } from '../../components/layouts/ShopLayout';
import NextLink from "next/link"
import { CreditCardOffOutlined, CreditScoreOutlined } from '@mui/icons-material';
import { GetServerSideProps, NextPage } from 'next'
import { getSession } from 'next-auth/react';
import { getOrderById } from '../../database/dbOrders';
import { IOrder } from '../../interfaces/order';
import { countries } from '../../utils/countries';
import { PayPalButtons } from "@paypal/react-paypal-js";
import mainApi from '../../apiFolder/mainApi';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.js';

interface Props {
    order: IOrder
}

type FormData = {
    transactionId: string,
};

const OrderPage: NextPage<Props> = ({order}) => {
    
    const router = useRouter();
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        defaultValues: {
            transactionId: order.transactionId
        },
    });
    const {shippingAddress} = order;

    const [isPaying, setIsPaying] = useState(false);

    const onSubmit = async ({transactionId}: FormData) => { 
        
        setIsPaying(true);

        try {

            const {data} = await mainApi.post(`/orders/pay`, {
                transactionId,
                orderId: order._id
            });
            setIsPaying(false);
            //reset();
            Swal.fire('Comprobante enviado!', 'El comprobante ha sido enviado. Cuando sea verificado, el estado de la orden será actualizado!', 'success');

            //router.reload();
            
        } catch (error: any) {
            setIsPaying(false);
            //console.log(error);
            Swal.fire('Error enviando el comprobante', error.response?.data?.message, 'error');
        }
    }

  return (
    <ShopLayout title='Resumen de orden' pageDescription='Resumen de la orden' overrideStyles={{ padding: '0px 30px 0px 30px', minWidth: '450px'}}>
        <Typography variant='h1' component='h1'>Orden: {order._id}</Typography>

        {
            order.state === 'entregada' ? (
                <Chip sx={{ my: 2 }} label="Orden entregada" variant="outlined" color="success" icon={<CreditScoreOutlined />} />
            ) : order.state === 'pagada' ? (
                <Chip sx={{ my: 2 }} label="Orden pagada" variant="outlined" color="warning" icon={<CreditScoreOutlined />} />
            ) : order.state === 'pendiente' ? (
                <Chip sx={{ my: 2 }} label="Orden pendiente" variant="outlined" color="error" icon={<CreditCardOffOutlined />} />
            ) : null
        }

        <Grid container className='fadeIn' spacing={5}>
            <Grid item xs={11} sm={11} md={6} lg={6} sx={{mt:2}}>
                <CartList products={order.orderItems} />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6} sx={{mt:2}}>
                <Card className='summary-card'>
                    <CardContent>
                        <Typography variant='h2'>Resumen ({order.numberOfItems} {order.numberOfItems > 1 ? 'productos' : 'producto'})</Typography>
                        <Divider sx={{my:1}} />

                        <Box display='flex' justifyContent='space-between'>
                            <Typography variant='subtitle1'>Tipo de entrega: {capitalize(order.deliveryType)}</Typography>
                        </Box>
                        <Box display='flex' justifyContent='space-between'>
                            <Typography variant='subtitle1'>Dirección de facturación / envío</Typography>
                        </Box>

                        
                        <Typography>{shippingAddress.firstName} {shippingAddress.lastName}</Typography>
                        <Typography>{shippingAddress.address}{shippingAddress.address2 ? `, ${shippingAddress.address2}` : ''}</Typography>
                        <Typography>{shippingAddress?.province}, {shippingAddress?.canton}, {shippingAddress?.district}, {shippingAddress.zip}</Typography>
                        <Typography>{countries.find(c => c.code === shippingAddress.country)?.name}</Typography>
                        <Typography>{shippingAddress?.phone}</Typography>

                        <Divider sx={{my:1}} />

                        <OrderSummary order={order} />

                        <Divider sx={{my:1}} />

                        <Box sx={{mt: 0}} display='flex' flexDirection='column'>

                            <Box display='flex' justifyContent='center' sx={{display: isPaying ? 'flex' : 'none'}}>
                                <CircularProgress />
                            </Box>

                            <Box display='flex' flexDirection='column' justifyContent='center' sx={{display: isPaying ? 'none' : 'flex', flex: 1}}>
                                {
                                    order.state === 'entregada' ? (
                                        <Chip sx={{ my: 2 }} label="Orden entregada" variant="outlined" color="success" icon={<CreditScoreOutlined />} />
                                    ) : order.state === 'pagada' ? (
                                        <Chip sx={{ my: 2 }} label="Orden pagada" variant="outlined" color="warning" icon={<CreditScoreOutlined />} />
                                    ) : order.state === 'pendiente' ? (
                                        <>
                                        <Chip sx={{ my: 2 }} label="Orden pendiente" variant="outlined" color="error" icon={<CreditCardOffOutlined />} />
                                        <Divider sx={{my:1}} />
                                        <Box sx={{padding: '10px 20px'}}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <Typography variant='h6' component='h6'>Método de pago</Typography>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Typography>Por favor, realizar el pago por SINPE Móvil al <strong>{process.env.NEXT_PUBLIC_TELEFONO_SINPE_PAGOS}</strong>. Una vez hecho el pago, ingrese el comprobante para verificarlo.</Typography>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                        
                                        <Divider sx={{my:1}} />
                                        
                                        <form onSubmit={handleSubmit(onSubmit)} noValidate>
                                            <Box sx={{padding: '10px 20px'}}>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12}>
                                                        <Typography variant='h6' component='h6'>Ingresar comprobante</Typography>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <TextField label="Comprobante" type="text" variant='filled' fullWidth {...register('transactionId', {
                                                            required: 'El comprobante es requerido',
                                                        })} error={!!errors.transactionId} helperText={errors.transactionId?.message} />
                                                    </Grid>

                                                    <Grid item xs={12}>
                                                        <Button color='primary' sx={{backgroundColor: 'secondary.main', "&:hover": {backgroundColor: '#FBD080'}}} className='circular-btn' size='large' fullWidth type='submit'>
                                                            Enviar comprobante
                                                        </Button>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        </form>  
                                        </>
                                    ) : null
                                }
                            </Box>

                            
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    </ShopLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({req, query}) => {
    
    const {id = ''} = query;

    const session: any = await getSession({req});

    if(!session){
        return {
            redirect: {
                destination: `/auth/login?p=/orders/${id}`,
                permanent: false
            }
        }
    }

    const order = await getOrderById(id.toString());

    if(!order){
        return {
            redirect: {
                destination: '/orders/history',
                permanent: false
            }
        }
    }

    if(order.user !== session.user._id){
        return {
            redirect: {
                destination: '/orders/history',
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