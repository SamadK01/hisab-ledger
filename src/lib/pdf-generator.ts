import jsPDF from 'jspdf';
import { Party, Transaction, Product } from './types';
import { calculatePartyBalance } from './store';

export function exportPartyLedgerPDF(party: Party, transactions: Transaction[]) {
  const doc = new jsPDF();
  const partyTxs = transactions
    .filter((t) => t.partyId === party.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const currentBal = calculatePartyBalance(party, transactions);

  // Colors
  const primaryColor = [79, 70, 229]; // Indigo
  const darkColor = [30, 41, 59];     // Slate 800

  // Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('HisabPro Ledger Statement', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 130, 20);

  // Party Profile Info Card
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(party.name, 14, 44);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Phone: ${party.phone || 'N/A'} | Type: ${party.partyType}`, 14, 50);
  if (party.address) {
    doc.text(`Address: ${party.address}`, 14, 56);
  }

  // Balance Badge Box
  let yPos = party.address ? 64 : 58;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, yPos, 182, 16, 2, 2, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Opening Balance:', 18, yPos + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(`PKR ${Math.abs(party.openingBalance).toLocaleString()} ${party.openingBalance > 0 ? '(Payable)' : party.openingBalance < 0 ? '(Receivable)' : '(Settled)'}`, 55, yPos + 10);

  doc.setFont('helvetica', 'bold');
  doc.text('Current Net Position:', 115, yPos + 10);
  if (currentBal > 0) {
    doc.setTextColor(225, 29, 72); // Red Payable
    doc.text(`PKR ${Math.abs(currentBal).toLocaleString()} (PAYABLE)`, 158, yPos + 10);
  } else if (currentBal < 0) {
    doc.setTextColor(16, 185, 129); // Green Receivable
    doc.text(`PKR ${Math.abs(currentBal).toLocaleString()} (RECEIVABLE)`, 158, yPos + 10);
  } else {
    doc.setTextColor(71, 85, 105);
    doc.text('PKR 0 (SETTLED)', 158, yPos + 10);
  }

  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);

  // Transaction Table Header
  yPos += 24;
  doc.setFillColor(30, 41, 59);
  doc.rect(14, yPos, 182, 9, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Date', 18, yPos + 6);
  doc.text('Type / Details', 48, yPos + 6);
  doc.text('Amount (PKR)', 115, yPos + 6);
  doc.text('Paid / Received', 145, yPos + 6);
  doc.text('Balance', 180, yPos + 6);

  yPos += 13;
  let runningBal = Number(party.openingBalance || 0);

  partyTxs.forEach((tx) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    const txDate = new Date(tx.date).toLocaleDateString('en-GB');
    const netDeal = Number(tx.remainingBalance || 0);
    const amount = Number(tx.totalAmount || 0);

    if (tx.type === 'PURCHASE') runningBal += netDeal;
    else if (tx.type === 'SALE') runningBal -= netDeal;
    else if (tx.type === 'PAYMENT_GIVEN') runningBal -= amount;
    else if (tx.type === 'PAYMENT_RECEIVED') runningBal += amount;

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    doc.text(txDate, 18, yPos);
    
    let typeLabel: string = tx.type;
    if (tx.type === 'PURCHASE') typeLabel = `Mal Aaya (${tx.invoiceNo || 'Deal'})`;
    else if (tx.type === 'SALE') typeLabel = `Mal Becha (${tx.invoiceNo || 'Deal'})`;
    else if (tx.type === 'PAYMENT_GIVEN') typeLabel = `Payment Given (${tx.paymentMode})`;
    else if (tx.type === 'PAYMENT_RECEIVED') typeLabel = `Payment Received (${tx.paymentMode})`;

    doc.setFont('helvetica', 'bold');
    doc.text(typeLabel.substring(0, 32), 48, yPos);

    doc.setFont('helvetica', 'normal');
    doc.text(`PKR ${tx.totalAmount.toLocaleString()}`, 115, yPos);
    doc.text(`PKR ${tx.cashPaid.toLocaleString()}`, 145, yPos);

    doc.setFont('helvetica', 'bold');
    if (runningBal > 0) doc.setTextColor(225, 29, 72);
    else if (runningBal < 0) doc.setTextColor(16, 185, 129);
    else doc.setTextColor(100, 116, 139);

    doc.text(`${Math.abs(runningBal).toLocaleString()}`, 180, yPos);

    // Draw item lines summary if deal
    if (tx.items && tx.items.length > 0) {
      yPos += 5;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 116, 139);
      const itemsText = tx.items.map((i) => `${i.productName} (${i.quantity} ${i.unit} @ ${i.rate})`).join(', ');
      doc.text(`Items: ${itemsText.substring(0, 75)}`, 48, yPos);
    }

    yPos += 8;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, yPos - 3, 196, yPos - 3);
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('HisabPro Mobile Inventory & Financial Ledger • Verified Business Document', 14, 288);

  doc.save(`${party.name.replace(/\s+/g, '_')}_Ledger_Statement.pdf`);
}

export function exportInventoryReportPDF(products: Product[]) {
  const doc = new jsPDF();

  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('HisabPro Inventory & Stock Valuation', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 150, 20);

  let yPos = 45;
  const totalValuation = products.reduce((sum, p) => sum + (p.currentStock * p.costPrice), 0);

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, yPos, 182, 16, 2, 2, 'F');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Stock Valuation (Cost Rate): PKR ${totalValuation.toLocaleString()}`, 20, yPos + 11);

  yPos += 26;
  doc.setFillColor(30, 41, 59);
  doc.rect(14, yPos, 182, 9, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Product Name', 18, yPos + 6);
  doc.text('Category', 75, yPos + 6);
  doc.text('Stock Qty', 115, yPos + 6);
  doc.text('Cost Rate', 145, yPos + 6);
  doc.text('Total Value', 175, yPos + 6);

  yPos += 12;

  products.forEach((prod) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    doc.text(prod.name.substring(0, 28), 18, yPos);
    doc.text(prod.category, 75, yPos);
    
    if (prod.currentStock <= prod.minStock) {
      doc.setTextColor(225, 29, 72);
      doc.setFont('helvetica', 'bold');
      doc.text(`${prod.currentStock} ${prod.unit} (LOW)`, 115, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
    } else {
      doc.text(`${prod.currentStock} ${prod.unit}`, 115, yPos);
    }

    doc.text(`PKR ${prod.costPrice}`, 145, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(`PKR ${(prod.currentStock * prod.costPrice).toLocaleString()}`, 175, yPos);

    yPos += 8;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, yPos - 3, 196, yPos - 3);
  });

  doc.save(`HisabPro_Inventory_Valuation_${new Date().toISOString().slice(0, 10)}.pdf`);
}
