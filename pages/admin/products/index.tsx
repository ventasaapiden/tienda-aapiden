import { AddOutlined, CategoryOutlined, WorkspacesOutlined } from '@mui/icons-material';
import { Box, Button, capitalize, CardMedia, Chip, Grid, Link, Pagination, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { AdminLayout } from '../../../components/layouts/AdminLayout'
import useSWR from 'swr';
import { IProduct } from '../../../interfaces/products';
import { currencyFormat } from '../../../utils/currency';
import NextLink from "next/link"
import { ChangeEvent, useEffect, useState } from 'react';
import { IProductType } from '../../../interfaces/productTypes';

const columns: GridColDef[] = [
    {field: 'img', headerName: 'Imagen', renderCell: ({row}: GridValueGetterParams) => {
        return (
            <a href={`/product/${row.slug}`} target="_blank" rel="noreferrer">
                <CardMedia alt={row.title} component="img" className='fadeIn' image={row.img} />
            </a>
        )
    }},
    {field: 'title', headerName: 'Título', width: 400, renderCell: ({row}: GridValueGetterParams) => {
        return (
            <NextLink href={`/admin/products/${row.slug}`} passHref>
                <Link underline='always'>
                    {row.title}
                </Link>
            </NextLink>
        )
    }},
    {field: 'productType', headerName: 'Tipo de producto', width: 250},
    {field: 'inStock', headerName: 'Inventario', width: 150},
    {field: 'price', headerName: 'Precio', width: 150},
    {field: 'weight', headerName: 'Peso (kg)', width: 150},
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
    products: IProduct[];
    totalProducts: number;
    totalPages: number;
}

const ProductsPage = () => {

    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 10; // Tamaño de página
    const { data, error, mutate } = useSWR<OrderResponse>(`/api/admin/products?page=${currentPage}&pageSize=${pageSize}`, {
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

    const totalItems = data?.totalProducts ?? 0;
    const totalPages = data?.totalPages ?? 0;

    if(!error && !data){
        return (
            <AdminLayout title={`Productos`} subtitle='Mantenimiento de productos' icon={<WorkspacesOutlined />}>
            </AdminLayout>
        )
    }

    if(error){
        //console.log(error);
        return <Typography>Error al cargar la información</Typography>
    }

    const rows = data!.products.map( (product) => ({
        id: product._id,
        img: product.images[0],
        title: product.title,
        weight: product.weight + ' kg',
        productType: (product.productType as IProductType).name,
        state: capitalize(product.state),
        inStock: product.inStock,
        price: currencyFormat(product.price),
        slug: product.slug,
    }))

    // Componente personalizado para ocultar la paginación por defecto y cambiarla
    const CustomPagination: React.FC = () => (
        <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} />
    );

  return (
    <AdminLayout title={`Productos (${data?.totalProducts})`} subtitle='Mantenimiento de productos' icon={<WorkspacesOutlined />}>

        <Box display='flex' justifyContent='end' sx={{mb: 2}}>
            <Button startIcon={<AddOutlined />} href="/admin/products/new"
                color='primary' sx={{width: '150px', backgroundColor: 'secondary.main', "&:hover": {backgroundColor: '#FBD080'} }}>
                Crear producto
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

export default ProductsPage