import { createTheme } from '@mui/material/styles';
import { red,  } from '@mui/material/colors';


export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1E1E1E'
    },
    secondary: {
      main: '#F9B63C'
    },
    info: {
      main: '#fff'
    },

  },
  components: {
    MuiLink: {
      defaultProps: {
        underline: 'none',
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        position: 'fixed',
      },
      styleOverrides: {
        root: {
          backgroundColor: 'white',
          height: 60
        },
      }
    },

    MuiTypography: {
      styleOverrides: {
        root: {
          //fontFamily: 'Montserrat, sans-serif', 
        },
        h1: {
          fontSize: 30,
          fontWeight: 600
        },
        h2: {
          fontSize: 20,
          fontWeight: 400
        },
        subtitle1: {
          fontSize: 18,
          fontWeight: 600
        }
      }
    },


    MuiButton: {
      defaultProps: {
        variant: 'contained',
        size: 'small',
        disableElevation: true,
        color: 'info'
      },
      styleOverrides: {
        root: {
          backgroundColor: 'secondary',
          textTransform: 'none',
          boxShadow: 'none',
          borderRadius: 10,
          ":hover": {
            backgroundColor: 'rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease-in-out'
          }
        }
      }
    },


    MuiCard: {
      defaultProps: {
        elevation: 0
      },
      styleOverrides: {
        root: {
          boxShadow: '0px 5px 5px rgba(0,0,0,0.05)',
          borderRadius: '10px',
        }
      }
    },

    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          backgroundColor: '#fff', // Cambia el color de fondo de los TextFields
          '& input:-webkit-autofill': {
            // Cambia el color de fondo del autocompletado
            '-webkit-box-shadow': '0 0 0 100px #f5f5f5 inset', // Cambia el color de fondo predeterminado del autocompletado
            '-webkit-text-fill-color': '#000', // Cambia el color del texto del autocompletado
          },
          '& input::-moz-placeholder': {
            // Cambia el color de fondo del autocompletado para Firefox
            backgroundColor: '#f5f5f5', // Cambia el color de fondo del autocompletado en Firefox
            color: '#000', // Cambia el color del texto del autocompletado en Firefox
            opacity: 1, // Asegura que el texto sea visible en el fondo
          },
        },
      },
    },
    
  }
});
