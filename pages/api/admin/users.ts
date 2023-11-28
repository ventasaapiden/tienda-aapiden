import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB, disconnectDB } from '../../../database/db';
import User from '../../../models/User';
import { IUser } from '../../../interfaces/users';
import { isValidObjectId } from 'mongoose';
import { getToken } from 'next-auth/jwt';

type Data = 
| {message: string}
| {users: IUser[], totalItems: Number, totalPages: Number}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    const session: any = await getToken({req, secret: process.env.NEXTAUTH_SECRET});
    const validRoles = ['admin'];
    if(!session || !validRoles.includes(session.user.role)){
        return res.status(400).json({message: 'No autorizado'});
    }

    switch(req.method){
        case 'GET': 
            return getUsers(req, res);

        case 'PUT': 
            return updateUser(req, res);
        
        default:
            return res.status(400).json({message: 'Bad Request'});
    }
    
}

const getUsers = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    let {page = 1, pageSize = 10} = req.query;

    const pageNumber = Number(page);
    const pageSizeNumber = Number(pageSize);
  
    if (isNaN(pageNumber) || isNaN(pageSizeNumber)) {
      return res.status(400).json({ message: 'Los parámetros de paginación deben ser números válidos.' });
    }
  
    if (pageNumber <= 0 || pageSizeNumber <= 0) {
      return res.status(400).json({ message: 'Los números de página y tamaño de página deben ser mayores a cero.' });
    }

    try{

        await connectDB();

        const totalItems = await User.countDocuments();
        const totalPages = Math.ceil(totalItems / pageSizeNumber);
        const skipItems = (pageNumber - 1) * pageSizeNumber;

        const users = await User.find().sort({ role: 'asc', createdAt: 'desc' }).skip(skipItems).limit(pageSizeNumber).select('-password').lean();

        await disconnectDB();

        return res.status(200).json({ users, totalItems, totalPages });

    } catch (error) {
        return res.status(500).json({ message: 'Error cargando usuarios'});
    }

}

const updateUser = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    const {userId = '', role = '', freeShipping = '', myUserId = ''} = req.body;    

    if(!isValidObjectId(userId)){
        return res.status(400).json({message: 'No existe usuario por ese ID'});
    }

    if(role != ''){
        if(!isValidObjectId(myUserId)){
            return res.status(400).json({message: 'El ID de tu usuario no es válido'});
        }
    
        const validRoles = ['admin', 'client'];

        if(!validRoles.includes(role)){
            return res.status(400).json({message: 'Rol no permitido'});
        }
    
        if((userId === myUserId) && role === 'client'){
            return res.status(400).json({message: 'No puedes cambiar tu rol de administrador a cliente'});
        }
    }

    try{

        await connectDB();

        const user = await User.findById(userId);

        if(!user){
            await disconnectDB();
            return res.status(404).json({message: 'Usuario no encontrado'});
        }

        if(role != ''){
            user.role = role;
        }
        if(freeShipping != ''){
            user.freeShipping = (freeShipping === 'true');            
        }
        await user.save();

        await disconnectDB();

        return res.status(200).json({message: 'Usuario actualizado'});

    } catch (error) {
        return res.status(500).json({ message: 'Error actualizando usuario'});
    }

}