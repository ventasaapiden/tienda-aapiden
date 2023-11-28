import { RemoveShoppingCartOutlined } from '@mui/icons-material';
import { Box, Link, Typography } from '@mui/material';
import { ShopLayout } from '../../components/layouts/ShopLayout';
import NextLink from "next/link"
import { useEffect, useState } from 'react';

const EmptyPage = () => {


  return (
    <ShopLayout title='Carrito vacio' pageDescription='No hay articulos en el carrito de compras' overrideStyles={{minWidth: '450px'}}>
      <Box sx={{flexDirection: {xs: 'column', sm: 'row'}}}
           display='flex' justifyContent='center' alignItems='center' minHeight='calc(100vh - 232px)'>
        <RemoveShoppingCartOutlined sx={{fontSize: 100}} />
        <Box display='flex' flexDirection='column' alignItems='center' >
            <Typography>Su carrito esta vacío</Typography>
            <NextLink href='/' passHref>
                <Link underline='none' typography='h6' color='secondary'>
                    Regresar
                </Link>
            </NextLink>
        </Box>
      </Box>
    </ShopLayout>
  )
}

export default EmptyPage