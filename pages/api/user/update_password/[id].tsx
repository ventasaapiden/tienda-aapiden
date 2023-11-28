import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB, disconnectDB } from '../../../../database/db';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';
import { IUser } from '../../../../interfaces/users';

type Data = 
| {message: string}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    
    switch (req.method) {
        case 'PUT':
            return updatePassword(req, res);
    
        default:
            res.status(400).json({
                message: 'Bad request'
            })
    }

}

const updatePassword = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    
    let { id = '' } = req.query;
    
    const {newPassword = ''} = req.body as {newPassword: string};

    if(newPassword.length < 8){
        return res.status(400).json({message: 'La contraseña debe de ser de al menos 8 caracteres'});
    }

    try{

        await connectDB();

        let oldUser = await User.findById(id);
        
        if (oldUser){

            const salt = bcrypt.genSaltSync();
            const password = bcrypt.hashSync(newPassword, salt);

            const userUpdated = await User.findByIdAndUpdate(
                id,
                {password},
                {new: true}
            );

            await disconnectDB();
            return res.status(200).json({
                message: 'Contraseña actualizada correctamente'
            });
        }else{
            await disconnectDB();
            return res.status(400).json({message: 'El usuario no existe'});
        }

    } catch (error) {
        return res.status(500).json({ message: 'Error actualizando contraseña'});
    }

}
