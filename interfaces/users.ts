export interface IUser {
    _id: string;
    name: string;
    email: string;
    phone: string;
    password?: string;
    role: string;
    freeShipping: boolean;

    createdAt?: string;
    updatedAt?: string;
}