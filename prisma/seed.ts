import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      hashedPassword,
    },
  });
  
  console.log('Created test user:', user);

  // Create real servers from the provided list
  console.log('Creating VPS servers...');
  
  const serversList = [
    {
      name: 'Canada',
      ip: '184.107.141.136',
      country: 'CA',
      username: 'root',
      password: 'hassan',
      privateKey: 'Yes',
      status: 'UNKNOWN'
    },
    {
      name: 'Germany-Frankfurt',
      ip: '83.219.249.252',
      country: 'DE',
      username: 'root',
      password: 'n7CDlxCsZ8bX5f',
      privateKey: 'Yes',
      status: 'UNKNOWN'
    },
    {
      name: 'Salt Lake',
      ip: '192.166.82.67',
      country: 'US',
      username: 'root',
      password: 'sn8A0f*0',
      privateKey: 'Yes',
      status: 'UNKNOWN'
    },
    {
      name: 'Amsterdam',
      ip: '151.242.2.119',
      country: 'NL',
      username: 'root',
      password: 'C^iz5eu!',
      privateKey: 'Yes',
      status: 'UNKNOWN'
    },
    {
      name: 'HongKong-1',
      ip: '205.198.85.245',
      country: 'HK',
      username: 'root',
      password: 'W7XH0u!F',
      privateKey: 'Yes',
      status: 'UNKNOWN'
    },
    {
      name: 'Kansas',
      ip: '93.127.133.21',
      country: 'US',
      username: 'root',
      password: 'GShield12@',
      privateKey: 'No',
      status: 'UNKNOWN'
    },
    {
      name: 'Singapore',
      ip: '205.198.86.48',
      country: 'SG',
      username: 'root',
      password: 'T3t7jb&Q',
      privateKey: 'Yes',
      status: 'UNKNOWN'
    },
    {
      name: 'Tokyo-1',
      ip: '205.198.89.190',
      country: 'JP',
      username: 'root',
      password: '',
      privateKey: 'Yes',
      status: 'UNKNOWN'
    },
    {
      name: 'Miami',
      ip: '193.106.248.94',
      country: 'US',
      username: 'root',
      password: 'Later Do',
      privateKey: 'No',
      status: 'UNKNOWN'
    },
    {
      name: 'Hong Kong',
      ip: '103.69.128.249',
      country: 'HK',
      username: 'root',
      password: 'Later Do',
      privateKey: 'Yes',
      status: 'UNKNOWN'
    },
    {
      name: 'Sydney',
      ip: '194.29.100.152',
      country: 'AU',
      username: 'root',
      password: 'Later Do',
      privateKey: 'Yes',
      status: 'UNKNOWN'
    },
    {
      name: 'New Jersey',
      ip: '31.169.125.194',
      country: 'US',
      username: 'root',
      password: 'SSH Only',
      privateKey: 'Yes',
      status: 'UNKNOWN'
    },
    {
      name: 'Moscow',
      ip: '194.226.121.57',
      country: 'RU',
      username: 'root',
      password: 'kD10mSl07nfF2G',
      privateKey: 'No',
      status: 'UNKNOWN'
    },
    {
      name: 'Warsaw',
      ip: '31.169.126.157',
      country: 'PL',
      username: 'root',
      password: 'kD6tiUgUaPL0HB',
      privateKey: 'No',
      status: 'UNKNOWN'
    },
    {
      name: 'Sweden',
      ip: '41.216.182.109',
      country: 'SE',
      username: 'root',
      password: 'uU03oXLgcKrrBh',
      privateKey: 'No',
      status: 'UNKNOWN'
    },
    {
      name: 'London',
      ip: '149.7.16.43',
      country: 'GB',
      username: 'root',
      password: 'TecClub12@',
      privateKey: 'No',
      status: 'UNKNOWN'
    },
    {
      name: 'NuremBerg',
      ip: '157.90.121.232',
      country: 'DE',
      username: 'root',
      password: 'SSH Only',
      privateKey: 'Yes',
      status: 'UNKNOWN'
    },
    {
      name: 'Finland',
      ip: '135.181.41.198',
      country: 'FI',
      username: 'root',
      password: 'SSH Only',
      privateKey: 'Yes',
      status: 'UNKNOWN'
    },
    {
      name: 'Paris',
      ip: '188.92.28.252',
      country: 'FR',
      username: 'root',
      password: '1tLgmiCCaoalTP',
      privateKey: 'No',
      status: 'UNKNOWN'
    },
    {
      name: 'Millan',
      ip: '45.92.70.51',
      country: 'IT',
      username: 'root',
      password: 'TecClubHSFU12@',
      privateKey: 'No',
      status: 'UNKNOWN'
    }
  ];
  
  // Create each server
  for (const serverData of serversList) {
    await prisma.server.create({
      data: {
        name: serverData.name,
        ip: serverData.ip,
        country: serverData.country,
        username: serverData.username,
        password: serverData.password,
        privateKey: serverData.privateKey,
        status: serverData.status,
        lastChecked: new Date(),
      }
    });
  }

  console.log(`Created ${serversList.length} servers successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });