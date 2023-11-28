import { Grid, Typography } from '@mui/material';
import { FC, useContext } from 'react';
import { CartContext } from '../../context/cart/CartContext';
import { currencyFormat } from '../../utils/currency';
import { IOrder } from '../../interfaces/order';

interface Props {
    order?: IOrder
}

export const OrderSummary: FC<Props> = ({order}) => {

    let {numberOfItems, subTotal, tax, shippingFee, total} = useContext(CartContext);

    if(order){
        numberOfItems = order.numberOfItems;
        subTotal = order.subTotal;
        tax = order.tax;
        shippingFee = order.shippingFee;
        total = order.total;
    }

  return (
    <Grid container>
        <Grid item xs={6}>
            <Typography>Cant. Productos</Typography>
        </Grid>
        <Grid item xs={6} display='flex' justifyContent='end'>
            <Typography>{numberOfItems} {numberOfItems > 1 ? 'productos':'producto'}</Typography>
        </Grid>

        <Grid item xs={6}>
            <Typography>Subtotal</Typography>
        </Grid>
        <Grid item xs={6} display='flex' justifyContent='end'>
            <Typography>{currencyFormat(subTotal)}</Typography>
        </Grid>

        <Grid item xs={6}>
            <Typography>Impuestos</Typography>
        </Grid>
        <Grid item xs={6} display='flex' justifyContent='end'>
            <Typography>{currencyFormat(tax)}</Typography>
        </Grid>

        <Grid item xs={6}>
            <Typography>Tarifa de envío</Typography>
        </Grid>
        <Grid item xs={6} display='flex' justifyContent='end'>
            <Typography>{currencyFormat(shippingFee)}</Typography>
        </Grid>

        <Grid item xs={6} sx={{mt:2}}>
            <Typography variant='subtitle1'>Total:</Typography>
        </Grid>
        <Grid item xs={6} sx={{mt:2}} display='flex' justifyContent='end'>
            <Typography variant='subtitle1'>{currencyFormat(total)}</Typography>
        </Grid>

    </Grid>
  )
}
