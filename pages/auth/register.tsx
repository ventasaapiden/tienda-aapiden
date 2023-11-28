import { Grid, Typography, TextField, Button, Link, Chip } from '@mui/material';
import { Box } from '@mui/system';
import { AuthLayout } from '../../components/layouts/AuthLayout';
import NextLink from "next/link"
import { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { ErrorOutline } from '@mui/icons-material';
import { isEmail } from '../../utils/validations';
import mainApi from '../../apiFolder/mainApi';
import { useRouter } from 'next/router';
import { AuthContext } from '../../context/auth/AuthContext';
import { getSession, signIn } from 'next-auth/react';
import { GetServerSideProps } from 'next'

type FormData = {
    email: string,
    name: string,
    phone: string,
    password: string,
};

const RegisterPage = () => {

    const router = useRouter();
    const {registerUser} = useContext(AuthContext);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const onRegister = async ({email, password, phone, name}: FormData) => {

        setShowError(false);
        const {hasError, message} = await registerUser(name, email, phone, password);

        if(hasError){
            setShowError(true);
            setErrorMessage(message!);
            setTimeout(() => {
                setShowError(false);
            }, 5000);
            return;
        }
        
        // const destination = router.query.p?.toString() || '/';
        // router.replace(destination);

        await signIn('credentials', {email, password});

    }

  return (
    <AuthLayout title="Ingresar">
        <form onSubmit={handleSubmit(onRegister)} noValidate>
            <Box sx={{width: 350, padding: '10px 20px'}}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant='h1' component='h1'>Crear cuenta</Typography>
                        <Chip label="Error al crear la cuenta" color="error" icon={<ErrorOutline />} className="fadeIn" 
                            sx={{marginTop:1, display: showError ? 'flex' : 'none'}} />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField label="Nombre completo" variant='filled' fullWidth {...register('name', {
                            required: 'El nombre es requerido',
                            minLength: {value: 8, message: 'Mínimo 8 caracteres'}
                        })} error={!!errors.name} helperText={errors.name?.message} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField type='email' label="Correo" variant='filled' fullWidth {...register('email', {
                            required: 'El correo es requerido',
                            validate: isEmail
                        })} error={!!errors.email} helperText={errors.email?.message} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField label="Teléfono" variant='filled' fullWidth {...register('phone', {
                            required: 'El teléfono es requerido',
                            minLength: {value: 8, message: 'Mínimo 8 caracteres'}
                        })} error={!!errors.phone} helperText={errors.phone?.message} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField label="Contraseña" type="password" variant='filled' fullWidth {...register('password', {
                            required: 'La contraseña es requerida',
                            minLength: {value: 8, message: 'Mínimo 8 caracteres'}
                        })} error={!!errors.password} helperText={errors.password?.message} />
                    </Grid>

                    <Grid item xs={12}>
                        <Button color='primary' sx={{backgroundColor: 'secondary.main', "&:hover": {backgroundColor: '#FBD080'}}} className='circular-btn' size='large' fullWidth type='submit'>
                            Crear cuenta
                        </Button>
                    </Grid>

                    <Grid item xs={12} display='flex' justifyContent='end'>
                        <NextLink href={ router.query.p ? `/auth/login?p=${router.query.p}` : `/auth/login`} passHref>
                            <Link underline='always'>
                                ¿Ya tienes cuenta?
                            </Link>
                        </NextLink>
                    </Grid>
                    <Grid item xs={12} display='flex' justifyContent='end'>
                        <NextLink href={ router.query.p ? `/auth/forgot_password?p=${router.query.p}` : `/auth/forgot_password`} passHref>
                            <Link underline='always'>
                                ¿Olvidaste tu contraseña?
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

export default RegisterPage