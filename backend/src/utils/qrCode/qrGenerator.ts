import QRCode from 'qrcode';

// Generate a QR code PNG as a Buffer
export async function generateQRBuffer(data: string): Promise<Buffer> {
  return QRCode.toBuffer(data, {
    type: 'png',
    width: 200,
    margin: 1,
    errorCorrectionLevel: 'M',
  });
}
