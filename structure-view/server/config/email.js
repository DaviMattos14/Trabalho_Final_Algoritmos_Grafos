import nodemailer from 'nodemailer';


// CONFIGURAÇÃO DO EMAIL
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Servidor SMTP da Microsoft/Outlook
  port: 465,                    
  secure: true,                           
  auth: {
    // 📧 Seu email Outlook:
    user: 'structureview90@gmail.com',
    pass: 'mlnt pmwx gkkw kplt' 
  },
  tls:{
    rejectUnauthorized: false
  }
});


export default transporter