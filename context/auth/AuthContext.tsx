import { createContext } from "react";
import { IUser } from "../../interfaces/users";

interface ContextProps {
    isLoggedIn: boolean;
    user?: IUser;
    loginUser: (email: string, password: string) => Promise<boolean>;
    updateUser: (user: IUser, password: string) => Promise<boolean>;
    registerUser: (name: string, email: string, phone: string, password: string) => Promise<{hasError: boolean; message?: string;}>;
    logoutUser: () => void;
}

export const AuthContext = createContext({} as ContextProps);