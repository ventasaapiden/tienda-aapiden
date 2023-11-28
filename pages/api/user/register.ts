import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB, disconnectDB } from '../../../database/db';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { signToken } from '../../../utils/jwt';
import { isValidEmail } from '../../../utils/validations';

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
            return registerUser(req, res);
    
        default:
            res.status(400).json({
                message: 'Bad request'
            })
    }

}

const registerUser = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    
    const {email = '', password = '', name = '', phone = ''} = req.body as {email: string, phone: string, password: string, name: string};

    if(password.length < 8){
        return res.status(400).json({message: 'La contraseña debe de ser de al menos 8 caracteres'});
    }

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
    const user = await User.findOne({email: email.toLocaleLowerCase()});

    if(user){
        await disconnectDB();
        return res.status(400).json({message: 'Ese correo ya esta registrado'});
    }

    let newUser = new User({
        email: email.toLocaleLowerCase(),
        password: bcrypt.hashSync(password),
        role: 'client',
        freeShipping: false,
        phone,
        name,
    });



    try {

        await newUser.save({validateBeforeSave: true});
        
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            message: 'Revisar logs del servidor'
        })
    }

    

    const {role, freeShipping, _id} = newUser;

    const token = signToken(_id, email);

    await disconnectDB();

    return res.status(200).json({
        token,
        user: {
            email, role, name, phone, freeShipping
        }
    })

    } catch (error) {
        return res.status(500).json({ message: 'Error creando cuenta'});
    }

}
