const PDFDocument = require('pdfkit');
const path = require('path');

exports.handler = async (event) => {
  try {
    const { noticeData } = JSON.parse(event.body);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => {});

    // ✅ বাংলা ও ইংরেজি দুটোর জন্যই NotoSans ফন্ট রেজিস্টার করা হলো
    const fontPath = path.join(__dirname, 'fonts', 'NotoSansBengali-Regular.ttf');
    doc.registerFont('Universal', fontPath);
    doc.font('Universal');

    // হেডিং
    doc.fontSize(20).text('তথাগত সংসদ', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).text('নোটিশ / Notice', { align: 'center' });
    doc.moveDown(1.5);

    // নোটিশের বিস্তারিত
    doc.fontSize(12).text('নোটিশ নং (Notice No): ' + (noticeData.notice_number || ''), { align: 'left' });
    doc.moveDown(0.5);
    doc.fontSize(14).text('শিরোনাম (Title): ' + (noticeData.title || ''), { align: 'left' });
    doc.moveDown(1);
    
    // বডি টেক্সট (এখানে বাংলা বা ইংরেজি যাই লেখা হোক, দুটোই দেখাবে)
    doc.fontSize(12).text(noticeData.body || '', { align: 'justify' });
    
    // সিগনেচার
    doc.moveDown(3);
    doc.text('___________________________', { align: 'right' });
    doc.text('কমিটির স্বাক্ষর (Signature)', { align: 'right' });

    doc.end();

    await new Promise(r => setTimeout(r, 100));

    const pdfBuffer = Buffer.concat(chunks);
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'success',
        pdfBase64: pdfBuffer.toString('base64')
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ status: 'error', message: err.message })
    };
  }
};