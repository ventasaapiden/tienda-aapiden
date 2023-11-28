import { Box, Container, Typography } from '@mui/material';
import type { NextPage } from 'next'
import { ShopLayout } from '../../components/layouts/ShopLayout'
import Image from 'next/image';


const DonationsPage: NextPage = () => {

  const sinpeMobileNumber = process.env.NEXT_PUBLIC_TELEFONO_SINPE_DONACIONES;
  

  return (
    <ShopLayout title={'AAPIDEN - Donaciones'} pageDescription={'Realiza donaciones para apoyar a la Asociación'}>
      {/* <Typography variant='h1' component='h1'>Donaciones</Typography> */}
      {/* <Typography variant='h2' sx={{mb: 1}}>Donaciones que puedes realizar</Typography> */}

      <Box sx={{flexDirection: {xs: 'column', sm: 'column'}}}
           display='flex' justifyContent='center' alignItems='center'>

        <Container maxWidth="sm" sx={{mt:8, mb:5}}> 
          <Box sx={{ mb: 4 }}>
            <Image src="/aapiden_logo.jpg" alt="Logo de AAPIDEN" width={1024} height={506} />
          </Box>
          <Typography variant="h4" align="center" gutterBottom>
            Asociación de Apicultores de la Zona Norte
          </Typography>
        </Container>

        <Typography variant="h4" align="center" gutterBottom  sx={{mt:2, mb:2}}>
          Ayuda a Salvar a las Abejas
        </Typography>

        <Typography variant="subtitle1" align="center" paragraph>
          Donar es sencillo y rápido a través de SINPE Móvil al número <strong>{sinpeMobileNumber}</strong>, una forma segura y eficiente de apoyarnos
        </Typography>

        <Typography variant='h4' component='h6' align="center" sx={{mt:8, mb:2}}>Juntos, protegiendo a los guardianes de la naturaleza</Typography>
        <Typography variant="subtitle1" align="center" paragraph>
          Estamos comprometidos en preservar la vida de nuestras amigas aladas, las abejas, y necesitamos tu ayuda para lograrlo. Cada donación cuenta y nos acerca un paso más a mantener a las abejas a salvo, quienes desempeñan un papel esencial en la polinización y en la salud de nuestro planeta. Cada colón que donas representa una oportunidad para proteger a nuestras queridas abejas. Tu generosidad es lo que nos permite continuar con nuestra labor, preservando la vida de estos incansables polinizadores.
        </Typography>

        <Typography variant="body1" align="center" paragraph sx={{mt:8, mb:2}}>
          AAPIDEN se ubica en territorio de la Reserva de Biosfera Agua y Paz
        </Typography>

      </Box>
      

    </ShopLayout>
  )
}

export default DonationsPage
