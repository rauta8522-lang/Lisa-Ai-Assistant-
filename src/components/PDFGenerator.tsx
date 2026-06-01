import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const downloadPDF = async () => {
  const element = document.getElementById("notes-container");

  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = 210;
  const imgHeight =
    (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(
    imgData,
    "PNG",
    0,
    0,
    pdfWidth,
    imgHeight
  );

  pdf.save("Handwritten_Notes.pdf");
};