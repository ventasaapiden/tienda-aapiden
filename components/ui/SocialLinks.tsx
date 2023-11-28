import { Box, IconButton, Grid } from '@mui/material';
import { Facebook, Twitter, Instagram } from '@mui/icons-material';

const SocialLinks = () => {
  return (
    <Grid container spacing={1} justifyContent="flex-end" sx={{pr:2}}>
      {/* Enlace a Facebook */}
      <Grid item>
        <IconButton
          component="a"
          href="https://www.facebook.com/p/Aapiden-100067224017258/?paipv=0&eav=AfbqzUu7enA1XHnRzpKAMJ6nBj46yqrrO0y_qUkMMRO-2ymZlQFwSiNM2vPP1u5tDXA&_rdr"
          target="_blank"
          rel="noopener"
          sx={{color: '#1877F2'}}
        >
          <Facebook />
        </IconButton>
      </Grid>

      {/* Enlace a Twitter */}
      {/* <Grid item>
        <IconButton
          component="a"
          href="https://twitter.com/tu_cuenta_de_twitter"
          target="_blank"
          rel="noopener"
          sx={{color: '#1DA1F2'}}
        >
          <Twitter />
        </IconButton>
      </Grid> */}

      {/* Enlace a Instagram */}
      {/* <Grid item>
        <IconButton
          component="a"
          href="https://www.instagram.com/tu_cuenta_de_instagram"
          target="_blank"
          rel="noopener"
          sx={{color: '#E4405F'}}
        >
          <Instagram />
        </IconButton>
      </Grid> */}
    </Grid>
  );
};

export default SocialLinks;
