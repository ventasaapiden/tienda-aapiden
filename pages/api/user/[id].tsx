import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB, disconnectDB } from '../../../database/db';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { isValidEmail } from '../../../utils/validations';
import { getSession } from 'next-auth/react';
import { signToken } from '../../../utils/jwt';

type Data = 
| {message: string}
| {
    token: string;
    user: {
        email: string;
        phone: string;
        role: string;
        name: string;
        freeShipping: boolean;
    }
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    
    switch (req.method) {
        case 'PUT':
            return updateUser(req, res);
    
        default:
            res.status(400).json({
                message: 'Bad request'
            })
    }

}

const updateUser = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    let { id = '' } = req.query;
    
    const {email = '', name = '', phone = '', password = ''} = req.body as {email: string, phone: string, name: string, password: string};

    if(phone.length < 8){
        return res.status(400).json({message: 'El teléfono debe de ser de al menos 8 caracteres'});
    }

    if(name.length < 8){
        return res.status(400).json({message: 'El nombre completo debe de ser de al menos 8 caracteres'});
    }

    if(!isValidEmail(email)){
        return res.status(400).json({message: 'El correo ingresado no tiene un formato válido'});
    }

    try{

        await connectDB();

        let oldUser = await User.findById(id);

        let duplicate = await User.find({_id: { $ne: id}, email});
        
        if(duplicate[0]){
            return res.status(422).json({message: 'El correo ingresado ya esta registrado'});
        }
        
        if (oldUser){

            if(!bcrypt.compareSync(password, oldUser.password!)){
                return res.status(400).json({message: 'Correo o contraseña no válidos'});
            }

            const userUpdated = await User.findByIdAndUpdate(
                id,
                {name, phone, email},
                {new: true}
            );

            await disconnectDB();
            const {role, freeShipping, _id} = oldUser;

            const token = signToken(_id, email);

            return res.status(200).json({
                token,
                user: {
                    email, role, name, freeShipping, phone
                }
            });
        }else{
            await disconnectDB();
            return res.status(400).json({message: 'El usuario no existe'});
        }

    } catch (error) {
        return res.status(500).json({ message: 'Error editando usuario'});
    }

}
