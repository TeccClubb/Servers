const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      role: 'ADMIN'
    },
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      hashedPassword,
      role: 'ADMIN'
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
      domain: 'canada.tecclubx.com',
      username: 'root',
      password: 'hassan',
      privateKey: 'Yes',
      provider: 'LeaseWeb',
      apps: 'GShield & Safe Pro',
      status: 'UNKNOWN'
    },
    {
      name: 'Germany-Frankfurt',
      ip: '83.219.249.252',
      country: 'DE',
      domain: 'german.tecclubx.com',
      username: 'root',
      password: 'n7CDlxCsZ8bX5f',
      privateKey: 'Yes',
      provider: 'Hip Hosting',
      apps: 'GShield & Safe Pro',
      status: 'UNKNOWN'
    },
    {
      name: 'Salt Lake',
      ip: '192.166.82.67',
      country: 'US',
      domain: 'salt.tecclubx.com',
      username: 'root',
      password: 'sn8A0f*0',
      privateKey: 'Yes',
      provider: 'CloudBlast',
      apps: 'GShield & Safe Pro',
      status: 'UNKNOWN'
    },
    {
      name: 'Amsterdam',
      ip: '151.242.2.119',
      country: 'NL',
      domain: 'nl-1.tecclubx.com',
      username: 'root',
      password: 'C^iz5eu!',
      privateKey: 'Yes',
      provider: 'CloudBlast',
      apps: 'GShield & Safe Pro',
      status: 'UNKNOWN'
    },
    {
      name: 'HongKong-1',
      ip: '205.198.85.245',
      country: 'HK',
      domain: 'hongkong.safeprovpn.com',
      username: 'root',
      password: 'W7XH0u!F',
      privateKey: 'Yes',
      provider: 'Nube.sh',
      apps: 'GShield & Safe Pro',
      status: 'UNKNOWN'
    },
    {
      name: 'Kansas',
      ip: '93.127.133.21',
      country: 'US',
      domain: 'america.gshieldvpn.com',
      username: 'root',
      password: 'GShield12@',
      privateKey: 'No',
      provider: 'VPS Mart',
      apps: 'GShield & Safe Pro',
      status: 'UNKNOWN'
    },
    {
      name: 'Singapore',
      ip: '205.198.86.48',
      country: 'SG',
      domain: 'singa.safeprovpn.com',
      username: 'root',
      password: 'T3t7jb&Q',
      privateKey: 'Yes',
      provider: 'Nube.sh',
      apps: 'GShield & Safe Pro',
      status: 'UNKNOWN'
    },
    {
      name: 'Tokyo-1',
      ip: '205.198.89.190',
      country: 'JP',
      domain: 'tokyo.safeprovpn.com',
      username: 'root',
      password: '',
      privateKey: 'Yes',
      provider: 'Nube.sh',
      apps: 'GShield & Safe Pro',
      status: 'UNKNOWN'
    },
    {
      name: 'Miami',
      ip: '193.106.248.94',
      country: 'US',
      domain: 'miami.safeprovpn.com',
      username: 'root',
      password: 'Later Do',
      privateKey: 'No',
      provider: 'Inet.ws',
      apps: 'GShield & Safe Pro',
      status: 'UNKNOWN'
    },
    {
      name: 'Hong Kong',
      ip: '103.69.128.249',
      country: 'HK',
      domain: 'hongkong.gshieldvpn.com',
      username: 'root',
      password: 'Later Do',
      privateKey: 'Yes',
      provider: 'HostHatch',
      apps: 'GShield & Safe Pro',
      status: 'UNKNOWN'
    },
    {
      name: 'Sydney',
      ip: '194.29.100.152',
      country: 'AU',
      domain: 'aus.gshieldvpn.com',
      username: 'root',
      password: 'Later Do',
      privateKey: 'Yes',
      provider: 'HostHatch',
      apps: 'GShield & Safe Pro',
      status: 'UNKNOWN'
    },
    {
      name: 'New Jersey',
      ip: '31.169.125.194',
      country: 'US',
      domain: 'usa2.gshieldvpn.com',
      username: 'root',
      password: 'SSH Only',
      privateKey: 'Yes',
      provider: 'Hip Hosting',
      apps: 'GShield & Safe Pro',
      status: 'UNKNOWN'
    },
    {
      name: 'Moscow',
      ip: '194.226.121.57',
      country: 'RU',
      domain: 'russia.gshieldvpn.com',
      username: 'root',
      password: 'kD10mSl07nfF2G',
      privateKey: 'No',
      provider: 'Hip Hosting',
      apps: 'GShield & Safe Pro',
      status: 'UNKNOWN'
    },
    {
      name: 'Warsaw',
      ip: '31.169.126.157',
      country: 'PL',
      domain: 'poland.gshieldvpn.com',
      username: 'root',
      password: 'kD6tiUgUaPL0HB',
      privateKey: 'No',
      provider: 'Hip Hosting',
      apps: 'GShield & Safe Pro',
      status: 'UNKNOWN'
    },
    {
      name: 'Sweden',
      ip: '41.216.182.109',
      country: 'SE',
      domain: 'sweden.gshieldvpn.com',
      username: 'root',
      password: 'uU03oXLgcKrrBh',
      privateKey: 'No',
      provider: 'Hip Hosting',
      apps: 'GShield & Safe Pro',
      status: 'UNKNOWN'
    },
    {
      name: 'London',
      ip: '149.7.16.43',
      country: 'GB',
      domain: 'ukgt.gshieldvpn.com',
      username: 'root',
      password: 'TecClub12@',
      privateKey: 'No',
      provider: 'GT Host',
      apps: 'GShield & Safe Pro',
      status: 'UNKNOWN'
    },
    {
      name: 'NuremBerg',
      ip: '157.90.121.232',
      country: 'DE',
      domain: 'german.tecclubb.com',
      username: 'root',
      password: 'SSH Only',
      privateKey: 'Yes',
      provider: 'Hetzner',
      apps: 'GShield & Safe Pro',
      status: 'UNKNOWN'
    },
    {
      name: 'Finland',
      ip: '135.181.41.198',
      country: 'FI',
      domain: 'finland.appapistec.xyz',
      username: 'root',
      password: 'SSH Only',
      privateKey: 'Yes',
      provider: 'Hetzner',
      apps: 'GShield & Safe Pro',
      status: 'UNKNOWN'
    },
    {
      name: 'Paris',
      ip: '188.92.28.252',
      country: 'FR',
      domain: 'france1.gshieldvpn.com',
      username: 'root',
      password: '1tLgmiCCaoalTP',
      privateKey: 'No',
      provider: 'Hip Hosting',
      apps: 'GShield & Safe Pro',
      status: 'UNKNOWN'
    },
    {
      name: 'Millan',
      ip: '45.92.70.51',
      country: 'IT',
      domain: 'it-1.tecclubx.com',
      username: 'root',
      password: 'TecClubHSFU12@',
      privateKey: 'No',
      provider: 'Gcore',
      apps: 'GShield & Safe Pro',
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
        domain: serverData.domain,
        username: serverData.username,
        password: serverData.password,
        privateKey: serverData.privateKey,
        provider: serverData.provider,
        apps: serverData.apps,
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