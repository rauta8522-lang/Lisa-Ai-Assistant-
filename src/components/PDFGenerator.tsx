import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

export const downloadPDF = async () => {
  const element = document.getElementById("notes-container");

  if (!element) {
    alert("Notes not found!");
    return;
  }

  try {
    // 🔥 FIX overflow issue
    document.body.style.overflow = "visible";
    document.documentElement.style.overflow = "visible";

    // 🔥 Clone element (important)
    const cloned = element.cloneNode(true) as HTMLElement;

    cloned.style.position = "absolute";
    cloned.style.top = "0";
    cloned.style.left = "0";
    cloned.style.width = element.scrollWidth + "px";
    cloned.style.height = element.scrollHeight + "px";
    cloned.style.overflow = "visible";
    cloned.style.background = "#fff";

    document.body.appendChild(cloned);

    // wait for render
    await new Promise((r) => setTimeout(r, 800));

    // 🔥 CAPTURE FULL HEIGHT
    const canvas = await html2canvas(cloned, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: 0,
      windowWidth: cloned.scrollWidth,
      windowHeight: cloned.scrollHeight,
    });

    document.body.removeChild(cloned);

    const imgData = canvas.toDataURL("image/jpeg", 1.0);

    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = 210;
    const pdfHeight = 297;

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);

    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;

      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);

      heightLeft -= pdfHeight;
    }

    pdf.save("Study_Notes.pdf");

    // 🔥 RESET
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";

  } catch (err) {
    console.error(err);
    alert("PDF generation failed");
  }
};