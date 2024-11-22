const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const pdf = require("html-pdf");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
const PORT = 3000;

// Middleware to serve static files and parse JSON bodies
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve the form
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Generate PDF
app.post("/generate", (req, res) => {
  const formData = req.body;
  const templatePath = path.join(__dirname, "template.html");

  ejs.renderFile(templatePath, formData, (err, renderedHtml) => {
    if (err) {
      console.error("Error rendering template:", err);
      return res.status(500).send("Error rendering template.");
    }

    const pdfOptions = { format: "Letter" };
    pdf.create(renderedHtml, pdfOptions).toStream((err, stream) => {
      if (err) {
        console.error("Error generating PDF:", err);
        return res.status(500).send("Error generating PDF.");
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=resume.pdf");
      stream.pipe(res);
    });
  });
});

// Email Resume
app.post("/email", (req, res) => {
  const { formData, emailAddress } = req.body;
  const templatePath = path.join(__dirname, "template.html");

  ejs.renderFile(templatePath, formData, (err, renderedHtml) => {
    if (err) {
      console.error("Error rendering template:", err);
      return res.status(500).send("Error rendering template.");
    }

    const pdfOptions = { format: "Letter" };
    pdf.create(renderedHtml, pdfOptions).toBuffer((err, buffer) => {
      if (err) {
        console.error("Error generating PDF:", err);
        return res.status(500).send("Error generating PDF.");
      }

      // Nodemailer configuration
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "renusingh9618@gmail.com", // Replace with your email address
          pass: "your-email-password",   // Use environment variables for security!
        },
      });

      const mailOptions = {
        from: "your-email@gmail.com",
        to: emailAddress,
        subject: "Your Professional Resume",
        text: "Attached is your professional resume.",
        attachments: [
          {
            filename: "resume.pdf",
            content: buffer,
          },
        ],
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          return res.status(500).send("Error sending email.");
        }

        res.send("Email sent successfully!");
      });
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
