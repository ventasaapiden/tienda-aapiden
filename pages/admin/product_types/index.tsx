import { AddOutlined, CategoryOutlined } from '@mui/icons-material';
import { Box, Button, capitalize, CardMedia, Chip, Grid, Link, Pagination, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { AdminLayout } from '../../../components/layouts/AdminLayout'
import useSWR from 'swr';
import NextLink from "next/link"
import { ChangeEvent, useEffect, useState } from 'react';
import { IProductType } from '../../../interfaces/productTypes';

const columns: GridColDef[] = [
    {field: 'name', headerName: 'Nombre', width: 250, renderCell: ({row}: GridValueGetterParams) => {
        return (
            <NextLink href={`/admin/product_types/${row.id}`} passHref>
                <Link underline='always'>
                    {row.name}
                </Link>
            </NextLink>
        )
    }},
    {field: 'tax', headerName: 'Impuesto %', width: 150},
    {
        field: 'state',
        headerName: 'Estado',
        width: 150,
        renderCell: ({row}: GridValueGetterParams) => {
            if(row.state === 'Inactivo') return (<Chip variant="outlined" label="Inactivo" color="error" />);
            if(row.state === 'Activo') return (<Chip variant="outlined" label="Activo" color="success" />);

        }
    },
];

interface OrderResponse {
    productTypes: IProductType[];
    totalProductTypes: number;
    totalPages: number;
}

const ProductTypesPage = () => {

    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 10; // Tamaño de página
    const { data, error, mutate } = useSWR<OrderResponse>(`/api/admin/product_types?page=${currentPage}&pageSize=${pageSize}`, {
        revalidateOnMount: true, 
    });

    useEffect(() => {
        // if (data) {
        //   mutate(data, false);
        // }
    }, [currentPage, data]);

    const handlePageChange = (event: ChangeEvent<unknown>, newPage: number) => {
        setCurrentPage(newPage);
    };

    const totalItems = data?.totalProductTypes ?? 0;
    const totalPages = data?.totalPages ?? 0;

    if(!error && !data){
        return (
            <AdminLayout title={`Tipos de Productos`} subtitle='Mantenimiento de tipos de productos' icon={<CategoryOutlined />}>
            </AdminLayout>
        )
    }

    if(error){
        //console.log(error);
        return <Typography>Error al cargar la información</Typography>
    }

    const rows = data!.productTypes.map( (productType) => ({
        id: productType._id,
        name: productType.name,
        state: capitalize(productType.state),
        tax: productType.tax,
    }))

    // Componente personalizado para ocultar la paginación por defecto y cambiarla
    const CustomPagination: React.FC = () => (
        <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} />
    );

  return (
    <AdminLayout title={`Tipos de Productos (${data?.totalProductTypes})`} subtitle='Mantenimiento de tipos de  productos' icon={<CategoryOutlined />}>

        <Box display='flex' justifyContent='end' sx={{mb: 2}}>
            <Button startIcon={<AddOutlined />} href="/admin/product_types/new"
                color='primary' sx={{width: '250px', backgroundColor: 'secondary.main', "&:hover": {backgroundColor: '#FBD080'} }}>
                Crear tipo de producto
            </Button>
        </Box>

        <Grid container className='fadeIn'>
            <Grid item xs={12} sx={{height: 650, width: '100%'}}>
            <DataGrid rows={rows} columns={columns} components={{ Pagination: CustomPagination }} />
            </Grid>
        </Grid>

    </AdminLayout>
  )
}

export default ProductTypesPage