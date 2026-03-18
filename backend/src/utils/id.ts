import { v4 as uuidv4 } from 'uuid';

export const generateMemberId = () => {
  const short = uuidv4().split('-')[0].toUpperCase();
  return `MBR-${short}`;
};
