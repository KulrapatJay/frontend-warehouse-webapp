import jsPDF from "jspdf";

export type ReceiptData = {
  orderId: string;
  orderNumber: string;
  customer: {
    code: string;
    name: string;
    phone: string;
    address: string;
  };
  items: Array<{
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  orderDate: string;
  status: string;
  staff: string;
  notes: string;
};

// โหลดฟอนต์ไทย 2 แบบ (Normal + Bold)
async function loadThaiFont(): Promise<{ normal: string; bold: string }> {
  try {
    const [normalResponse, boldResponse] = await Promise.all([
      fetch('/fonts/THSarabunNew.ttf'),
      fetch('/fonts/THSarabunNew Bold.ttf')
    ]);
    
    if (!normalResponse.ok || !boldResponse.ok) {
      throw new Error(`HTTP error! Normal: ${normalResponse.status}, Bold: ${boldResponse.status}`);
    }
    
    const normalBuffer = await normalResponse.arrayBuffer();
    const boldBuffer = await boldResponse.arrayBuffer();
    
    const normalBytes = new Uint8Array(normalBuffer);
    let normalBinary = '';
    for (let i = 0; i < normalBytes.byteLength; i++) {
      normalBinary += String.fromCharCode(normalBytes[i]);
    }
    const boldBytes = new Uint8Array(boldBuffer);
    let boldBinary = '';
    for (let i = 0; i < boldBytes.byteLength; i++) {
      boldBinary += String.fromCharCode(boldBytes[i]);
    }
    
    return {
      normal: btoa(normalBinary),
      bold: btoa(boldBinary)
    };
  } catch (error) {
    console.error('Error loading Thai fonts:', error);
    throw error;
  }
}

// ฟังก์ชันสร้าง PDF
export async function generateReceiptPDF(data: ReceiptData): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 210],
  });

  // โหลดและเพิ่มฟอนต์ไทยทั้ง 2 แบบ
  try {
    const fonts = await loadThaiFont();
    doc.addFileToVFS("THSarabunNew.ttf", fonts.normal);
    doc.addFont("THSarabunNew.ttf", "THSarabunNew", "normal");
    doc.addFileToVFS("THSarabunNew Bold.ttf", fonts.bold); 
    doc.addFont("THSarabunNew Bold.ttf", "THSarabunNew", "bold"); 
    doc.setFont("THSarabunNew", "normal");
  } catch (error) {
    console.warn("ไม่สามารถโหลดฟอนต์ภาษาไทย กลับไปใช้ฟอนต์เริ่มต้น", error);
    doc.setFont("helvetica");
  }

  let y = 5;
  const pageWidth = 80;
  const margin = 4;
  const rightEdge = 68; // ห่างจากขอบ 8mm
  const contentWidth = pageWidth - (margin * 2);

  // ========== HEADER ==========
  doc.setFontSize(22);
  doc.setFont("THSarabunNew", "bold");
  doc.text("ใบเสร็จรับเงิน", pageWidth / 2, y, { align: "center" });
  doc.setFont("THSarabunNew", "normal");
  y += 6;

  // เส้นคั่น
  doc.setLineWidth(0.1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // ========== ORDER INFO ==========
  doc.setFontSize(12);
  
  // Order Number (ใช้ orderNumber หรือตัดส่วนท้าย orderId)
  let displayOrderId = data.orderNumber || "N/A";
  if (!data.orderNumber && data.orderId) {
    // ตัดเอาแค่ 8 ตัวท้าย
    displayOrderId = data.orderId.slice(-8);
  }
  doc.text(`Order: ${displayOrderId}`, margin, y);
  y += 4.5;
  
  // วันที่
  const orderDate = new Date(data.orderDate);
  const thaiDate = orderDate.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`วันที่: ${thaiDate}`, margin, y);
  y += 4.5;
  
  y += 1;

  // ========== CUSTOMER INFO ==========
  doc.setFontSize(14);
  
  // ลูกค้า: ชื่อลูกค้า (บรรทัดเดียว)
  const customerName = data.customer.name || "N/A";
  doc.setFont("THSarabunNew", "bold");
  const customerText = `ลูกค้า: `;
  const customerWidth = doc.getTextWidth(customerText);
  doc.text(customerText, margin, y);
  doc.setFont("THSarabunNew", "normal");
  doc.text(customerName, margin + customerWidth, y);
  y += 5;
  
  y += 1;

  // เส้นคั่น
  doc.setLineWidth(0.1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // ========== ITEMS ==========
  doc.setFontSize(14);
  doc.setFont("THSarabunNew", "bold");
  doc.text("รายการสินค้า", margin, y);
  doc.setFont("THSarabunNew", "normal");
  y += 5;

  if (data.items && data.items.length > 0) {
    data.items.forEach((item, index) => {
      doc.setFontSize(14);
      
      const qty = item.quantity || 0;
      const price = item.unitPrice || 0;
      const total = item.total || 0;
      
      // ชื่อสินค้า
      const itemText = `${index + 1}. ${item.productName || "N/A"}`;
      const itemLines = doc.splitTextToSize(itemText, contentWidth);
      doc.text(itemLines[0], margin, y);
      y += 4.5;
      
      // จำนวน x ราคา = รวม
      const rightItemText = `   ${qty} x ${price.toFixed(2)} = ${total.toFixed(2)}`;
      doc.text(rightItemText, rightEdge, y, { align: "right" });
      
      y += 5.5;
    });
  }

  // เส้นคั่น
  doc.setLineWidth(0.1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // ========== SUMMARY ==========
  doc.setFontSize(14);

  // ยอดรวม
  doc.text("ยอดรวม:", margin, y);
  doc.text(`${(data.subtotal || 0).toFixed(2)}`, rightEdge, y, { align: "right" });
  y += 4.5;

  // ส่วนลด
  if (data.discount && data.discount > 0) {
    doc.text("ส่วนลด:", margin, y);
    doc.text(`-${data.discount.toFixed(2)}`, rightEdge, y, { align: "right" });
    y += 4.5;
  }

  // ภาษี
  if (data.tax && data.tax > 0) {
    doc.text("ภาษี:", margin, y);
    doc.text(`${data.tax.toFixed(2)}`, rightEdge, y, { align: "right" });
    y += 4.5;
  }

  // รวมทั้งสิ้น (เด่นสุด)
  y += 2;
  doc.setLineWidth(0.5);
  doc.line(margin, y - 1, rightEdge + 3, y - 1); // เส้นบน
  y += 5;
  
  doc.setFontSize(18);
  doc.setFont("THSarabunNew", "bold");
  doc.text("รวมทั้งสิ้น (บาท):", margin, y);
  doc.text(`${(data.total || 0).toFixed(2)}`, rightEdge, y, { align: "right" });
  
  y += 3;
  doc.line(margin, y - 1, rightEdge + 3, y - 1); // เส้นล่าง
  
  doc.setFont("THSarabunNew", "normal");
  y += 5;

  // ========== NOTES ==========
  if (data.notes && data.notes.trim()) {
    doc.setFontSize(12);
    doc.setFont("THSarabunNew", "bold");
    doc.text("หมายเหตุ:", margin, y);
    doc.setFont("THSarabunNew", "normal");
    y += 4;
    
    doc.setFontSize(11);
    const notesLines = doc.splitTextToSize(data.notes, contentWidth);
    const maxNotesLines = Math.min(notesLines.length, 3);
    for (let i = 0; i < maxNotesLines; i++) {
      doc.text(notesLines[i], margin, y);
      y += 3.5;
    }
    y += 2;
  }

  // ========== FOOTER ==========
  y += 3;
  doc.setFontSize(16);
  doc.setFont("THSarabunNew", "bold");
  doc.text("ขอบคุณที่ใช้บริการ!", pageWidth / 2, y, { align: "center" });
  doc.setFont("THSarabunNew", "normal");
  y += 5;
  doc.setFontSize(12);
  doc.text("โปรดตรวจสอบสินค้าก่อนรับ", pageWidth / 2, y, { align: "center" });

  return doc;
}

export async function printPDF(pdf: jsPDF): Promise<void> {
  pdf.autoPrint();
  
  const blobUrl = pdf.output('bloburl');
  const printWindow = window.open(blobUrl, '_blank');
  
  if (!printWindow) {
    pdf.save('receipt.pdf');
  }
}

export function downloadPDF(pdf: jsPDF, filename: string = 'receipt.pdf'): void {
  pdf.save(filename);
}