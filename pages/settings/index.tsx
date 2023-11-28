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
import { getProviders, getSession, signIn, useSession } from 'next-auth/react';
import { GetServerSideProps } from 'next'
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.js';
import { ShopLayout } from '../../components/layouts/ShopLayout';
import { IUser } from '../../interfaces/users';
import { Session } from 'inspector';

type FormData = {
    email: string,
    name: string,
    phone: string,
    password: string;
};

type FormData2 = {
    oldPassword: string,
    newPassword: string,
};

const SettingsPage = () => {

    const {user, updateUser} = useContext(AuthContext);
    const router = useRouter();
    const {data:session} = useSession();
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
        defaultValues: {
          name: '',
          email: '',
          phone: '',
        },
    });
    const { register: register2, handleSubmit: handleSubmit2, formState: { errors: errors2 }, reset: reset2 } = useForm<FormData2>();
    const [showError, setShowError] = useState(false);
    const [showError2, setShowError2] = useState(false);

    useEffect(() => {
        // Verifica si el usuario existe y actualiza los valores del formulario si es así
        if (user) {
          setValue('name', user.name);
          setValue('email', user.email);
          setValue('phone', user.phone);
        }
        
      }, [user]);

    const onUpdateUser = async ({email, name, phone, password}: FormData) => {

        setShowError(false);

        try {

            const newUser: any = {...user, email, name, phone};
            const res = updateUser(newUser, password);
            Swal.fire('Usuario actualizado', 'Usuario actualizado correctamente', 'success');
            return;
            
        } catch (error:any) {
            console.log(error);
            Swal.fire('Error actualizando usuario', error.response?.data?.message, 'error');
        }

    }

    const onUpdatePassword = async ({oldPassword, newPassword}: FormData2) => {

        setShowError(false);

        try {

            try {
                await mainApi.post(`/user/check_password/${user?._id}`, {oldPassword});
            } catch (error:any) {
                //console.log(error);
                Swal.fire('Error actualizando contraseña', error.response.data?.message, 'error');
                return false;
            }
 
            await mainApi.put(`/user/update_password/${user?._id}`, {newPassword});
            Swal.fire('Contraseña actualizada', 'La contraseña fue actualizada correctamente', 'success');
            reset2();


        } catch (error:any) {
            //console.log(error);
            Swal.fire('Error actualizando contraseña', error.response.data?.message, 'error');
            return false;
        }

    }

  return (
    <ShopLayout title={'AAPIDEN - Ajustes'} pageDescription={'Ajusta los datos de tu cuenta'}>
        <Grid container direction="column" justifyContent="center" alignItems="center">
            <form onSubmit={handleSubmit(onUpdateUser)} noValidate>
                <Box sx={{width: 350, padding: '10px 20px', my: 5}}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant='h2' component='h2'>Actualizar usuario</Typography>
                            <Chip label="Error al actualizar el usuario" color="error" icon={<ErrorOutline />} className="fadeIn" 
                                sx={{marginTop:1, display: showError ? 'flex' : 'none'}} />
                        </Grid>

                        <Grid item xs={12}>
                        <TextField label="Nombre completo" InputLabelProps={{ shrink: true }} variant='filled' fullWidth {...register('name', {
                                required: 'El nombre es requerido',
                                minLength: {value: 8, message: 'Mínimo 8 caracteres'}
                            })} error={!!errors.name} helperText={errors.name?.message} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField type='email' InputLabelProps={{ shrink: true }} label="Correo" variant='filled' fullWidth {...register('email', {
                                required: 'El correo es requerido',
                                validate: isEmail
                            })} error={!!errors.email} helperText={errors.email?.message} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Teléfono" InputLabelProps={{ shrink: true }} variant='filled' fullWidth {...register('phone', {
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
                                Actualizar usuario
                            </Button>
                        </Grid>

                    </Grid>
                </Box>
            </form>  
            <form onSubmit={handleSubmit2(onUpdatePassword)} noValidate>
                <Box sx={{width: 350, padding: '10px 20px', mb: 5}}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant='h2' component='h2'>Actualizar contraseña</Typography>
                            <Chip label="Error al actualizar la cuenta" color="error" icon={<ErrorOutline />} className="fadeIn" 
                                sx={{marginTop:1, display: showError2 ? 'flex' : 'none'}} />
                        </Grid>

                        <Grid item xs={12}>
                        <TextField label="Antigua Contraseña" type="password" variant='filled' fullWidth {...register2('oldPassword', {
                                required: 'La antigua contraseña es requerida',
                                minLength: {value: 8, message: 'Mínimo 8 caracteres'}
                            })} error={!!errors2.oldPassword} helperText={errors2.oldPassword?.message} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Nueva Contraseña" type="password" variant='filled' fullWidth {...register2('newPassword', {
                                required: 'La nueva contraseña es requerida',
                                minLength: {value: 8, message: 'Mínimo 8 caracteres'}
                            })} error={!!errors2.newPassword} helperText={errors2.newPassword?.message} />
                        </Grid>
                        <Grid item xs={12}>
                            <Button color='primary' sx={{backgroundColor: 'secondary.main', "&:hover": {backgroundColor: '#FBD080'}}} className='circular-btn' size='large' fullWidth type='submit'>
                                Actualizar contraseña
                            </Button>
                        </Grid>

                    </Grid>
                </Box>
            </form>  
        </Grid>
    </ShopLayout>
  )
}

export default SettingsPage