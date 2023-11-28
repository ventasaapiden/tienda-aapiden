import { AppBar, Box, Button,  Container,  Link, Toolbar, Typography } from "@mui/material"
import NextLink from "next/link"
import { useContext } from 'react';
import { UIContext } from "../../context/ui/UIContext";
import Image from "next/image";

export const AdminNavbar = () => {

    const {toggleMenu} = useContext(UIContext);



  return (
    <AppBar>
        <Toolbar>
            <NextLink href={'/'} passHref>
                <Link display='flex' alignItems='center' underline="none">
                    <Image src="/aapiden_logo.jpg" alt="Logo de AAPIDEN" width={101} height={50} />
                    {/* <Typography variant="h6">AAPIDEN</Typography> */}
                </Link>
            </NextLink>

            <Box flex='1' />
            

            <Button onClick={toggleMenu}>Menu</Button>

        </Toolbar>
    </AppBar>
  )
}
