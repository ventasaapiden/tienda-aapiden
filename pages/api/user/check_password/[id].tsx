import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB, disconnectDB } from '../../../../database/db';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';
import { IUser } from '../../../../interfaces/users';

type Data = 
| {message: string}
| {
    user: IUser
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    
    switch (req.method) {
        case 'POST':
            return checkPassword(req, res);
    
        default:
            res.status(400).json({
                message: 'Bad request'
            })
    }

}

const checkPassword = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    
    let { id = '' } = req.query;
    const {oldPassword = ''} = req.body as {oldPassword: string};

    if(oldPassword.length < 8){
        return res.status(400).json({message: 'La contraseña debe de ser de al menos 8 caracteres'});
    }

    try{

        await connectDB();
        const user = await User.findById(id);

        if(!user){
            await disconnectDB();
            return res.status(400).json({message: 'El usuario no existe'});
        }

        const validPassword = bcrypt.compareSync(oldPassword, user.password!);

        if (!validPassword) {
            await disconnectDB();
            return res.status(400).json({message: 'La contraseña antigua no es válida'});
        }

        await disconnectDB();

        delete user.password;
        return res.status(200).json({
            user
        });

    } catch (error) {
        return res.status(500).json({ message: 'Error revisando contraseña'});
    }

}
