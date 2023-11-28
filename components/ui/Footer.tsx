import { Box, Grid, Stack, Typography } from "@mui/material";
import SocialLinks from "./SocialLinks";

const Footer = () => {
    return (
        <Box component="footer" sx={{ mt: 'auto', minWidth: 450, pt: 2, pb: 2, backgroundColor: '#fff', 
        boxShadow: '0px -3px 5px rgba(0, 0, 0, 0.3)', }}>
            <Grid container spacing={1}>
                <Grid item xs={6} sm={7} md={8} lg={9} xl={9} container alignItems='center'>
                    <Stack direction='row' justifyContent='center' sx={{pl:3}}>
                    <Typography variant="body2">
                        Creado por <a href="https://www.linkedin.com/in/jos%C3%A9-al%C3%AD-r-01004512b/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>José Rivas</a> y <a href="https://www.linkedin.com/in/jarturoquiros/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>Arturo Quirós</a>
                    </Typography>

                    </Stack>
                </Grid>

                <Grid item xs={6} sm={5} md={4} lg={3} xl={3}>
                    <SocialLinks />
                </Grid>
            </Grid>
        </Box>
    );
  };
  
export default Footer;

