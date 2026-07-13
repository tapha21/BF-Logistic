import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

export async function renderNodeToPdf(node: HTMLElement, filename: string): Promise<jsPDF> {
  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    windowWidth: node.scrollWidth,
    windowHeight: node.scrollHeight,
  });

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const imgWidth = A4_WIDTH_MM;
  const pageHeight = A4_HEIGHT_MM;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;
  const imgData = canvas.toDataURL("image/jpeg", 0.95);

  pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  return pdf;
}

export async function downloadNodeAsPdf(node: HTMLElement, filename: string) {
  const pdf = await renderNodeToPdf(node, filename);
  pdf.save(filename);
}

export async function nodeToPdfBlob(node: HTMLElement, filename: string): Promise<File> {
  const pdf = await renderNodeToPdf(node, filename);
  const blob = pdf.output("blob");
  return new File([blob], filename, { type: "application/pdf" });
}
