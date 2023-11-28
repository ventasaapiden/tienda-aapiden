import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';
import { connectDB, disconnectDB } from '../../../database/db';
import Order from '../../../models/Order';
import nodemailer from 'nodemailer';
import sendgridTransport from 'nodemailer-sendgrid-transport';
import { getSession } from 'next-auth/react';
import { IUser } from '../../../interfaces/users';
import User from '../../../models/User';

type Data = {
    message: string
}

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

    switch(req.method){
        case 'POST': 
            return payOrder(req, res);
        default:
            return res.status(400).json({message: 'Bad Request'});
    }

}

const payOrder = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    //TODO validar ID es mongoID y validar que la orden es del usuario segun session

    const {transactionId = '', orderId = ''} = req.body;

    try{

        await connectDB();

        const dbOrder = await Order.findById(orderId);

        if(!dbOrder){
            await disconnectDB();
            return res.status(400).json({message: 'Orden no existe en la base de datos'});
        }

        dbOrder.transactionId = transactionId;
        dbOrder.paidAt = new Date().toString();

        await dbOrder.save();

        const session: any = await getSession({req});
        const admins = await User.find({role: 'admin'});
        const emailsAdmins: string[] = admins.map(admin => admin.email);
        const emailPromises = [];
        emailPromises.push(transporter.sendMail(opcionesEmailToClientComprobante(session.user, orderId)));
        emailPromises.push(transporter.sendMail(opcionesEmailToAdminsComprobante(emailsAdmins, orderId)));
        const results = await Promise.all(emailPromises);

        await disconnectDB();
        return res.status(200).json({message: 'Comprobante registrado!'});

    } catch (error) {
        return res.status(500).json({ message: 'Error ingresando comprobante'});
    }

}

const opcionesEmailToClientComprobante = (user: IUser, orderId:string) => {

    return {
        to: user.email,
        from: process.env.ADMIN_EMAIL_TO_SEND_EMAILS,
        subject: '¡El comprobante de tu orden ha sido recibido!',
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
                        <p>Estimado/a ${user.name},</p>
                        <p>Hemos recibido el comprobante de tu orden con ID: ${orderId}.</p>
                        <p>Una vez sea verificado el comprobante, procederemos con el procesamiento de tu orden.</p>
                        <p>¡Gracias por tu compra!</p>
                    </div>
                </div>
            </body>
        </html>
        `
    };

}

const opcionesEmailToAdminsComprobante = (emails: string[], orderId:string) => {

    return {
        to: emails,
        from: process.env.ADMIN_EMAIL_TO_SEND_EMAILS,
        subject: '¡Se ha enviado el comprobante de una orden!',
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
                        <p>Estimado/a Administrador/a,</p>
                        <p>Se ha enviado el comprobante de la orden con ID: ${orderId}.</p>
                        <p><a href="${process.env.HOST_NAME}/admin/orders/${orderId}">Para ver el detalle de la orden puedes hacer clic aquí</a></p>
                    </div>
                </div>
            </body>
        </html>
        `
    };

}