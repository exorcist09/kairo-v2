import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.GOOGLE_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

transporter.verify((err,success)=>{
  if(err){
    console.error("Email server not responding",err)
  }else{
    console.log("Email server is ready",success)
  }
})

export const sendEmail = async ({ to, subject, text, html }: EmailOptions) => {
  await transporter.sendMail({
    from: process.env.GOOGLE_USER,
    to,
    subject,
    text,
    html,
  });
};
