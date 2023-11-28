import { createContext } from "react";

interface ContextProps {
    isMenuOpen: boolean;
    selectedFilter: string;
    changeSelectedFilter: (value: string) => void;
    toggleMenu: () => void;
}

export const UIContext = createContext({} as ContextProps);