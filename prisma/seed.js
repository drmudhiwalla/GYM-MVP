const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.screening.count();
  if (count > 0) {
    console.log(`Seed skipped: ${count} records already exist`);
    return;
  }

  await prisma.screening.createMany({
    data: [
      {
        screeningId: 'DMW-SEED-0001',
        name: 'Aarav Sharma',
        age: 28,
        gender: 'Male',
        whatsappNumber: '9876500001',
        workingStatus: '',
        consent1: true,
        consent2: true,
        consent3: true,
        status: 'REGISTERED',
      },
      {
        screeningId: 'DMW-SEED-0002',
        name: 'Priya Patel',
        age: 35,
        gender: 'Female',
        whatsappNumber: '9876500002',
        workingStatus: '',
        consent1: true,
        consent2: true,
        consent3: true,
        bpSystolic: 135,
        bpDiastolic: 85,
        bpCategory: 'YELLOW',
        heightCm: 162,
        weightKg: 68,
        bmiValue: 25.9,
        bmiCategory: 'RED',
        waistCm: 88,
        briValue: 8.2,
        briCategory: 'YELLOW',
        status: 'LINK_SENT',
      },
      {
        screeningId: 'DMW-SEED-0003',
        name: 'Rohan Verma',
        age: 42,
        gender: 'Male',
        whatsappNumber: '9876500003',
        workingStatus: '',
        consent1: true,
        consent2: true,
        consent3: true,
        bpSystolic: 118,
        bpDiastolic: 78,
        bpCategory: 'GREEN',
        heightCm: 178,
        weightKg: 74,
        bmiValue: 23.4,
        bmiCategory: 'GREEN',
        waistCm: 82,
        briValue: 4.2,
        briCategory: 'GREEN',
        sleepScore: 4,
        sleepCategory: 'YELLOW',
        stressScore: 3,
        stressCategory: 'GREEN',
        familyHistory: false,
        medicalHistory: false,
        finalCategory: 'GREEN',
        status: 'COMPLETED',
      },
    ],
  });
  console.log('Seeded 3 sample screenings');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
