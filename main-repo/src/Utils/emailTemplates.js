export const emailForAccountVerification = (data) => {
  const { name, otp } = data;
  if (!name || !otp) {
    return {
      error: true,
      message: "Name or OTP is missing",
    };
  }
  return {
    error: false,
    subject: "Hazlo - Account Verification",
    html: `
      <div
        style = "padding:20px 20px 40px 20px; position: relative; overflow: hidden; width: 100%;"
      >
        <img 
              style="
              top: 0;position: absolute;z-index: 0;width: 100%;height: 100vmax;object-fit: cover;" 
              src="cid:background" alt="background" 
        />
        <div style="z-index:1; position: relative;">
        <header style="padding-bottom: 20px">
          <div class="logo" style="text-align:center;">
        
          </div>
        </header>
        <main 
          style= "padding: 20px; background-color: #f5f5f5; border-radius: 10px; width: 80%; margin: 0 auto; margin-bottom: 20px; font-family: 'Poppins', sans-serif;"
        >
          <h1 
            style="color: #a87628; font-size: 30px; font-weight: 700;"
          >Welcome To Hazlo</h1>
          <p
            style="font-size: 24px; text-align: left; font-weight: 500; font-style: italic;"
          >Hi ${name},</p>
          <p 
            style="font-size: 20px; text-align: left; font-weight: 500;"
          >Thank you for registering with us. Please use the following OTP to verify your email address.</p>
          <h2
            style="font-size: 36px; font-weight: 700; padding: 10px; width:100%; text-align:center;color: #a87628; text-align: center; margin-top: 20px; margin-bottom: 20px;"
          >${otp}</h2>
          <p style = "font-size: 16px; font-style:italic; color: #343434">If you did not request this email, kindly ignore this. If this is a frequent occurence <a
          style = "color: #a87628; text-decoration: none; border-bottom: 1px solid #a87628;" href = "#"
          >let us know.</a></p>
          <p style = "font-size: 20px;">Regards,</p>
          <p style = "font-size: 20px;">Dev Team</p>
        </main>
        </div>
      <div>
      `,
    attachments: [
      // {
      //   filename: "logo.png",
      //   path: "./public/uploads/logo.png",
      //   cid: "logo",
      //   contentDisposition: "inline",
      // },
      {
        filename: "bg.jpg",
        path: "./public/uploads/bg.jpg",
        cid: "background",
        contentDisposition: "inline",
      },
    ],
  };
};
export const emailForResetPassword = (data) => {
  const { name, otp } = data;
  if (!name || !otp) {
    return {
      error: true,
      message: "Name or OTP is missing",
    };
  }
  return {
    subject: "Hazlo - Reset Password Request",
    html: `
      <div
        style = "padding:20px 20px 40px 20px; position: relative; overflow: hidden; width: 100%;"
      >
        <img 
              style="
              top: 0;position: absolute;z-index: 0;width: 100%;height: 100vmax;object-fit: cover;" 
              src="cid:background" alt="background" 
        />
        <div style="z-index:1; position: relative;">
        <header style="padding-bottom: 20px">
          <div class="logo" style="text-align:center;">
         
          </div>
        </header>
        <main 
          style= "padding: 20px; background-color: #f5f5f5; border-radius: 10px; width: 80%; margin: 0 auto; margin-bottom: 20px; font-family: 'Poppins', sans-serif;"
        >
          <h1
            style="font-size: 30px; text-align: left; font-weight: 500; font-style: bold;"
          >Hi ${name},</h1>
          <p 
            style="font-size: 20px; text-align: left; font-weight: 500;"
          >It looks like you are having trouble accessing your account, kindly use the following code to verify that you are the one making this request.</p>
          <h2
            style="font-size: 36px; font-weight: 700; padding: 10px; width:100%; text-align:center;color: #a87628; text-align: center; margin-top: 20px; margin-bottom: 20px;"
          >${otp}</h2>
          <p style = "font-size: 16px; font-style:italic; color: #343434">For your own security never share this code with anyone, we will never reach out to you for this code.</p>
          <p style = "font-size: 16px; font-style:italic; color: #343434">If you did not request this email, kindly ignore this. If this is a frequent occurence <a
          style = "color: #a87628; text-decoration: none; border-bottom: 1px solid #a87628;" href = "#"
          >let us know.</a></p>
          <p style = "font-size: 20px;">Regards,</p>
          <p style = "font-size: 20px;">Dev Team</p>
        </main>
        </div>
      <div>
      `,
    error: false,
    attachments: [
      // {
      //   filename: "logo.png",
      //   path: "./public/uploads/logo.png",
      //   cid: "logo",
      //   contentDisposition: "inline",
      // },
      {
        filename: "bg.jpg",
        path: "./public/uploads/bg.jpg",
        cid: "background",
        contentDisposition: "inline",
      },
    ],
  };
};
