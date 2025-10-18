import PDFDocument from "pdfkit";
import fs from "fs";

const generateCertificate = async (studentName, courseTitle, outputPath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ layout: "landscape" });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.fontSize(28).text("Certificate of Completion", { align: "center" });
    doc.moveDown(2);
    doc.fontSize(20).text(`This is to certify that`, { align: "center" });
    doc.moveDown(1);
    doc.fontSize(26).text(`${studentName}`, { align: "center", bold: true });
    doc.moveDown(1);
    doc.fontSize(18).text(`has successfully completed the course`, { align: "center" });
    doc.moveDown(1);
    doc.fontSize(24).text(`${courseTitle}`, { align: "center", italic: true });
    doc.moveDown(3);
    doc.fontSize(14).text(`Issued by LearnSphere`, { align: "center" });
    doc.end();

    stream.on("finish", () => resolve(outputPath));
    stream.on("error", reject);
  });
};

export default generateCertificate;
