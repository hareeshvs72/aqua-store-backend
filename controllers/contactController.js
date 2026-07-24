const transporter = require("../config/mailer");
const dotenv = require("dotenv");

dotenv.config();

const sendContactMessage = async (req, res) => {
    try {

        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Mail to Company

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `New Contact Message - ${subject}`,
            html: `
                <h2>New Contact Form Submission</h2>

                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>

                <p><strong>Message:</strong></p>

                <p>${message}</p>
            `,
        });

        // Auto Reply

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Thank you for contacting Aqua Store",
            html: `
                <h2>Hello ${name},</h2>

                <p>Thank you for contacting Aqua Store.</p>

                <p>We have successfully received your message.</p>

                <p>Our support team will review it and get back to you as soon as possible.</p>

                <br>

                <p>Regards,</p>
                <h3>Aqua Store Team</h3>
            `,
        });

        res.status(200).json({
            success: true,
            message: "Message sent successfully",
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to send message",
        });
    }
};

module.exports = { sendContactMessage };