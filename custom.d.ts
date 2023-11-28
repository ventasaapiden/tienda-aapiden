// declare module 'nodemailer-sendgrid-transport' {
//     import { TransportOptions } from 'nodemailer';
  
//     interface SendgridTransportOptions {
//       auth: {
//         api_key: string;
//       };
//     }
  
//     const createTransport: (options: SendgridTransportOptions) => TransportOptions;
  
//     export = createTransport;
//   }

declare module 'nodemailer' {
  interface TransportOptions {
    host?: string;
    port?: number;
    auth?: {
      user: string;
      pass: string;
    };
  }

  interface Transporter {
    sendMail(
      mailOptions: any,
      callback?: (error: Error | null, info: any) => void
    ): void;
  }

  function createTransport(options: TransportOptions): Transporter;

  export = {
    createTransport: createTransport
  };
}
