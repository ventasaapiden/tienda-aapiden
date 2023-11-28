import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB, disconnectDB } from '../../../database/db';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { isValidEmail } from '../../../utils/validations';
import generator from 'generate-password';
import nodemailer from 'nodemailer';
import sendgridTransport from 'nodemailer-sendgrid-transport';
import { IUser } from '../../../interfaces/users';

type Data = 
| {message: string}

// interface SendgridTransportOptions {
//     auth: {
//       api_key: string;
//     };
//   }

// const sendgridOptions: SendgridTransportOptions = {
//     auth: {
//         api_key: process.env.SENDGRID_API_KEY || '', // Asegúrate de manejar el caso en el que SENDGRID_API_KEY esté ausente
//     }
// };
  
// const transporter = nodemailer.createTransport(sendgridTransport(sendgridOptions));
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: +process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
});

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    
    switch (req.method) {
        case 'POST':
            return forgotPassword(req, res);
    
        default:
            res.status(400).json({
                message: 'Bad request'
            })
    }

}

const forgotPassword = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    
    const {email = ''} = req.body as {email: string};

    if(!isValidEmail(email)){
        return res.status(400).json({message: 'El correo ingresado no tiene un formato válido'});
    }

    try{

        await connectDB();
        const usuario = await User.findOne({email: email.toLocaleLowerCase()});

        if(!usuario){
            await disconnectDB();
            return res.status(400).json({message: 'El correo no es válido'});
        }

        const newPassword = generator.generate({
            length: 16,
            numbers: true
        });

        const salt = bcrypt.genSaltSync();
        const newPass = bcrypt.hashSync(newPassword, salt);

        const user = await User.findByIdAndUpdate(
            usuario.id,
            { password: newPass },
            { new: true });

        await transporter.sendMail(opcionesEmailToClientForgotPassword(user!, newPassword));
        
        await disconnectDB();

        return res.status(200).json({
            message: 'La nueva contraseña fue enviada al usuario'
        });

    } catch (error) {
        return res.status(500).json({ message: 'Error, revisar logs sdels servidor'});
    }

}

const opcionesEmailToClientForgotPassword = (user: IUser, newPassword:string) => {

    return {
        to: user.email,
        from: process.env.ADMIN_EMAIL_TO_SEND_EMAILS,
        subject: 'Aquí tienes tu nueva contraseña',
        html: `
        <!DOCTYPE html>
        <html>
            <head>
                <style>
                    /* Estilos CSS para el correo */
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f4;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background-color: #F9B63C;
                        color: #fff;
                        text-align: center;
                        padding: 0px 0;
                    }
                    .content {
                        background-color: #fff;
                        padding: 20px;
                    }
                    h1 {
                        color: #333;
                    }
                    a {
                        color: #007bff; /* Color del enlace */
                        text-decoration: none; /* Quitar subrayado */
                    }
                    a:hover {
                        text-decoration: underline; /* Subrayado al pasar el cursor */
                    }
                    p {
                        font-size: 16px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                    </div>
                    <img src="${process.env.HOST_NAME}/aapiden_logo.jpg" alt="AAPIDEN" width="512" height="253" />
                    <div class="content">
                        <p>Estimado(a) ${user.name},</p>
                        <p>Ahora puedes iniciar sesión con esta contraseña: ${newPassword}</p>
                    </div>
                </div>
            </body>
        </html>
        `
    };

}