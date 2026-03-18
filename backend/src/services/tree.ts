import { MemberLeg } from '@modules/members/member.model';

const ROOT_PATH = 'root';

const buildChildSegment = (leg: MemberLeg) => (leg === 'LEFT' ? 'L' : 'R');

export const TreeService = {
  rootPath: () => ROOT_PATH,
  childPath: (parentPath: string, leg: MemberLeg) => `${parentPath}.${buildChildSegment(leg)}`,
  depthFromPath: (path: string) => path.split('.').length - 1,
  isAncestor: (ancestorPath: string, testPath: string) => testPath.startsWith(`${ancestorPath}`),
  escapePathRegex: (path: string) => path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
};
