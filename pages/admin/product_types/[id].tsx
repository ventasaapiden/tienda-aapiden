import { FC,  useState } from 'react';
import { GetServerSideProps } from 'next'
import { AdminLayout } from '../../../components/layouts/AdminLayout'
import { DriveFileRenameOutline, SaveOutlined } from '@mui/icons-material';
import { Box, Button, capitalize, Divider, FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import mainApi from '../../../apiFolder/mainApi';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.js';
import { IProductType } from '../../../interfaces/productTypes';
import ProductType from '../../../models/ProductType';
import { getProductTypeById } from '../../../database/dbProductTypes';

const validStates  = ['activo','inactivo']

interface FormData {
    _id?: string;
    name: string;
    tax: number;
    state: string;
}

interface Props {
    productType: IProductType;
}

const ProductTypeAdminPage:FC<Props> = ({ productType }) => {

    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const {register, handleSubmit, formState:{errors}, getValues, setValue, watch} = useForm<FormData>({
        defaultValues: productType
    });

    const onSubmit = async (form: FormData) => {
        
        setIsSaving(true);

        try {
            const {data} = await mainApi({
                url: '/admin/product_types',
                method: form._id ? 'PUT' : 'POST',
                data: form
            })

            //console.log({data});
            
            if(!form._id){
                router.push(`/admin/product_types`);
            }
            setIsSaving(false);

            Swal.fire('Tipo de Producto guardado!', 'El producto ha sido guardado correctamente!', 'success');

        } catch (error: any) {
            //console.log(error);
            setIsSaving(false);
            Swal.fire('Error guardando el tipo de producto', error.response?.data?.message, 'error');
        }
        
    }

    return (
        <AdminLayout 
            title={'Tipo de Producto'} 
            subtitle={`Editando ${ productType.name ? productType.name : '' }`}
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

                <Grid container spacing={2} alignItems="center" justifyContent="center">
                    {/* Data */}
                    <Grid item xs={12} sm={12} md={6}>

                        <TextField
                            label="Nombre"
                            variant="filled"
                            fullWidth 
                            sx={{ mb: 1 }}
                            { ...register('name', {
                                required: 'Este campo es requerido',
                                minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                            })}
                            error={ !!errors.name }
                            helperText={ errors.name?.message }
                        />

                        <TextField
                            label="Impuesto %"
                            type='number'
                            variant="filled"
                            fullWidth 
                            sx={{ mb: 1 }}
                            { ...register('tax', {
                                required: 'Este campo es requerido',
                                minLength: { value: 0, message: 'Mínimo valor: 0' },
                                maxLength: { value: 100, message: 'Maximo valor: 100' }
                            })}
                            error={ !!errors.tax }
                            helperText={ errors.tax?.message }
                        />
                        
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

                </Grid>
            </form>
        </AdminLayout>
    )
}

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time


export const getServerSideProps: GetServerSideProps = async ({ query }) => {
    
    const { id = ''} = query;

    let productType: IProductType | null;

    if(id === 'new'){
        const tempProductType = JSON.parse(JSON.stringify(new ProductType()));
        delete tempProductType._id;
        productType = tempProductType;
    }else{
        productType = await getProductTypeById(id.toString());
    }

    if ( !productType ) {
        return {
            redirect: {
                destination: '/admin/product_types',
                permanent: false,
            }
        }
    }
    

    return {
        props: {
            productType
        }
    }
}


export default ProductTypeAdminPage