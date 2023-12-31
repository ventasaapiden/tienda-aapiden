import { Typography, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { ShopLayout } from "../../components/layouts/ShopLayout"
import { Box } from '@mui/system';
import { GetServerSideProps } from 'next'
import { isValidToken } from '../../utils/jwt';
import { countries } from '../../utils/countries';
import { useForm } from 'react-hook-form';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { CartContext } from '../../context/cart/CartContext';

type FormData = {
    firstName: string;
    lastName: string;
    address: string;
    address2?: string;
    zip: string;
    district: string;
    canton: string;
    province: string;
    country: string;
    phone: string;
}

const getAddressFromCookies = ():FormData => {
    return {
        firstName: Cookies.get('firstName') || '',
        lastName: Cookies.get('lastName') || '',
        address: Cookies.get('address') || '',
        address2: Cookies.get('address2') || '',
        zip: Cookies.get('zip') || '',
        district: Cookies.get('district') || '',
        canton: Cookies.get('canton') || '',
        province: Cookies.get('province') || '',
        country: Cookies.get('country') || countries[0].code,
        phone: Cookies.get('phone') || '',
    }
}

const AddressPage = () => {

    const router = useRouter();

    const {updateAddress} = useContext(CartContext);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        defaultValues: getAddressFromCookies()
    });

    const onSubmitAddress = (data: FormData) => {

        updateAddress(data);
        router.push('/checkout/summary');
    }

  return (
    <ShopLayout title="Dirección" pageDescription="Confirmar dirección del destino">

        <form onSubmit={handleSubmit(onSubmitAddress)}>

            <Typography variant="h1" component='h1'>Dirección de Facturación / Envío</Typography>

            <Grid container spacing={2} sx={{mt: 1}}>
                <Grid item xs={12} sm={12} md={6}>
                    <TextField label="Nombre" variant='filled' fullWidth {...register('firstName', {
                                required: 'Este campo es requerido',
                            })} error={!!errors.firstName} helperText={errors.firstName?.message} />
                </Grid>
                <Grid item xs={12} sm={12} md={6}>
                    <TextField label="Apellidos" variant='filled' fullWidth {...register('lastName', {
                                required: 'Este campo es requerido',
                            })} error={!!errors.lastName} helperText={errors.lastName?.message}  />
                </Grid>

                <Grid item xs={12} sm={12} md={6}>
                    <TextField label="Dirección" variant='filled' fullWidth {...register('address', {
                                required: 'Este campo es requerido',
                            })} error={!!errors.address} helperText={errors.address?.message} />
                </Grid>
                <Grid item xs={12} sm={12} md={6}>
                    <TextField label="Dirección 2 (opcional)" variant='filled' fullWidth {...register('address2' )} />
                </Grid>

                
                <Grid item xs={12} sm={12} md={6}>
                    <FormControl fullWidth>
                        <TextField key={Cookies.get('country') || countries[0].code} select variant='filled' label="País" defaultValue={Cookies.get('country') || countries[0].code} {...register('country', {
                                required: 'Este campo es requerido',
                            })} error={!!errors.country} >
                            {
                                countries.map(({code, name}) => (
                                    <MenuItem key={code} value={code}>{name}</MenuItem>
                                ))
                            }
                        </TextField>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={12} md={6}>
                    <TextField label="Provincia" variant='filled' fullWidth {...register('province', {
                                required: 'Este campo es requerido',
                            })} error={!!errors.province} helperText={errors.province?.message} />
                </Grid>
                <Grid item xs={12} sm={12} md={6}>
                    <TextField label="Cantón" variant='filled' fullWidth {...register('canton', {
                                required: 'Este campo es requerido',
                            })} error={!!errors.canton} helperText={errors.canton?.message} />
                </Grid>
                <Grid item xs={12} sm={12} md={6}>
                    <TextField label="Distrito" variant='filled' fullWidth {...register('district', {
                                required: 'Este campo es requerido',
                            })} error={!!errors.district} helperText={errors.district?.message} />
                </Grid>

                <Grid item xs={12} sm={12} md={6}>
                    <TextField label="Código Postal" variant='filled' fullWidth {...register('zip', {
                                required: 'Este campo es requerido',
                            })} error={!!errors.zip} helperText={errors.zip?.message} />
                </Grid>
                <Grid item xs={12} sm={12} md={6}>
                    <TextField label="Teléfono" variant='filled' fullWidth {...register('phone', {
                                required: 'Este campo es requerido',
                            })} error={!!errors.phone} helperText={errors.phone?.message} />
                </Grid>
            </Grid>

            <Box sx={{mt: 5}} display='flex' justifyContent='center'>
                <Button color='primary' sx={{px: 2, py: 1, backgroundColor: 'secondary.main', "&:hover": {backgroundColor: '#FBD080'}}}  className="circular-btn" type='submit'>
                    Revisar pedido
                </Button>
            </Box>

        </form>
    </ShopLayout>
  )
}



// export const getServerSideProps: GetServerSideProps = async ({req}) => {

//     const {token = ''} = req.cookies;
//     let isTokenValid = false;

//     try {
//         await isValidToken(token);
//         isTokenValid = true;
//     } catch (error) {
//         isTokenValid = false;
//     }

//     if(!isTokenValid){
//         return {
//             redirect: {
//                 destination: '/auth/login?p=/checkout/address',
//                 permanent: false,
//             }
//         }
//     }

//     return {
//         props: {
            
//         }
//     }
// }

export default AddressPage