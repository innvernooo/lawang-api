import { prisma } from '../../src/configs/prisma-client.config';
import { Bcrypt } from '../../src/lib/bcrypt.lib';

const organizers = [
  {
    email: 'nadasenja@example.com',
    username: 'nadasenja',
    organizerName: 'Nada Senja Production',
    organizerType: 'COMPANY' as const,
    legalName: 'PT Nada Senja Kreasindo',
    organizerBio: 'Penyelenggara konser musik indie dan festival akustik.',
    instagramUrl: 'https://instagram.com/nadasenja.id',
    npwp: '0123456789012001',
    nib: '1234567890001',
    picName: 'Rizky Pratama',
    picNik: '3171010101900001',
    picPhoneNumber: '081200000001',
    officeAddress: 'Jl. Kemang Raya No. 12',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postalCode: '12730',
    bankName: 'Bank Central Asia (BCA)',
    bankAccountNumber: '5270000001',
  },
  {
    email: 'kreasipanggung@example.com',
    username: 'kreasipanggung',
    organizerName: 'Kreasi Panggung Nusantara',
    organizerType: 'COMPANY' as const,
    legalName: 'CV Kreasi Panggung Nusantara',
    organizerBio: 'Spesialis pertunjukan seni budaya dan teater.',
    instagramUrl: 'https://instagram.com/kreasipanggung',
    npwp: '0123456789012002',
    nib: '1234567890002',
    picName: 'Dewi Lestari Putri',
    picNik: '3273010202910002',
    picPhoneNumber: '081200000002',
    officeAddress: 'Jl. Braga No. 45',
    city: 'Bandung',
    province: 'Jawa Barat',
    postalCode: '40111',
    bankName: 'Bank Mandiri',
    bankAccountNumber: '1300000000002',
  },
  {
    email: 'ruanggerak@example.com',
    username: 'ruanggerak',
    organizerName: 'Ruang Gerak Event',
    organizerType: 'INDIVIDUAL' as const,
    legalName: 'Bagus Setiawan',
    organizerBio: 'Penyelenggara workshop kreatif dan kelas komunitas.',
    instagramUrl: 'https://instagram.com/ruanggerak.event',
    npwp: '0123456789012003',
    nib: null,
    picName: 'Bagus Setiawan',
    picNik: '3471010303920003',
    picPhoneNumber: '081200000003',
    officeAddress: 'Jl. Prawirotaman No. 8',
    city: 'Yogyakarta',
    province: 'DI Yogyakarta',
    postalCode: '55153',
    bankName: 'Bank Rakyat Indonesia (BRI)',
    bankAccountNumber: '002301000000003',
  },
  {
    email: 'lenterakreatif@example.com',
    username: 'lenterakreatif',
    organizerName: 'Lentera Kreatif',
    organizerType: 'INDIVIDUAL' as const,
    legalName: 'Siti Nurhaliza Rahman',
    organizerBio: 'Mengadakan stand-up comedy dan open mic bulanan.',
    instagramUrl: 'https://instagram.com/lenterakreatif',
    npwp: '0123456789012004',
    nib: null,
    picName: 'Siti Nurhaliza Rahman',
    picNik: '3578010404930004',
    picPhoneNumber: '081200000004',
    officeAddress: 'Jl. Tunjungan No. 21',
    city: 'Surabaya',
    province: 'Jawa Timur',
    postalCode: '60261',
    bankName: 'Bank Negara Indonesia (BNI)',
    bankAccountNumber: '0400000004',
  },
  {
    email: 'soraksorai@example.com',
    username: 'soraksorai',
    organizerName: 'Sorak Sorai Entertainment',
    organizerType: 'COMPANY' as const,
    legalName: 'PT Sorak Sorai Hiburan Indonesia',
    organizerBio: 'Penyelenggara turnamen e-sports dan event olahraga.',
    instagramUrl: 'https://instagram.com/soraksorai.ent',
    npwp: '0123456789012005',
    nib: '1234567890005',
    picName: 'I Made Wirawan',
    picNik: '5171010505940005',
    picPhoneNumber: '081200000005',
    officeAddress: 'Jl. Teuku Umar No. 77',
    city: 'Denpasar',
    province: 'Bali',
    postalCode: '80113',
    bankName: 'Bank CIMB Niaga',
    bankAccountNumber: '7600000000005',
  },
];

async function main() {
  const password = await Bcrypt.hashPassword('12345', 10);

  for (const o of organizers) {
    const result = await prisma.organizer.upsert({
      where: { email: o.email },
      update: {},
      create: { ...o, password, bankAccountHolder: o.legalName },
    });
    console.log(`✔ ${result.username} (${result.id})`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
