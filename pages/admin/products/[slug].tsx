import { ChangeEvent, FC, useEffect, useRef, useState } from 'react';
import { GetServerSideProps } from 'next'
import { AdminLayout } from '../../../components/layouts/AdminLayout'
import { IProduct } from '../../../interfaces/products';
import { DriveFileRenameOutline, SaveOutlined, UploadOutlined } from '@mui/icons-material';
import { getProductBySlug } from '../../../database/dbProducts';
import { Box, Button, capitalize, Card, CardActions, CardContent, CardMedia, Checkbox, Chip, Divider, FormControl, FormControlLabel, FormGroup, FormLabel, Grid, ListItem, Paper, Radio, RadioGroup, Rating, TextField, Typography, Container } from '@mui/material';
import { useForm } from 'react-hook-form';
import mainApi from '../../../apiFolder/mainApi';
import Product from '../../../models/Product';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.js';
import { IProductType } from '../../../interfaces/productTypes';
import { getAllProductTypes } from '../../../database/dbProductTypes';
import ProductType from '../../../models/ProductType';
import useSWRInfinite from 'swr/infinite';
import InfiniteScroll from 'react-infinite-scroll-component';
import { FullScreenLoading } from '../../../components/ui/FullScreenLoading';

const validStates  = ['activo','inactivo'];

interface FormData {
    _id?: string;
    description: string;
    images: string[];
    inStock: number;
    weight: number;
    price: number;
    slug: string;
    tags: string[];
    title: string;
    state: string;
    productType: string | IProductType;
}

interface Props {
    product: IProduct;
    productTypes: IProductType[];
}

