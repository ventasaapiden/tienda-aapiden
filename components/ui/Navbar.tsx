import {
  ClearOutlined,
  Home,
  HomeOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  VolunteerActivism,
  VolunteerActivismOutlined,
} from "@mui/icons-material";
import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  IconButton,
  Input,
  InputAdornment,
  Link,
  Toolbar,
  Typography,
} from "@mui/material";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { UIContext } from "../../context/ui/UIContext";
import { CartContext } from "../../context/cart/CartContext";
import Image from "next/image";

export const Navbar = () => {
  const { toggleMenu } = useContext(UIContext);
  const { numberOfItems } = useContext(CartContext);

  const { asPath, push } = useRouter();
  const path1 = "/";
  const path2 = "/category/donations";

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const onSearchTerm = () => {
    if (searchTerm.trim().length === 0) return;

    push(`/search/${searchTerm}`);
  };

  return (
    <AppBar>
      <Toolbar>
        <NextLink href={"/"} passHref>
          <Link display="flex" alignItems="center" underline="none">
            <Image
              src="/aapiden_logo.jpg"
              alt="Logo de AAPIDEN"
              width={101}
              height={50}
            />
            {/* <Typography variant="h6">AAPIDEN</Typography> */}
          </Link>
        </NextLink>

        <Box flex="1" />

        <Box
          className="fadeIn"
          sx={{
            display: isSearchVisible ? "none" : { xs: "none", md: "block" },
          }}
        >
          <NextLink href={path1} passHref>
            <Link underline="none">
              <Button
                size="large"
                startIcon={<HomeOutlined />}
                className={asPath === path1 ? "btn1" : ""}
                color={asPath === path1 ? "primary" : "primary"}
                sx={{
                  backgroundColor: asPath === path1 ? "#F9B63C" : "info.main",
                  "&:hover": {
                    backgroundColor: asPath === path1 ? "#FBD080" : "",
                  },
                }}
              >
                {" "}
                Inicio
              </Button>
            </Link>
          </NextLink>
          <NextLink href={path2} passHref>
            <Link underline="none">
              <Button
                size="large"
                endIcon={<VolunteerActivismOutlined />}
                className={asPath === path2 ? "btn1" : ""}
                color={asPath === path2 ? "primary" : "primary"}
                sx={{
                  backgroundColor: asPath === path2 ? "#F9B63C" : "info.main",
                  "&:hover": {
                    backgroundColor: asPath === path2 ? "#FBD080" : "",
                  },
                }}
              >
                Donaciones
              </Button>
            </Link>
          </NextLink>
        </Box>

        <Box flex="1" />

        {isSearchVisible ? (
          <Input
            sx={{ display: { xs: "none", md: "flex" } }}
            className="fadeIn"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => (e.key === "Enter" ? onSearchTerm() : null)}
            type="text"
            placeholder="Buscar..."
            endAdornment={
              <InputAdornment position="end">
                <IconButton onClick={() => setIsSearchVisible(false)}>
                  <ClearOutlined />
                </IconButton>
              </InputAdornment>
            }
          />
        ) : (
          <IconButton
            sx={{ display: { xs: "none", md: "flex" } }}
            className="fadeIn"
            onClick={() => setIsSearchVisible(true)}
          >
            <SearchOutlined />
          </IconButton>
        )}

        <IconButton
          sx={{ display: { xs: "flex", md: "none" } }}
          onClick={toggleMenu}
        >
          <SearchOutlined />
        </IconButton>

        <NextLink href="/cart" passHref>
          <Link underline="none">
            <IconButton>
              <Badge
                badgeContent={numberOfItems > 9 ? "+9" : numberOfItems}
                color="secondary"
              >
                <ShoppingCartOutlined />
              </Badge>
            </IconButton>
          </Link>
        </NextLink>

        <Button onClick={toggleMenu}>Menú</Button>
      </Toolbar>
    </AppBar>
  );
};
