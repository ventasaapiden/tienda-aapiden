import { Card, CardContent, Grid, Typography, Divider, Button, FormLabel, RadioGroup, FormControlLabel, Radio, FormControl, FormHelperText } from '@mui/material';
import { Box } from '@mui/system';
import { CartList } from '../../components/cart/CartList';
import { OrderSummary } from '../../components/cart/OrderSummary';
import { ShopLayout } from '../../components/layouts/ShopLayout';
import { CartContext } from '../../context/cart/CartContext';
import { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { IOrderDeliveryType } from '../../interfaces/order';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import RadioFieldElement from '../../components/ui/RadioFieldElement';

const deliveryTypes = [
    { id: "1", label: `Retiro en las instalaciones de la Asociación. La dirección es: ${process.env.NEXT_PUBLIC_DIRECCION}`, value: "retiro" },
    { id: "2", label: "Envío por correo. Disponible para todo el país.", value: "envio" },
];

type FormData = {
    deliveryType: IOrderDeliveryType,
};

const CartPage = () => {

    const {isLoaded, cart, updateShippingFee} = useContext(CartContext);
    const methods = useForm<FormData>({
        defaultValues: {
            deliveryType: "retiro"
        },
        mode: "onChange"
    });
    const {
        handleSubmit,
        formState: { errors },
        control
    } = methods;

    const router = useRouter();

    // Use watch to subscribe to changes in the deliveryType field
    const deliveryType = useWatch({ control, name: 'deliveryType'});

    useEffect(() => {
        //console.log(deliveryType);
        
        const needsShipping = deliveryType === 'envio' ? true : false;
        updateShippingFee(needsShipping);
    }, [deliveryType]);

    useEffect(() => {
        if(isLoaded && cart.length === 0){
          router.replace('/cart/empty');
        }
    }, [isLoaded, cart, router])

    const onSubmit = async ({deliveryType}: FormData) => {
        //console.log(deliveryType);
        // const needsShipping = deliveryType === 'envio' ? true : false;
        // updateShippingFee(needsShipping);
        router.push('/checkout/address');
    }
    
    if(!isLoaded || cart.length === 0) {
        return (<></>)
    }

  return (
    <ShopLayout title='Carrito' pageDescription='Carrito de compras de la tienda'>
        <Typography variant='h1' component='h1'>Carrito</Typography>
        <Grid container spacing={4}>
            <Grid item xs={11} sm={11} md={6} lg={6} sx={{mt:2}}>
                <CartList editable />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6} sx={{mt:2}}>
                <Card className='summary-card'>
                    <CardContent>
                        <FormProvider {...methods}>
                            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                                <Typography variant='h2'>Orden</Typography>
                                <Divider sx={{my:1}} />

                                <RadioFieldElement name="deliveryType" options={deliveryTypes} title='Tipo de Entrega' />

                                <Divider sx={{my:2}} />
                                <OrderSummary />

                                <Divider sx={{my:2}} />

                                <Box sx={{mt: 3}}>
                                    <Button color='primary' sx={{backgroundColor: 'secondary.main', "&:hover": {backgroundColor: '#FBD080'} }} className='circular-btn' fullWidth type='submit'>
                                        Continuar
                                    </Button>
                                </Box>
                            </form>
                        </FormProvider>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    </ShopLayout>
  )
}

export default CartPage