export const generateOTP = () => {
  return Math.floor(10000 + Math.random() * 900000).toString();
};

export const getOtpHTML = (otp: string) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your OTP Code</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 40px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #333333;
          margin-bottom: 20px;
        }
        .message {
          font-size: 16px;
          color: #555555;
          line-height: 1.5;
          margin-bottom: 30px;
        }
        .otp {
          font-size: 36px;
          font-weight: bold;
          color: #007bff;
          letter-spacing: 5px;
          margin-bottom: 30px;
          padding: 10px;
          background-color: #f8f9fa;
          border-radius: 4px;
          display: inline-block;
        }
        .footer {
          font-size: 14px;
          color: #999999;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">Kairo</div>
        <div class="message">
          Hello,<br><br>
          Please use the following One-Time Password (OTP) to complete your verification process. This code is valid for 10 minutes.
        </div>
        <div class="otp">${otp}</div>
        <div class="footer">
          If you didn't request this, you can safely ignore this email.<br>
          &copy; ${new Date().getFullYear()} Kairo. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;
};