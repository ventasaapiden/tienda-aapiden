import { Box, Divider, Drawer, IconButton, Input, InputAdornment, List, ListItem, ListItemIcon, ListItemText, ListSubheader } from "@mui/material"
import { AccountCircleOutlined, AdminPanelSettings, CategoryOutlined, ConfirmationNumberOutlined, EscalatorWarningOutlined, FemaleOutlined, LoginOutlined, MaleOutlined, SearchOutlined, VpnKeyOutlined, DashboardOutlined, Home, VolunteerActivism, HomeOutlined, VolunteerActivismOutlined, WorkspacesOutlined } from '@mui/icons-material';
import { useContext, useState } from 'react';
import { UIContext } from "../../context/ui/UIContext";
import { useRouter } from "next/router";
import { AuthContext } from '../../context/auth/AuthContext';


export const SideMenu = () => {

    const {isMenuOpen, toggleMenu} = useContext(UIContext);
    const router = useRouter();
    const {user, isLoggedIn, logoutUser} = useContext(AuthContext);

    const [searchTerm, setSearchTerm] = useState('');

    const onSearchTerm = () => {
        if(searchTerm.trim().length === 0) return;

        navigateTo(`/search/${searchTerm}`);
    }

    const navigateTo = (url: string) => {
        router.push(url);
        toggleMenu();
    }

  return (
    <Drawer
        open={ isMenuOpen }
        anchor='right'
        sx={{ backdropFilter: 'blur(4px)', transition: 'all 0.5s ease-out' }}
        onClose={toggleMenu}
    >
        <Box sx={{ width: 250, paddingTop: 5 }}>
            
            <List>

                <ListItem>
                    <Input
                        autoFocus
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' ? onSearchTerm() : null}
                        type='text'
                        placeholder="Buscar..."
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={onSearchTerm}
                                >
                                 <SearchOutlined />
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                </ListItem>

                <ListItem button sx={{ display: { xs: '', md: 'none' } }} onClick={() => navigateTo('/')}>
                    <ListItemIcon>
                        <HomeOutlined />
                    </ListItemIcon>
                    <ListItemText primary={'Inicio'} />
                </ListItem>

                <ListItem button sx={{ display: { xs: '', md: 'none' } }} onClick={() => navigateTo('/category/donations')}>
                    <ListItemIcon>
                        <VolunteerActivismOutlined/>
                    </ListItemIcon>
                    <ListItemText primary={'Donaciones'} />
                </ListItem>

                {
                    isLoggedIn && (
                        <>
                            <ListItem button onClick={() => navigateTo('/settings')}>
                                <ListItemIcon>
                                    <AccountCircleOutlined/>
                                </ListItemIcon>
                                <ListItemText primary={'Ajustes'} />
                            </ListItem>

                            <ListItem button onClick={() => navigateTo('/orders/history')}>
                                <ListItemIcon>
                                    <ConfirmationNumberOutlined/>
                                </ListItemIcon>
                                <ListItemText primary={'Mis Órdenes'} />
                            </ListItem>
                        </>
                    )
                }

                {
                    !isLoggedIn ? (
                        <ListItem button onClick={() => navigateTo(`/auth/login?p=${router.asPath}`)}>
                            <ListItemIcon>
                                <VpnKeyOutlined/>
                            </ListItemIcon>
                            <ListItemText primary={'Ingresar'} />
                        </ListItem>
                    ) : (
                        <ListItem button onClick={logoutUser}>
                            <ListItemIcon>
                                <LoginOutlined/>
                            </ListItemIcon>
                            <ListItemText primary={'Salir'} />
                        </ListItem>
                    )
                }

                

                


                {/* Admin */}

                {
                    user?.role === 'admin' && (
                        <>
                            <Divider />
                            <ListSubheader>Panel de Administrador</ListSubheader>

                            <ListItem button onClick={() => navigateTo('/admin')}>
                                <ListItemIcon>
                                    <DashboardOutlined />
                                </ListItemIcon>
                                <ListItemText primary={'Panel'} />
                            </ListItem>
                            <ListItem button onClick={() => navigateTo('/admin/product_types')}>
                                <ListItemIcon>
                                    <CategoryOutlined />
                                </ListItemIcon>
                                <ListItemText primary={'Tipos de Productos'} />
                            </ListItem>
                            <ListItem button onClick={() => navigateTo('/admin/products')}>
                                <ListItemIcon>
                                    <WorkspacesOutlined />
                                </ListItemIcon>
                                <ListItemText primary={'Productos'} />
                            </ListItem>
                            <ListItem button onClick={() => navigateTo('/admin/orders')}>
                                <ListItemIcon>
                                    <ConfirmationNumberOutlined />
                                </ListItemIcon>
                                <ListItemText primary={'Órdenes'} />
                            </ListItem>

                            <ListItem button onClick={() => navigateTo('/admin/users')}>
                                <ListItemIcon>
                                    <AdminPanelSettings />
                                </ListItemIcon>
                                <ListItemText primary={'Usuarios'} />
                            </ListItem>
                        </>
                    )
                }

                
            </List>
        </Box>
    </Drawer>
  )
}