import { AttachMoneyOutlined, CreditCardOffOutlined, DashboardOutlined, GroupOutlined, CategoryOutlined, CancelPresentationOutlined, ProductionQuantityLimitsOutlined, AccessTimeOutlined, WorkspacesOutlined, RateReview, LocalShipping } from '@mui/icons-material';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import { SummaryTile } from '../../components/admin/SummaryTile';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import useSWR from 'swr';
import { DashboardSummaryResponse } from '../../interfaces/dashboard';
import { useState, useEffect } from 'react';

const DashboardPage = () => {

    const {data, error} = useSWR<DashboardSummaryResponse>('/api/admin/dashboard', {
        refreshInterval: 30 * 1000 //30 segundos
    });

    const [refreshIn, setRefreshIn] = useState(30);

    useEffect(() => {

        const interval = setInterval(() => {
            setRefreshIn(refreshIn => refreshIn > 0 ? refreshIn - 1 : 30);
        }, 1000);

      return () => clearInterval(interval)
    }, [])
    


    if(!error && !data){
        return <></>
    }

    if(error){
        //console.log(error);
        return <Typography>Error al cargar la informacion</Typography>
    }

    const {
        numberOfOrders,
        paidOrders,
        deliveredOrders,
        notPaidOrders,
        numberOfClients,
        numberOfProductTypes,
        numberOfProducts,
        productsWithNoInventory,
        lowInventory,
        numberOfReviews
    } = data!;

  return (
    <AdminLayout title='Panel' subtitle='Estadísticas generales' icon={<DashboardOutlined />}>
        
        <Grid container spacing={2}>

            <SummaryTile title={numberOfOrders} subtitle="Órdenes totales" icon={ <CreditCardOffOutlined color='primary' sx={{fontSize: 40}} />} />

            <SummaryTile title={deliveredOrders} subtitle="Órdenes entregadas" icon={ <LocalShipping color='success' sx={{fontSize: 40}} />} />

            <SummaryTile title={paidOrders} subtitle="Órdenes pagadas" icon={ <AttachMoneyOutlined color='warning' sx={{fontSize: 40}} />} />
            
            <SummaryTile title={notPaidOrders} subtitle="Órdenes pendientes" icon={ <CreditCardOffOutlined color='error' sx={{fontSize: 40}} />} />

            <SummaryTile title={numberOfClients} subtitle="Clientes" icon={ <GroupOutlined color='success' sx={{fontSize: 40}} />} />

            <SummaryTile title={numberOfProductTypes} subtitle="Tipos de Productos" icon={ <WorkspacesOutlined color='primary' sx={{fontSize: 40}} />} />

            <SummaryTile title={numberOfProducts} subtitle="Productos" icon={ <CategoryOutlined color='primary' sx={{fontSize: 40}} />} />

            <SummaryTile title={lowInventory} subtitle="Bajo inventario (menos de 10)" icon={ <ProductionQuantityLimitsOutlined color='warning' sx={{fontSize: 40}} />} />
            
            <SummaryTile title={productsWithNoInventory} subtitle="Sin existencias" icon={ <CancelPresentationOutlined color='error' sx={{fontSize: 40}} />} />

            <SummaryTile title={numberOfReviews} subtitle="Opiniones" icon={ <RateReview color='success' sx={{fontSize: 40}} />} />

            <SummaryTile title={refreshIn} subtitle="Actualización en:" icon={ <AccessTimeOutlined color='secondary' sx={{fontSize: 40}} />} />

        </Grid>

    </AdminLayout>
  )
}

export default DashboardPage