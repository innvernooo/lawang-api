// Email untuk Customer saat Event Organizer menolak pembayaran.
// Dipakai dengan Handlebars: Handlebars.compile(paymentRejectedTemplate)({ ...data })
// Data yang dibutuhkan:
//   customerName, transactionId, eventName, ticketName, quantity,
//   rejectedDate, amount, transactionUrl
export const paymentRejectedTemplate = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pembayaran Ditolak</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f6f9fc; color: #333333;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f6f9fc;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
                    <!-- Header Banner -->
                    <tr>
                        <td align="center" style="background-color: #DC2626; padding: 40px 20px;">
                            <table border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="background-color: rgba(255, 255, 255, 0.2); width: 60px; height: 60px; border-radius: 50%; text-align: center;">
                                        <span style="color: #ffffff; font-size: 30px; font-weight: bold; line-height: 60px;">✕</span>
                                    </td>
                                </tr>
                            </table>
                            <h1 style="margin: 16px 0 0 0; color: #ffffff; font-size: 24px; font-weight: 600;">Pembayaran Ditolak</h1>
                        </td>
                    </tr>

                    <!-- Konten Utama -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5; color: #4B5563;">Halo <strong>{{customerName}}</strong>,</p>
                            <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.5; color: #4B5563;">Maaf, pembayaran untuk pesananmu <strong>ditolak oleh Event Organizer</strong> setelah bukti pembayaran diperiksa. Berikut detail transaksinya:</p>

                            <!-- Box Detail Transaksi -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F9FAFB; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 6px 0; font-size: 14px; color: #6B7280; width: 40%;">ID Transaksi</td>
                                    <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #111827; text-align: right;">{{transactionId}}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; font-size: 14px; color: #6B7280;">Nama Event</td>
                                    <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #111827; text-align: right;">{{eventName}}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; font-size: 14px; color: #6B7280;">Tiket</td>
                                    <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #111827; text-align: right;">{{ticketName}} × {{quantity}}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; font-size: 14px; color: #6B7280;">Tanggal Ditolak</td>
                                    <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #111827; text-align: right;">{{rejectedDate}}</td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="border-top: 1px solid #E5E7EB; padding-top: 12px; margin-top: 12px;"></td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; font-size: 16px; font-weight: bold; color: #111827;">Total Pembayaran</td>
                                    <td style="padding: 6px 0; font-size: 18px; font-weight: bold; color: #DC2626; text-align: right;">{{amount}}</td>
                                </tr>
                            </table>

                            <!-- Info Pengembalian -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FEF2F2; border-left: 4px solid #DC2626; border-radius: 6px; padding: 16px 20px; margin-bottom: 24px;">
                                <tr>
                                    <td style="font-size: 14px; line-height: 1.6; color: #7F1D1D;">
                                        <p style="margin: 0 0 8px 0; font-weight: 600;">Yang perlu kamu tahu:</p>
                                        <p style="margin: 0 0 4px 0;">• Poin, kupon, atau voucher yang kamu pakai di pesanan ini sudah dikembalikan dan bisa dipakai lagi.</p>
                                        <p style="margin: 0 0 4px 0;">• Kursi yang kamu pesan sudah dilepas kembali.</p>
                                        <p style="margin: 0;">• Kalau kamu sudah mentransfer dana, hubungi Pusat Bantuan Lawang dengan menyertakan ID Transaksi di atas untuk proses pengembalian dana.</p>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 32px 0; font-size: 14px; line-height: 1.5; color: #6B7280;">Kamu tetap bisa memesan ulang tiket event ini selama kuotanya masih tersedia. Pastikan bukti pembayaran jelas terbaca dan nominalnya sesuai dengan total yang tertera.</p>

                            <!-- Tombol Aksi -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <a href="{{transactionUrl}}" target="_blank" style="background-color: #DC2626; color: #ffffff; padding: 12px 30px; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 6px; display: inline-block;">Lihat Transaksi Saya</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #F3F4F6; padding: 20px 30px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #E5E7EB;">
                            <p style="margin: 0 0 4px 0;">Email ini dikirimkan secara otomatis oleh sistem, mohon tidak membalas email ini.</p>
                            <p style="margin: 0;">&copy; 2026 Lawang. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
