import { Grid, Typography, TextField, Button, Link, Chip, Divider } from '@mui/material';
import { Box } from '@mui/system';
import { AuthLayout } from '../../components/layouts/AuthLayout';
import NextLink from "next/link"
import { useForm } from 'react-hook-form';
import { isEmail } from '../../utils/validations';
import mainApi from '../../apiFolder/mainApi';
import { ErrorOutline } from '@mui/icons-material';
import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/auth/AuthContext';
import { useRouter } from 'next/router';
import { getProviders, getSession, signIn } from 'next-auth/react';
import { GetServerSideProps } from 'next'
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.js';

type FormData = {
    email: string,
};

const ForgotPasswordPage = () => {

    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
    const [showError, setShowError] = useState(false);

    const onSubmit = async ({email}: FormData) => {

        setShowError(false);

        try {
        
            const {data} = await mainApi.post('/user/forgot_password', {email});

            Swal.fire('Nueva contraseña enviada', 'Tu nueva contraseña fue enviada a tu correo', 'success');
            router.push('/auth/login');

        } catch (error:any) {
            //console.log(error);
            Swal.fire('Error enviando contraseña', error.response?.data?.message, 'error');
        }

    }

  return (
    <AuthLayout title="Olvidé mi contraseña">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Box sx={{width: 350, padding: '10px 20px'}}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant='h2' component='h2'>¿Olvidaste tu contraseña?</Typography>
                        <Typography sx={{my: 1}}>No hay problema, solo ingresa tu correo y te enviaremos una contraseña nueva.</Typography>
                        <Chip label="No reconocemos ese correo" color="error" icon={<ErrorOutline />} className="fadeIn" 
                            sx={{marginTop:1, display: showError ? 'flex' : 'none'}} />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField type='email' label="Correo" variant='filled' fullWidth {...register('email', {
                            required: 'El correo es requerido',
                            validate: isEmail
                        })} error={!!errors.email} helperText={errors.email?.message} />
                    </Grid>
                    <Grid item xs={12}>
                        <Button color='primary' sx={{backgroundColor: 'secondary.main', "&:hover": {backgroundColor: '#FBD080'}}} className='circular-btn' size='large' fullWidth type='submit'>
                            Enviar nueva contraseña
                        </Button>
                    </Grid>

                    <Grid item xs={12} display='flex' justifyContent='end'>
                        <NextLink href={ router.query.p ? `/auth/register?p=${router.query.p}` : `/auth/register`} passHref>
                            <Link underline='always'>
                                ¿No tienes cuenta aún?
                            </Link>
                        </NextLink>
                    </Grid>
                    <Grid item xs={12} display='flex' justifyContent='end'>
                        <NextLink href={ router.query.p ? `/auth/login?p=${router.query.p}` : `/auth/login`} passHref>
                            <Link underline='always'>
                                ¿Ya tienes cuenta?
                            </Link>
                        </NextLink>
                    </Grid>
                    
                </Grid>
            </Box>
        </form>  
    </AuthLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({req, query}) => {
     
    const session = await getSession({req});

    const {p = '/'} = query;

    if(session){
        return {
            redirect: {
                destination: p.toString(),
                permanent: false
            }
        }
    }

    return {
        props: {
            
        }
    }
}

export default ForgotPasswordPage