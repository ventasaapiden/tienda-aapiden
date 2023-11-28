import { Box, Typography } from '@mui/material';
import type { GetServerSideProps, NextPage } from 'next';
import { ShopLayout } from '../components/layouts/ShopLayout';
import { ProductList } from '../components/products/ProductList';
import useSWRInfinite from 'swr/infinite';
import InfiniteScroll from 'react-infinite-scroll-component';
import { IProduct } from '../interfaces/products';
import { FullScreenLoading } from '../components/ui/FullScreenLoading';
import { IProductType } from '../interfaces/productTypes';
import { getAllProductTypes } from '../database/dbProductTypes';
import { FC, useContext, useState } from 'react';
import ProductTypeFilter from '../components/ui/ProductTypeFilter';
import { UIContext } from '../context/ui/UIContext';

const PAGE_SIZE = 12;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Props {
  productTypes: IProductType[];
}

const HomePage:FC<Props> = ({productTypes}) => {
  // const [selectedState, setSelectedState] = useState<string>('todos');
  const {selectedFilter, changeSelectedFilter} = useContext(UIContext);
  const getKey = (pageIndex: number, previousPageData: any) => {
    
    if (previousPageData && !previousPageData.products.length) return null; // reached the end
    return `/api/products?page=${pageIndex + 1}&pageSize=${PAGE_SIZE}&filter=${selectedFilter}`;
  };

  const { data, error, size, setSize } = useSWRInfinite(getKey, fetcher);

  const allProducts = data?.flatMap((page: any) => page.products) || [];

  const handleStateChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    changeSelectedFilter(event.target.value as string);
    // Reiniciar la página al cambiar el filtro
  };

  return (
    <ShopLayout
      title={'AAPIDEN - Inicio'}
      pageDescription={'Encuentra los mejores produtos de AAPIDEN aquí'}
    >
      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant='h1' component='h1'>
          Productos en venta
        </Typography>
        <ProductTypeFilter selectedState={selectedFilter} handleChange={handleStateChange} productTypes={productTypes} />
      </Box>

      {/* <Typography variant='h2' sx={{ mb: 1 }}>
        Todos los productos
      </Typography> */}

      {error ? (
        <div>Error cargando los productos</div>
      ) : (
        <>
          <InfiniteScroll
            dataLength={allProducts.length}
            next={() => setSize(size + 1)}
            hasMore={data! && data[data.length - 1]?.products.length === PAGE_SIZE}
            loader={<FullScreenLoading />}
            endMessage={<h4></h4>}
            scrollThreshold={0.7}
          >
            <ProductList products={allProducts} />
          </InfiniteScroll>
        </>
      )}
    </ShopLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  
  let productTypes: IProductType[] | null = await getAllProductTypes();
  productTypes = [{_id: 'todos', name: 'Todos', tax: 13, state: 'activo'}, ...productTypes!]

  return {
      props: {
          productTypes
      }
  }
}

export default HomePage;
