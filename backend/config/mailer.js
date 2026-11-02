const nodemailer = require("nodemailer");
 const transporter = nodemailer.createTransport({ service: "gmail",
     auth: { user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS }, }); 
        async function sendEmail(to, subject, html) 
        { try { await transporter.sendMail({ from: `"CampusConnect" <${process.env.EMAIL_USER}>`, to, subject, html });
     } catch (error)
     
     { console.error("Email failed to send:", error.message);
        
      } } module.exports = sendEmail;