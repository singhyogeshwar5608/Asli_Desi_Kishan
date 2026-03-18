import { connectDb, disconnectDb } from '@config/database';
import { MemberModel } from '@modules/members/member.model';
import { PasswordService } from '@services/password';
import { TreeService } from '@services/tree';
import { generateMemberId } from '@utils/id';

const SEED_ADMIN = {
  fullName: 'Admin',
  email: 'admin@mlm.com',
  password: 'Admin@123',
};

export const seedAdmin = async () => {

  const existing = await MemberModel.findOne({ email: SEED_ADMIN.email.toLowerCase() });
  if (existing) {
    console.log('✅ Seed admin already exists. Use these credentials to login:');
    console.log(`  Email: ${SEED_ADMIN.email}`);
    console.log(`  Password: ${SEED_ADMIN.password}`);
    return;
  }

  const passwordHash = await PasswordService.hash(SEED_ADMIN.password);

  const admin = await MemberModel.create({
    memberId: generateMemberId(),
    sponsorId: null,
    leg: null,
    placementPath: TreeService.rootPath(),
    depth: 0,
    fullName: SEED_ADMIN.fullName,
    email: SEED_ADMIN.email.toLowerCase(),
    role: 'ADMIN',
    passwordHash,
    status: 'ACTIVE',
    wallet: { balance: 0, totalEarned: 0 },
    bv: { total: 0, leftLeg: 0, rightLeg: 0, carryForwardLeft: 0, carryForwardRight: 0 },
    stats: { teamSize: 0, directRefs: 0 },
  });

  console.log('🎉 Seed admin created successfully!');
  console.log(`  Member ID: ${admin.memberId}`);
  console.log(`  Email: ${SEED_ADMIN.email}`);
  console.log(`  Password: ${SEED_ADMIN.password}`);
};
