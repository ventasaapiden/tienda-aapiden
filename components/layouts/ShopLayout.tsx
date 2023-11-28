import Head from "next/head"
import { FC, ReactNode } from "react";
import { Navbar } from "../ui/Navbar";
import { SideMenu } from "../ui/SideMenu";
import { Box, Grid, Stack, Typography } from "@mui/material";
import SocialLinks from "../ui/SocialLinks";
import Footer from "../ui/Footer";

interface Props {
    children?: ReactNode; 
    title: string;
    pageDescription: string;
    imageFullUrl?: string;
    overrideStyles?: any;
}

export const ShopLayout: FC<Props> = ({children, title, pageDescription, imageFullUrl, overrideStyles }) => {
  return (
    <>
        <Head>
            <title>{title}</title>
            <meta name="description" content={pageDescription} />

            <meta name="og:title" content={title} />
            <meta name="og:description" content={pageDescription} />
            {
                imageFullUrl && (
                    <meta name="og:image" content={imageFullUrl} />
                )
            }
        </Head>

        <nav>
            <Navbar />
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
            {children}
        </main>

        <Footer />

    </>
  )
}
