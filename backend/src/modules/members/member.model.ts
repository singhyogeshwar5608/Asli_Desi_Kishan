import { Schema, model, type Document, type Types } from 'mongoose';

export type MemberRole = 'ADMIN' | 'MEMBER';
export type MemberStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';
export type MemberLeg = 'LEFT' | 'RIGHT';

export interface MemberDocument extends Document {
  memberId: string;
  sponsorId?: Types.ObjectId | null;
  leg?: MemberLeg | null;
  placementPath: string;
  depth: number;
  fullName: string;
  email: string;
  phone?: string;
  role: MemberRole;
  passwordHash: string;
  status: MemberStatus;
  wallet: {
    balance: number;
    totalEarned: number;
  };
  bv: {
    total: number;
    leftLeg: number;
    rightLeg: number;
    carryForwardLeft: number;
    carryForwardRight: number;
  };
  stats: {
    teamSize: number;
    directRefs: number;
    lastLoginAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema(
  {
    balance: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
  },
  { _id: false }
);

const BvSchema = new Schema(
  {
    total: { type: Number, default: 0 },
    leftLeg: { type: Number, default: 0 },
    rightLeg: { type: Number, default: 0 },
    carryForwardLeft: { type: Number, default: 0 },
    carryForwardRight: { type: Number, default: 0 },
  },
  { _id: false }
);

const StatsSchema = new Schema(
  {
    teamSize: { type: Number, default: 0 },
    directRefs: { type: Number, default: 0 },
    lastLoginAt: { type: Date },
  },
  { _id: false }
);

const MemberSchema = new Schema<MemberDocument>(
  {
    memberId: { type: String, required: true},
    sponsorId: { type: Schema.Types.ObjectId, ref: 'Member', default: null },
    leg: { type: String, enum: ['LEFT', 'RIGHT'], default: null },
    placementPath: { type: String, required: true},
    depth: { type: Number, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    role: { type: String, enum: ['ADMIN', 'MEMBER'], default: 'MEMBER' },
    passwordHash: { type: String, required: true },
    status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'PENDING'], default: 'ACTIVE' },
    wallet: { type: WalletSchema, default: () => ({}) },
    bv: { type: BvSchema, default: () => ({}) },
    stats: { type: StatsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

const transformDocument = (_doc: unknown, ret: Record<string, any>) => {
  if (ret._id) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
  if (typeof ret.passwordHash !== 'undefined') {
    delete ret.passwordHash;
  }
  return ret;
};

MemberSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: transformDocument,
});

MemberSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: transformDocument,
});

MemberSchema.index({ memberId: 1 }, { unique: true });
MemberSchema.index({ sponsorId: 1 });
MemberSchema.index({ placementPath: 1 });
MemberSchema.index({ depth: 1, status: 1 });

export const MemberModel = model<MemberDocument>('Member', MemberSchema);
