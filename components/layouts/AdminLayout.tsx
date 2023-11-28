import { Box, Grid, Stack, Typography } from "@mui/material";
import Head from "next/head";
import { FC, ReactNode } from "react";
import { AdminNavbar } from "../admin/AdminNavbar";
import { SideMenu } from "../ui/SideMenu";
import SocialLinks from "../ui/SocialLinks";
import Footer from "../ui/Footer";

interface Props {
    children?: ReactNode; 
    title: string;
    subtitle: string;
    icon?: JSX.Element;
    overrideStyles?: any;
}

export const AdminLayout: FC<Props> = ({children, title, subtitle, icon, overrideStyles}) => {
  return (
    <>
        <Head>
            <title>{title}</title>
        </Head>
        <nav>
            <AdminNavbar />
        </nav>

        <SideMenu />

        <main style={{
            margin: '80px auto',
            maxWidth: '1440px',
            padding: '0px 30px',
            minHeight: 'calc(100vh - 232px)',
            minWidth: '450px',
            ...overrideStyles,
        }}>

            <Box display='flex' flexDirection='column'>
                <Typography variant="h1" component='h1'>
                    {icon}
                    {' '} {title}
                </Typography>
                <Typography variant='h2' sx={{mb: 1}}>{subtitle}</Typography>
            </Box>

            <Box className="fadeIn">
                {children}
            </Box>
            
        </main>

        <Footer />

    </>
  )
}
