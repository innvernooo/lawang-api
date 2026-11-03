import crypto from 'crypto';
import { prisma } from '../../src/configs/prisma-client.config';
import { Bcrypt } from '../../src/lib/bcrypt.lib';

// Seed 10 review untuk event "Malam Akustik Kemang": 3 customer asli yang
// sudah ada + 7 customer dummy (@example.com). Satu review per customer
// (unique customerId+eventId). Aman dijalankan ulang: review yang sudah ada
// dilewati.

const EVENT_SLUG = 'malam-akustik-kemang';

const DUMMY = [
  'Dewi Lestari', 'Bagas Pratama', 'Nadia Putri', 'Fajar Nugroho',
  'Siti Rahmawati', 'Yoga Aditya', 'Intan Permata',
];

const REVIEWS: { rating: number; comment: string }[] = [
  { rating: 5, comment: 'Suasananya hangat banget, lagunya enak didengar. Venue Kemang cozy, pasti datang lagi!' },
  { rating: 5, comment: 'Penampilan musisinya keren dan suaranya jernih. Worth it banget buat malam santai.' },
  { rating: 4, comment: 'Acara seru dan tertata rapi. Sayang tempat duduknya agak sempit, tapi secara keseluruhan puas.' },
  { rating: 5, comment: 'Akustiknya dapet banget, bikin merinding di beberapa lagu. Rekomendasi!' },
  { rating: 4, comment: 'Lineup bagus dan sound system mantap. Antrean masuk sedikit lama.' },
  { rating: 3, comment: 'Musiknya bagus, tapi acara mulai molor hampir 30 menit dari jadwal.' },
  { rating: 5, comment: 'Dari awal sampai akhir enak banget. Panitia ramah dan alurnya jelas.' },
  { rating: 4, comment: 'Pengalaman yang menyenangkan, cocok untuk datang bareng teman atau pasangan.' },
  { rating: 4, comment: 'Suasana malam di Kemang pas banget dengan musik akustik. Harga tiket sepadan.' },
  { rating: 5, comment: 'Salah satu konser kecil terbaik yang pernah saya datangi. Ditunggu event berikutnya!' },
];

async function main() {
  const event = await prisma.event.findUnique({ where: { slug: EVENT_SLUG } });
  if (!event) throw new Error(`Event ${EVENT_SLUG} tidak ditemukan`);

  const real = await prisma.customer.findMany({
    where: { deletedAt: null, role: 'CUSTOMER', email: { not: { endsWith: '@example.com' } } },
    orderBy: { createdAt: 'asc' },
    take: 3,
  });

  const password = await Bcrypt.hashPassword(crypto.randomBytes(16).toString('hex'));
  const dummies = [];
  for (const [i, name] of DUMMY.entries()) {
    const username = `reviewer_kemang_${i + 1}`;
    const customer = await prisma.customer.upsert({
      where: { username },
      update: {},
      create: {
        email: `${username}@example.com`,
        username,
        password,
        name,
        referralCode: crypto.randomBytes(5).toString('hex').toUpperCase(),
      },
    });
    dummies.push(customer);
  }

  const customers = [...real, ...dummies].slice(0, REVIEWS.length);
  const base = event.endDate.getTime();
  let created = 0;

  for (const [i, customer] of customers.entries()) {
    const exists = await prisma.review.findUnique({
      where: { customerId_eventId: { customerId: customer.id, eventId: event.id } },
    });
    if (exists) continue;
    await prisma.review.create({
      data: {
        customerId: customer.id,
        eventId: event.id,
        ...REVIEWS[i],
        createdAt: new Date(base + (i + 1) * 3 * 60 * 60 * 1000),
      },
    });
    created++;
  }

  console.log(`Review dibuat: ${created}, total untuk event: ${await prisma.review.count({ where: { eventId: event.id } })}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