const PAGE_SIZE = 10;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ProductAdminPage:FC<Props> = ({ product, productTypes }) => {

    const getKey = (pageIndex: number, previousPageData: any) => {
        if (previousPageData && !previousPageData.reviews.length) return null; // reached the end
        return `/api/reviews?page=${pageIndex + 1}&pageSize=${PAGE_SIZE}&product=${product._id}`;
    };
    const { data, error, size, setSize } = useSWRInfinite(getKey, fetcher);
    const allReviews = data?.flatMap((page: any) => page.reviews) || [];
    const averageRating = data?.flatMap((page: any) => page.averageRating) || [];

    const [newTagValue, setNewTagValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {register, handleSubmit, formState:{errors}, getValues, setValue, watch} = useForm<FormData>({
        defaultValues: product
    });

    useEffect(() => {
      
        const subscription = watch((value, {name, type}) => {
            if(name === 'title'){
                const newSlug = value.title?.trim()
                    .replaceAll(' ', '_')
                    .replaceAll("'", "")
                    .toLocaleLowerCase() || '';

                setValue('slug', newSlug);
            }
        });
    
        return () => {
            subscription.unsubscribe();
        }
    }, [watch, setValue]);
    
    const onNewTag = () => {
        const newTag = newTagValue.trim().toLocaleLowerCase();
        setNewTagValue('');
        const currentTags = getValues('tags');

        if(currentTags.includes(newTag)){
            return;
        }

        currentTags.push(newTag);
    }

    const onDeleteTag = ( tag: string ) => {
        const updatedTags = getValues('tags').filter( t => t !== tag);
        setValue('tags', updatedTags, {shouldValidate: true});
    }

    const onFilesSelected = async ({target}: ChangeEvent<HTMLInputElement>) => {
        if(!target.files || target.files.length === 0){
            return;
        }
        

        try {

            for( const file of target.files ) {
                const formData = new FormData();
                formData.append('file', file);
                const { data } = await mainApi.post<{ message: string}>('/admin/upload', formData);
                //console.log(data.message);
                setValue('images', [...getValues('images'), data.message], {shouldValidate: true})
            }

        } catch (error) {
            //console.log(error);
        }
    }

    const onDeleteImage = (image: string) => {
        setValue('images', getValues('images').filter(img => img !== image), {shouldValidate: true});
    }

    const onSubmit = async (form: FormData) => {
        
        if(form.images.length < 2) return Swal.fire('Error', 'Mínimo 2 imágenes', 'error');

        if(form.productType === '') return Swal.fire('Error', 'Seleccione el tipo de producto', 'error');

        setIsSaving(true);

        try {
            const {data} = await mainApi({
                url: '/admin/products',
                method: form._id ? 'PUT' : 'POST',
                data: form
            })

            //console.log({data});
            
            if(!form._id){
                router.push(`/admin/products`);
            }
            setIsSaving(false);

            Swal.fire('Producto guardado!', 'El producto ha sido guardado correctamente!', 'success');

        } catch (error: any) {
            //console.log(error);
            setIsSaving(false);
            Swal.fire('Error guardando el producto', error.response?.data?.message, 'error');
        }
        
    }

    return (
        <AdminLayout 
            title={'Producto'} 
            subtitle={`Editando ${ product.title }`}
            icon={ <DriveFileRenameOutline /> }
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <Box display='flex' justifyContent='end' sx={{ mb: 1 }}>
                    <Button 
                        color='primary' sx={{width: '150px', backgroundColor: 'secondary.main', "&:hover": {backgroundColor: '#FBD080'} }}
                        startIcon={ <SaveOutlined /> }
                        type="submit"
                        disabled={isSaving}
                        >
                        Guardar
                    </Button>
                </Box>

                <Grid container spacing={2}>
                    {/* Data */}
                    <Grid item xs={12} sm={12} md={6}>

                        <TextField
                            label="Título"
                            variant="filled"
                            fullWidth 
                            sx={{ mb: 1 }}
                            { ...register('title', {
                                required: 'Este campo es requerido',
                                minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                            })}
                            error={ !!errors.title }
                            helperText={ errors.title?.message }
                        />

                        <TextField
                            label="Descripción"
                            variant="filled"
                            fullWidth 
                            multiline
                            sx={{ mb: 1 }}
                            { ...register('description', {
                                required: 'Este campo es requerido',
                            })}
                            error={ !!errors.description }
                            helperText={ errors.description?.message }
                        />

                        {/* <TextField
                            label="Peso (kg)"
                            type='number'
                            variant="filled"
                            fullWidth 
                            sx={{ mb: 1 }}
                            { ...register('weight', {
                                required: 'Este campo es requerido',
                                minLength: { value: 0, message: 'Mínimo de valor cero' }
                            })}
                            error={ !!errors.weight }
                            helperText={ errors.weight?.message }
                        /> */}

                        <TextField
                            label="Peso (kg)"
                            type="text"  // Cambia el tipo a 'text'
                            variant="filled"
                            fullWidth
                            sx={{ mb: 1 }}
                            {...register('weight', {
                                required: 'Este campo es requerido',
                                validate: {
                                isNumeric: (value) => {
                                    // Convierte el valor a una cadena y luego verifica si es un número
                                    const numericValue = parseFloat(value.toString());
                                    if (isNaN(numericValue)) {
                                    return 'Ingrese un valor numérico válido';
                                    }
                                    return true;
                                },
                                minValue: (value) => {
                                    // Verifica si el valor es mayor o igual a cero
                                    const numericValue = parseFloat(value.toString());
                                    if (numericValue < 0) {
                                    return 'Mínimo de valor cero';
                                    }
                                    return true;
                                },
                                },
                            })}
                            error={!!errors.weight}
                            helperText={errors.weight?.message}
                        />



                        <TextField
                            label="Inventario"
                            type='number'
                            variant="filled"
                            fullWidth 
                            sx={{ mb: 1 }}
                            { ...register('inStock', {
                                required: 'Este campo es requerido',
                                minLength: { value: 0, message: 'Mínimo de valor cero' }
                            })}
                            error={ !!errors.inStock }
                            helperText={ errors.inStock?.message }
                        />
                        
                        {/* <TextField
                            label="Precio"
                            type='number'
                            variant="filled"
                            fullWidth 
                            sx={{ mb: 1 }}
                            { ...register('price', {
                                required: 'Este campo es requerido',
                                minLength: { value: 0, message: 'Mínimo de valor cero' }
                            })}
                            error={ !!errors.price }
                            helperText={ errors.price?.message }
                        /> */}

                        <TextField
                            label="Precio"
                            type="text"  // Cambia el tipo a 'text'
                            variant="filled"
                            fullWidth
                            sx={{ mb: 1 }}
                            {...register('price', {
                                required: 'Este campo es requerido',
                                validate: {
                                isNumeric: (value) => {
                                    // Convierte el valor a una cadena y luego verifica si es un número
                                    const numericValue = parseFloat(value.toString());
                                    if (isNaN(numericValue)) {
                                    return 'Ingrese un valor numérico válido';
                                    }
                                    return true;
                                },
                                minValue: (value) => {
                                    // Verifica si el valor es mayor o igual a cero
                                    const numericValue = parseFloat(value.toString());
                                    if (numericValue < 0) {
                                    return 'Mínimo de valor cero';
                                    }
                                    return true;
                                },
                                },
                            })}
                            error={!!errors.price}
                            helperText={errors.price?.message}
                        />

                        <Divider sx={{ my: 1 }} />

                        <FormControl sx={{ mb: 1 }}>
                            <FormLabel>Tipo de producto</FormLabel>
                            <RadioGroup
                                row
                                value={ getValues('productType') }
                                onChange={ ({target}) => setValue('productType', target.value, {shouldValidate: true}) }
                            >
                                {
                                    productTypes.map( ({_id, name}) => (
                                        <FormControlLabel 
                                            key={ _id }
                                            value={ _id }
                                            control={ <Radio color='secondary' /> }
                                            label={ capitalize(name) }
                                        />
                                    ))
                                }
                            </RadioGroup>
                        </FormControl>

                        <Divider sx={{ my: 1 }} />

                        <FormControl sx={{ mb: 1 }}>
                            <FormLabel>Estado</FormLabel>
                            <RadioGroup
                                row
                                value={ getValues('state') }
                                onChange={ ({target}) => setValue('state', target.value, {shouldValidate: true}) }
                            >
                                {
                                    validStates.map( option => (
                                        <FormControlLabel 
                                            key={ option }
                                            value={ option }
                                            control={ <Radio color='secondary' /> }
                                            label={ capitalize(option) }
                                        />
                                    ))
                                }
                            </RadioGroup>
                        </FormControl>

                    </Grid>

                    {/* Tags e imagenes */}
                    <Grid item xs={12} sm={12} md={6}>
                        <TextField
                            label="Slug - URL"
                            variant="filled"
                            fullWidth
                            sx={{ mb: 1 }}
                            { ...register('slug', {
                                required: 'Este campo es requerido',
                                validate: (val) => val.trim().includes(' ') ? "No puede tener espacios en blanco" : undefined,
                            })}
                            error={ !!errors.slug }
                            helperText={ errors.slug?.message }
                        />

                        <TextField
                            label="Etiquetas"
                            variant="filled"
                            fullWidth 
                            sx={{ mb: 1 }}
                            helperText="Presione [barra espaciadora] para agregar"
                            value={newTagValue}
                            onChange={({target}) => setNewTagValue(target.value)}
                            onKeyUp={({code}) => code === 'Space' ? onNewTag() : undefined}
                        />
                        
                        <Box sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            listStyle: 'none',
                            p: 0,
                            m: 0,
                        }}
                        component="ul">
                            {
                                getValues('tags').map((tag) => {

                                return (
                                    <Chip
                                        key={tag}
                                        label={tag}
                                        onDelete={ () => onDeleteTag(tag)}
                                        color="primary"
                                        size='small'
                                        sx={{ ml: 1, mt: 1}}
                                    />
                                );
                            })}
                        </Box>

                        <Divider sx={{ my: 2  }}/>
                        
                        <Box display='flex' flexDirection="column">
                            <FormLabel sx={{ mb:1}}>Imágenes</FormLabel>
                            <Button
                                color='primary' sx={{mb: 3, backgroundColor: 'secondary.main', "&:hover": {backgroundColor: '#FBD080'} }}
                                fullWidth
                                startIcon={ <UploadOutlined /> }
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Cargar imagen
                            </Button>
                            <input ref={fileInputRef} type='file' multiple accept="image/png, image/gif, image/jpeg" style={{display: 'none'}} onChange={onFilesSelected} />

                            <Chip 
                                label="Es necesario al menos 2 imágenes"
                                color='error'
                                variant='outlined'
                                sx={{ mb: 2, display: getValues('images').length < 2 ? 'flex' : 'none' }}
                            />

                            <Grid container spacing={2}>
                                {
                                    getValues('images').map( img => (
                                        <Grid item xs={4} sm={3} key={img}>
                                            <Card>
                                                <CardMedia 
                                                    component='img'
                                                    className='fadeIn'
                                                    image={ img }
                                                    alt={ img }
                                                />
                                                <CardActions>
                                                    <Button fullWidth color='info' sx={{backgroundColor: 'error.main', "&:hover": {backgroundColor: '#B71C1C'} }} onClick={() => onDeleteImage(img)}>
                                                        Eliminar
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    ))
                                }
                            </Grid>

                        </Box>

                    </Grid>

                </Grid>
            </form>

            {error ? (
                <></>
            ) : (
                <>
                <Container maxWidth="md" sx={{ mt: 4 }}>
                  {
                    allReviews.length > 0 && (
                        <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          {/* Contenido a la izquierda: "Promedio de Rating" */}
                          <Typography variant="h6">
                            Puntuación promedio: {averageRating[0].toFixed(2)}
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
                </>
            )}
        </AdminLayout>
    )
}

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time


export const getServerSideProps: GetServerSideProps = async ({ query }) => {
    
    const { slug = ''} = query;

    let product: IProduct | null;

    if(slug === 'new'){
        const tempProduct = JSON.parse(JSON.stringify(new Product()));
        delete tempProduct._id;
        //tempProduct.images = ['1.jpg', '2.jpg'];
        product = tempProduct;
    }else{
        product = await getProductBySlug(slug.toString());
    }

    if ( !product ) {
        return {
            redirect: {
                destination: '/admin/products',
                permanent: false,
            }
        }
    }

    if (typeof product.productType === 'object' && product.productType._id) {
        product.productType = product.productType._id;
    } else {
        product.productType = '';
    }
    
    let productTypes: IProductType[] | null = await getAllProductTypes();

    return {
        props: {
            product,
            productTypes
        }
    }
}


export default ProductAdminPage