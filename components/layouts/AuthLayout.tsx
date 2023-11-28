import { Container } from "@mui/material";
import { Box } from "@mui/system";
import Head from "next/head"
import Image from "next/image";
import { FC, ReactNode } from "react";

interface Props {
    children?: ReactNode; 
    title: string;

}

export const AuthLayout: FC<Props> = ({children, title}) => {
  return (
    <>
        <Head>
            <title>{title}</title>
        </Head>

        <main>
            
            <Box display='flex' justifyContent='center' alignItems='center' sx={{flexDirection: {xs: 'column', sm: 'column'}}} height="calc(100vh - 200px)">
                <Container maxWidth="xs" sx={{mt:5, mb:5}}> 
                    <Image src="/aapiden_logo.jpg" alt="Logo de AAPIDEN" width={512} height={253} />
                </Container>
                {children}
            </Box>
        </main>
    </>
  )
}
