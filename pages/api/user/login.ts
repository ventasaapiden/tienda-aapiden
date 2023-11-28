import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB, disconnectDB } from '../../../database/db';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
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
        case 'POST':
            return loginUser(req, res);
    
        default:
            res.status(400).json({
                message: 'Bad request'
            })
    }

}

const loginUser = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    
    const {email = '', password = ''} = req.body;

    try{

        await connectDB();

        const user = await User.findOne({email});

        await disconnectDB();

        if(!user){
            return res.status(400).json({message: 'Correo o contraseña no válidos'});
        }

        if(!bcrypt.compareSync(password, user.password!)){
            return res.status(400).json({message: 'Correo o contraseña no válidos'});
        }

        const {role, name, freeShipping, phone, _id} = user;

        const token = signToken(_id, email);

        return res.status(200).json({
            token,
            user: {
                email, role, name, freeShipping, phone
            }
        });

    } catch (error) {
        return res.status(500).json({ message: 'Error iniciando sesión'});
    }

}
