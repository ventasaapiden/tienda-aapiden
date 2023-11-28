import { Button, Card, CardContent, Chip, Container, Grid, Rating, TextField, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React, { useEffect } from 'react'
import { ShopLayout } from '../../components/layouts/ShopLayout';
import { ProductSlideshow } from '../../components/products/ProductSlideshow';
import { ItemCounter } from '../../components/ui/ItemCounter';
import { IProduct } from '../../interfaces/products';
import { GetServerSideProps, GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { getAllProductSlugs, getProductBySlug } from '../../database/dbProducts';
import { useState, useContext } from 'react';
import { ICartProduct } from '../../interfaces/cart';
import { useRouter } from 'next/router';
import { CartContext } from '../../context/cart/CartContext';
import { currencyFormat } from '../../utils/currency';
import useSWRInfinite from 'swr/infinite';
import InfiniteScroll from 'react-infinite-scroll-component';
import { FullScreenLoading } from '../../components/ui/FullScreenLoading';
import { AuthContext } from '../../context/auth/AuthContext';
import { useSession } from 'next-auth/react';
import mainApi from '../../apiFolder/mainApi';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.js';

interface Props {
  product: IProduct
}

const PAGE_SIZE = 10;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ProductPage: NextPage<Props> = ({product}) => {

    const session = useSession(); // Obtener el estado de autenticación
    const [review, setReview] = useState({
      rating: 5,
      review: '',
    });

    const getKey = (pageIndex: number, previousPageData: any) => {
        if (previousPageData && !previousPageData.reviews.length) return null; // reached the end
        return `/api/reviews?page=${pageIndex + 1}&pageSize=${PAGE_SIZE}&product=${product._id}`;
    };
    const { data, error, size, setSize, mutate } = useSWRInfinite(getKey, fetcher);
    const [allReviews, setAllReviews] = useState(
      data && Array.isArray(data)
        ? data.flatMap((page: any) => page.reviews)
        : []
    );
    
    const [averageRating, setAverageRating] = useState(
      data && Array.isArray(data)
        ? data.flatMap((page: any) => page.averageRating)
        : 0
    );

    const {user} = useContext(AuthContext);

    const router = useRouter();
    const {addProductToCart} = useContext(CartContext);

    const [tempCartProduct, setTempCartProduct] = useState<ICartProduct>({
      _id: product._id,
      image: product.images[0],
      price: product.price,
      slug: product.slug,
      weight: product.weight,
      productType: product.productType as any,
      title: product.title,
      quantity: 1,
    });

    useEffect(() => {
      if (data && Array.isArray(data)) {
        const reviews = data.flatMap((page: any) => page.reviews) || [];
        const avgRating = data.flatMap((page: any) => page.averageRating) || 0;
        setAllReviews(reviews);
        setAverageRating(avgRating);
      }
    }, [data]);
    
    

    const updateQuantity = (quantity: number) => {
      setTempCartProduct(currentProduct => ({
        ...currentProduct,
        quantity
      }))
      
    }

    const onAddProduct = () => {

      addProductToCart(tempCartProduct);
      router.push('/cart');
      
    }

    const navigateTo = (url: string) => {
      router.push(url);
    }

    // Función para manejar cambios en el formulario de revisión
    const handleReviewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setReview((prevReview) => ({
        ...prevReview,
        [name]: value,
      }));
    };
    

    const handleRatingChange = (newRating: any) => {
      // Actualiza la calificación en el estado de la revisión
      setReview({ ...review, rating: newRating });
    };

    // Función para enviar una nueva revisión
    const submitReview = async () => {

      try {
          const {data} = await mainApi({
              url: '/reviews',
              method: 'POST',
              data: {
                product: product._id,
                rating: review.rating,
                review: review.review,
              }
          })

          data.user = user;    
          const newReviews = allReviews.filter(review => review.user != user?._id && review.product != product._id);
          setAllReviews([data, ...newReviews]);
          // allReviews = allReviews.map((review) => {
          //   if(review._id == data._id) return data;
          //   return review;
          // });

          ////@ts-ignore
          // mutate(`/api/reviews?page=1&pageSize=${PAGE_SIZE}&product=${product._id}`);
          mutate();

          setReview({
            rating: 5,
            review: '',
          });

          Swal.fire('Opinión enviada!', 'Tu opinión ha sido enviada correctamente!', 'success');

      } catch (error: any) {
          //console.log(error);
          Swal.fire('Error enviando la opinión', error.response?.data?.message, 'error');
      }
    };


  return (
    <ShopLayout title={product.title} pageDescription={product.description}>
      <Grid container spacing={3} 
        // sx={{minHeight: 'calc(100vh - 208px)'}}
      >
        <Grid item xs={12} sm={7}>
          <ProductSlideshow images={product.images} />
        </Grid>

        <Grid item xs={12} sm={5}>
          <Box display='flex' flexDirection='column'> 
            <Typography variant='h1' component='h1' sx={{mb: 2 }}>{product.title}</Typography>
            <Typography variant='subtitle1' component='h2' sx={{mb: 1 }}>{currencyFormat(product.price)}</Typography>
            <Typography variant='subtitle1' component='h2' sx={{mb: 1 }}>
              Tipo de producto: {typeof product.productType === 'string' ? 'Tipo Desconocido' : product.productType?.name}
            </Typography>


            <Box sx={{my:2}}>
              <Typography variant='subtitle2'>Cantidad</Typography>
              <ItemCounter
                currentValue={tempCartProduct.quantity}
                updatedQuantity={(value) => updateQuantity(value)}
                maxValue={product.inStock > 10 ? product.inStock : product.inStock}
              />
            </Box>

            {
                (product.inStock > 0) ? (
                  <Button color='primary' sx={{backgroundColor: 'secondary.main', "&:hover": {backgroundColor: '#FBD080'} }} className='circular-btn' onClick={onAddProduct}>
                    Agregar al carrito
                  </Button>
                ) : (
                  <Chip label="No disponible" color="error" variant="outlined" />
                )
            }
            <Box sx={{mt:3}}>
              <Typography variant='subtitle2'>Descripción</Typography>
              <Typography variant='body2'>{product.description}</Typography>
            </Box>
          </Box>
        </Grid>
        {error ? (
            <></>
        ) : (
            <Grid item xs={12} sx={{ml: 3}}>
              
              <Grid container spacing={3}>
                {session.data ? (
                  <Container maxWidth="md" sx={{
                    border: 2, // Establece el grosor del borde a 1 (puedes ajustarlo según tus preferencias).
                    borderColor: 'secondary.main', // Define el color del borde (cambia a tu elección).
                    borderRadius: 2, // Establece la cantidad de redondeo de las esquinas del borde.
                    p: 2, // Agrega un relleno interior para separar el contenido del borde.
                    marginBottom: 2, // Agrega un espacio entre las revisiones.
                    mt:6
                  }}>
                    <Typography variant="h6" component="h6" gutterBottom sx={{mb:2}}>
                      Deja tu opinión del producto
                    </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Rating
                            name="rating"
                            value={review.rating}
                            onChange={(event, newValue) => handleRatingChange(newValue)}
                            size="large"
                            sx={{ marginBottom: 1 }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            name="review"
                            label="Tu Opinión"
                            multiline
                            rows={4}
                            value={review.review}
                            onChange={handleReviewChange}
                            fullWidth
                            sx={{ marginBottom: 2 }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button onClick={submitReview} color='primary' sx={{px: 4, mt: 0, backgroundColor: 'secondary.main', "&:hover": {backgroundColor: '#FBD080'} }} className='circular-btn'>
                            Enviar opinión
                          </Button>
                        </Grid>
                      </Grid>
                  </Container>
                ) : (
                  <Container maxWidth="md" sx={{ mt: 0 }}>
                  <Button
                    variant="text"
                    color='primary' sx={{px: 4, mt: 4, backgroundColor: 'secondary.main', "&:hover": {backgroundColor: '#FBD080'} }} className='circular-btn'
                    onClick={() => navigateTo(`/auth/login?p=${router.asPath}`)}
                  >
                    Inicia sesión para dejar una opinión
                  </Button>
                  </Container>
                )}

                <Container maxWidth="md" sx={{ mt: 4 }}>
                  {
                    allReviews.length > 0 && (
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          {/* Contenido a la izquierda: "Promedio de Rating" */}
                          <Typography variant="h6">
                            Puntuación promedio: {typeof averageRating === 'number' ? averageRating.toFixed(2) : averageRating[0].toFixed(2)}
                          </Typography>
                          {/* Contenido arriba: "Opiniones del producto" */}
                          <Typography variant="h2" sx={{ my: 3 }}>
                            Opiniones del producto:
                          </Typography>
                        </Grid>
                      </Grid>
                    )
                  }
                  <InfiniteScroll
                      dataLength={allReviews.length}
                      next={() => setSize(size + 1)}
                      hasMore={data && data[data.length - 1]?.reviews && data[data.length - 1]?.reviews.length === PAGE_SIZE}
                      loader={<FullScreenLoading />}
                      endMessage={<h4></h4>}
                      scrollThreshold={0.7}
                  >
                      <Box>
                        <Grid container spacing={2}>
                          {allReviews.map((review) => (
                            <Grid item xs={12} key={review._id}>
                              <Card sx={{
                                border: 2, // Establece el grosor del borde a 1 (puedes ajustarlo según tus preferencias).
                                borderColor: 'secondary.main', // Define el color del borde (cambia a tu elección).
                                borderRadius: 2, // Establece la cantidad de redondeo de las esquinas del borde.
                                p: 0, // Agrega un relleno interior para separar el contenido del borde.
                                marginBottom: 2, // Agrega un espacio entre las revisiones.
                              }}>
                                <CardContent>
                                  <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                      <Typography variant="h6" sx={{mb:0}}>{review.user.name}</Typography>
                                      <Typography variant="body2">Fecha: {new Date(review.updatedAt).toLocaleDateString('es-ES')}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={8}>
                                      <Rating name="rating" value={review.rating} readOnly />
                                      <Typography variant="body1" paragraph>
                                        {review.review}
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                  </InfiniteScroll>
                </Container>

              </Grid>

      
            </Grid>
        )}
      </Grid>

      

    </ShopLayout>
  )
}

// export const getStaticPaths: GetStaticPaths = async (ctx) => {

//     const slugs = await getAllProductSlugs();
      
//     //const slugsArray: string[] = slugs.map(({slug}) => slug);

//     return {
//         paths: slugs.map(({slug}) => ({
//             params: {slug}
//         })),
//         // paths: [
//         //     {
//         //         params: {
//         //             id: '1'
//         //         }
//         //     }
//         // ],
//       //fallback: false //Manda al 404 page
//       fallback: 'blocking' //deja pasar si no esta en los 649
//     }
// }

// export const getStaticProps: GetStaticProps = async ({params}) => {

//     const {slug=''} = params as {slug: string};

//     const product = await getProductBySlug(slug);

//     if(!product){
//         return {
//             redirect: {
//                 destination: '/',
//                 permanent: false
//             }
//         }
//     }

//     return {
//       props: {
//         product
//       }, 
//       revalidate: 86400 // 60*60*24 = 86400, revalidar cada 24 horas
//     }
// }

export const getServerSideProps: GetServerSideProps = async ({params}) => {
    
  const {slug=''} = params as {slug: string};

  const product = await getProductBySlug(slug);

  if(!product){
      return {
          redirect: {
              destination: '/',
              permanent: false,
          }
      }
  }

  return {
      props: {
        product
      }
  }
}

export default ProductPage