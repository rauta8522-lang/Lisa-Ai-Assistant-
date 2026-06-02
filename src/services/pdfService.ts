import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

export async function downloadPDF() {
  const input = document.getElementById("notes-container");

  if (!input) return;

  const canvas = await html2canvas(input);

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();

  const pdfHeight =
    (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(
    imgData,
    "PNG",
    0,
    0,
    pdfWidth,
    pdfHeight
  );

  pdf.save("Lisa_Notes.pdf");
}