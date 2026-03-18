import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { ArrowLeft, Info, Minus, Plus, RotateCcw, Search, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../providers/auth-provider';
import { useMemberTree, type MemberTreeResponse } from '../../features/members/api';
import type { MemberTreeNode } from '../../features/members/types';
import RegisterMemberDialog from './RegisterMemberDialog';

interface MemberCardData {
  id: string;
  name: string;
  role: string;
  rank: string;
  rankColor: string;
  avatar: string;
  status?: 'active' | 'inactive';
  leg?: 'LEFT' | 'RIGHT';
  memberId?: string;
}

interface LegMember {
  name: string;
  memberId: string;
}

type TreeNodeType = 'root' | 'branch' | 'leaf' | 'register';

type TreeNode = {
  id: string;
  parentId: string | null;
  level: number;
  position: number;
  type: TreeNodeType;
  member?: MemberCardData;
  memberRecord?: MemberTreeNode;
  sponsor?: MemberTreeNode;
  leg?: 'LEFT' | 'RIGHT';
};

const connectorColor = 'bg-slate-200 dark:bg-white/10';

type Connection = {
  id: string;
  parentId: string;
  childId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

const statusColors: Record<string, string> = {
  ACTIVE: '#2B9DEE',
  PENDING: '#FACC15',
  SUSPENDED: '#F97316',
  INACTIVE: '#94A3B8',
};

const mapMemberToCard = (member: MemberTreeNode): MemberCardData => {
  const status = member.status?.toUpperCase() ?? 'ACTIVE';
  return {
    id: member.memberId,
    name: member.fullName ?? member.memberId,
    role: member.role ?? 'Member',
    rank: status,
    rankColor: statusColors[status] ?? '#64748B',
    avatar: member.profileImage ?? '',
    status: status === 'ACTIVE' ? 'active' : 'inactive',
    leg: member.leg as 'LEFT' | 'RIGHT' | undefined,
    memberId: member.memberId,
  };
};

const buildTreeNodes = (data?: MemberTreeResponse): TreeNode[] => {
  if (!data) return [];

  const depthLimit = data.meta.depthLimit ?? 3;
  const uniqueNodes = new Map<string, MemberTreeNode>();
  uniqueNodes.set(data.root.memberId, data.root);
  data.nodes.forEach((node) => {
    uniqueNodes.set(node.memberId, node);
  });

  const childBySponsor = new Map<string, { LEFT?: MemberTreeNode; RIGHT?: MemberTreeNode }>();
  uniqueNodes.forEach((node) => {
    if (!node.sponsorId) return;
    const entry = childBySponsor.get(node.sponsorId) ?? {};
    const leg = (node.leg ?? 'LEFT') as 'LEFT' | 'RIGHT';
    entry[leg] = node;
    childBySponsor.set(node.sponsorId, entry);
  });

  const queue: { node: MemberTreeNode; level: number; position: number }[] = [{ node: data.root, level: 0, position: 0 }];
  const result: TreeNode[] = [];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current.node.memberId)) continue;
    visited.add(current.node.memberId);

    result.push({
      id: current.node.memberId,
      parentId: current.node.sponsorId ?? null,
      level: current.level,
      position: current.position,
      type: current.level === 0 ? 'root' : current.level === 1 ? 'branch' : 'leaf',
      member: mapMemberToCard(current.node),
      memberRecord: current.node,
      leg: current.node.leg as 'LEFT' | 'RIGHT' | undefined,
    });

    if (current.level + 1 > depthLimit) continue;

    const children = childBySponsor.get(current.node.memberId) ?? {};
    (['LEFT', 'RIGHT'] as const).forEach((leg) => {
      const childPosition = current.position * 2 + (leg === 'LEFT' ? 0 : 1);
      const childNode = children[leg];
      if (childNode) {
        queue.push({ node: childNode, level: current.level + 1, position: childPosition });
      } else {
        result.push({
          id: `${current.node.memberId}-${leg}-register`,
          parentId: current.node.memberId,
          level: current.level + 1,
          position: childPosition,
          type: 'register',
          sponsor: current.node,
          leg,
        });
      }
    });
  }

  return result;
};

const BinaryTreePage = () => {
  const navigate = useNavigate();
  const { member: currentMember } = useAuth();
  const [search, setSearch] = useState('');
  const [leftSummaryOpen, setLeftSummaryOpen] = useState(false);
  const [rightSummaryOpen, setRightSummaryOpen] = useState(false);
  const [collapsedLegs, setCollapsedLegs] = useState<{ left: boolean; right: boolean }>({ left: false, right: false });
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [treeSize, setTreeSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const treeContentRef = useRef<HTMLDivElement | null>(null);
  const nodesLayerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  const focusMemberId = currentMember?.role === 'ADMIN' ? 'root' : currentMember?.memberId;
  const { data: treeData, isLoading: isTreeLoading, isError: isTreeError, refetch: refetchTree } = useMemberTree(
    { memberId: focusMemberId, depth: 3 },
    Boolean(focusMemberId),
  );

  const treeNodes = useMemo(() => buildTreeNodes(treeData), [treeData]);
  const rootNode = useMemo(() => treeNodes.find((node) => node.level === 0) ?? null, [treeNodes]);
  const legNodeIds = useMemo(
    () => ({
      left: rootNode ? treeNodes.find((node) => node.parentId === rootNode.id && node.leg === 'LEFT')?.id ?? null : null,
      right: rootNode ? treeNodes.find((node) => node.parentId === rootNode.id && node.leg === 'RIGHT')?.id ?? null : null,
    }),
    [rootNode, treeNodes],
  );

  const { leftMembers, rightMembers } = useMemo(() => {
    const left: LegMember[] = [];
    const right: LegMember[] = [];
    treeNodes.forEach((node) => {
      if (!node.member || !node.leg || node.level === 0) return;
      const entry: LegMember = {
        name: node.member.name,
        memberId: node.member.memberId ?? node.member.id,
      };
      if (node.leg === 'LEFT') left.push(entry);
      if (node.leg === 'RIGHT') right.push(entry);
    });
    return { leftMembers: left.slice(0, 8), rightMembers: right.slice(0, 8) };
  }, [treeNodes]);

  const [registerDialog, setRegisterDialog] = useState<{ open: boolean; sponsor?: MemberTreeNode; leg?: 'LEFT' | 'RIGHT' }>({ open: false });
  const openRegisterDialog = (sponsor: MemberTreeNode, leg: 'LEFT' | 'RIGHT') => setRegisterDialog({ open: true, sponsor, leg });
  const closeRegisterDialog = () => setRegisterDialog((prev) => ({ ...prev, open: false }));
  const handleRegisterSuccess = () => {
    closeRegisterDialog();
    refetchTree();
  };

  const levelGroups = useMemo(() => {
    const map = new Map<number, TreeNode[]>();
    treeNodes.forEach((node) => {
      const arr = map.get(node.level) ?? [];
      arr.push(node);
      map.set(node.level, arr);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, nodes]) => [...nodes].sort((a, b) => a.position - b.position));
  }, [treeNodes]);

  const childLookup = useMemo(() => {
    const map = new Map<string, string[]>();
    treeNodes.forEach((node) => {
      if (!node.parentId) return;
      const arr = map.get(node.parentId) ?? [];
      arr.push(node.id);
      map.set(node.parentId, arr);
    });
    return map;
  }, [treeNodes]);

  const visibleNodeIds = useMemo(() => {
    const hidden = new Set<string>();
    const hideDescendants = (nodeId: string) => {
      const children = childLookup.get(nodeId);
      if (!children) return;
      children.forEach((childId) => {
        hidden.add(childId);
        hideDescendants(childId);
      });
    };

    if (collapsedLegs.left && legNodeIds.left) hideDescendants(legNodeIds.left);
    if (collapsedLegs.right && legNodeIds.right) hideDescendants(legNodeIds.right);

    return new Set(treeNodes.filter((node) => !hidden.has(node.id)).map((node) => node.id));
  }, [childLookup, collapsedLegs.left, collapsedLegs.right, legNodeIds.left, legNodeIds.right, treeNodes]);

  const visibleKey = useMemo(() => Array.from(visibleNodeIds).sort().join(','), [visibleNodeIds]);

  const updateConnections = useCallback(() => {
    if (!nodesLayerRef.current) return;
    const layerRect = nodesLayerRef.current.getBoundingClientRect();
    const nextConnections: Connection[] = [];

    treeNodes.forEach((node) => {
      if (!node.parentId) return;
      if (!visibleNodeIds.has(node.id) || !visibleNodeIds.has(node.parentId)) return;
      const childEl = nodeRefs.current[node.id];
      const parentEl = nodeRefs.current[node.parentId];
      if (!childEl || !parentEl) return;

      const childRect = childEl.getBoundingClientRect();
      const parentRect = parentEl.getBoundingClientRect();

      nextConnections.push({
        id: `${node.parentId}-${node.id}`,
        parentId: node.parentId,
        childId: node.id,
        x1: (parentRect.left + parentRect.width / 2 - layerRect.left) / scale,
        y1: (parentRect.bottom - layerRect.top) / scale,
        x2: (childRect.left + childRect.width / 2 - layerRect.left) / scale,
        y2: (childRect.top - layerRect.top) / scale,
      });
    });

    setConnections(nextConnections);

    setTreeSize({
      width: layerRect.width / scale,
      height: layerRect.height / scale,
    });
  }, [scale, translate.x, translate.y, treeNodes, visibleKey]);

  useLayoutEffect(() => {
    const update = () => requestAnimationFrame(updateConnections);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [updateConnections]);

  useEffect(() => {
    updateConnections();
  }, [updateConnections]);

  const centerTree = useCallback(() => {
    if (!viewportRef.current || !nodesLayerRef.current) return;
    const containerWidth = viewportRef.current.clientWidth;
    const baseWidth = nodesLayerRef.current.offsetWidth;
    const adjustedWidth = baseWidth * scale;
    const offsetX = (containerWidth - adjustedWidth) / 2;
    setTranslate({ x: offsetX, y: 0 });
  }, [scale]);

  useEffect(() => {
    centerTree();
  }, [centerTree, collapsedLegs.left, collapsedLegs.right, connections.length]);

  const adjustZoom = (delta: number) => {
    setScale((prev) => {
      const next = Math.max(0.6, Math.min(1.4, prev + delta));
      return Number(next.toFixed(2));
    });
  };

  const resetView = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    requestAnimationFrame(centerTree);
  };

  const handleDragStart = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    dragStateRef.current = {
      isDragging: true,
      startX: event.clientX,
      startY: event.clientY,
      originX: translate.x,
      originY: translate.y,
    };
    setIsDragging(true);
    event.preventDefault();
  };

  const handleDragMove = useCallback((event: MouseEvent) => {
    if (!dragStateRef.current.isDragging) return;
    const dx = event.clientX - dragStateRef.current.startX;
    const dy = event.clientY - dragStateRef.current.startY;
    setTranslate({
      x: dragStateRef.current.originX + dx,
      y: dragStateRef.current.originY + dy,
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!dragStateRef.current.isDragging) return;
    dragStateRef.current.isDragging = false;
    setIsDragging(false);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [handleDragEnd, handleDragMove]);

  const toggleLeg = (leg: 'left' | 'right') => {
    setCollapsedLegs((prev) => ({ ...prev, [leg]: !prev[leg] }));
  };

  const compactLegs = useMemo(
    () => [
      {
        label: 'Left Leg BV',
        value: rootNode?.memberRecord?.bv?.leftLeg?.toLocaleString() ?? '0',
        color: '#2B9DEE',
        members: leftMembers,
        expanded: leftSummaryOpen,
        toggle: () => setLeftSummaryOpen((prev) => !prev),
      },
      {
        label: 'Right Leg BV',
        value: rootNode?.memberRecord?.bv?.rightLeg?.toLocaleString() ?? '0',
        color: '#10B981',
        members: rightMembers,
        expanded: rightSummaryOpen,
        toggle: () => setRightSummaryOpen((prev) => !prev),
      },
    ],
    [leftMembers, leftSummaryOpen, rightMembers, rightSummaryOpen, rootNode?.memberRecord?.bv?.leftLeg, rootNode?.memberRecord?.bv?.rightLeg],
  );

  return (
    <div className="space-y-6 text-slate-900 dark:text-white">
      <section className="rounded-[32px] border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950 shadow-card overflow-hidden">
        <header className="border-b border-slate-100 dark:border-white/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-200"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex-1 text-center">
              <p className="text-xs uppercase text-slate-400 tracking-[0.4em]">Network</p>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Binary Tree</h1>
            </div>
            <div className="w-10" />
          </div>
          <div className="relative mt-4">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-2xl border border-transparent bg-slate-100 pl-11 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-900/40 dark:text-white"
            />
          </div>
        </header>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-primary/5 px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary dark:border-white/5">
          <span className="inline-flex items-center gap-2">
            <Info size={14} /> Tap a member to view details
          </span>
          <div className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-600 shadow-sm dark:bg-white/10 dark:text-white">
            <button
              type="button"
              onClick={() => adjustZoom(-0.1)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-white"
              aria-label="Zoom out"
            >
              <Minus size={14} />
            </button>
            <span className="min-w-[48px] text-center">{Math.round(scale * 100)}%</span>
            <button
              type="button"
              onClick={() => adjustZoom(0.1)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-white"
              aria-label="Zoom in"
            >
              <Plus size={14} />
            </button>
            <button
              type="button"
              onClick={resetView}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-white"
              aria-label="Center tree"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-card dark:border-white/5 dark:bg-slate-950">
        {isTreeLoading && (
          <div className="flex min-h-[240px] items-center justify-center text-sm text-slate-400">Loading binary tree…</div>
        )}

        {!isTreeLoading && isTreeError && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-rose-200/70 bg-rose-50/60 p-6 text-center text-rose-500 dark:border-rose-400/40 dark:bg-rose-400/10">
            <p className="font-semibold">Unable to load binary tree.</p>
            <button
              type="button"
              onClick={() => refetchTree()}
              className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-card"
            >
              Retry
            </button>
          </div>
        )}

        {!isTreeLoading && !isTreeError && treeNodes.length === 0 && (
          <div className="flex min-h-[240px] flex-col items-center justify-center gap-2 text-center text-sm text-slate-500 dark:text-slate-300">
            <p>No tree data available for this account.</p>
            <p className="text-xs text-slate-400">Please add members to view the network.</p>
          </div>
        )}

        {!isTreeLoading && !isTreeError && treeNodes.length > 0 && (
          <div ref={viewportRef} className="overflow-hidden">
            <div className="flex min-w-[360px] justify-center">
              <div
                ref={treeContentRef}
                className={`relative inline-block select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={handleDragStart}
              >
                <div
                  className="relative"
                  style={{ transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`, transformOrigin: 'center top' }}
                >
                  <div ref={nodesLayerRef} className="relative flex flex-col items-center gap-10 px-6 py-8">
                    {levelGroups.map((nodes, levelIndex) => {
                      const level = nodes[0]?.level ?? levelIndex;
                      const columns = Math.max(1, 2 ** level);
                      return (
                        <div
                          key={levelIndex}
                          className="grid gap-8 w-full"
                          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
                        >
                          {nodes
                            .filter((node) => visibleNodeIds.has(node.id))
                            .map((node) => (
                              <div
                                key={node.id}
                                ref={(el) => {
                                  nodeRefs.current[node.id] = el;
                                }}
                                onMouseEnter={() => setHoveredNode(node.id)}
                                onMouseLeave={() => setHoveredNode(null)}
                                className="flex justify-center"
                                style={{ gridColumnStart: node.position + 1 }}
                              >
                                {renderNode(node, collapsedLegs, toggleLeg, openRegisterDialog)}
                              </div>
                            ))}
                        </div>
                      );
                    })}
                  </div>

                  {treeSize.width > 0 && treeSize.height > 0 && (
                    <svg
                      className="pointer-events-none absolute inset-0"
                      width={treeSize.width}
                      height={treeSize.height}
                      viewBox={`0 0 ${treeSize.width} ${treeSize.height}`}
                      style={{ width: treeSize.width, height: treeSize.height }}
                    >
                      {connections.map((connection) => {
                        const isActive = hoveredNode && (hoveredNode === connection.childId || hoveredNode === connection.parentId);
                        return (
                          <line
                            key={connection.id}
                            x1={connection.x1}
                            y1={connection.y1}
                            x2={connection.x2}
                            y2={connection.y2}
                            stroke={isActive ? '#f97316' : 'rgba(148,163,184,0.65)'}
                            strokeWidth={isActive ? 3 : 2}
                            strokeLinecap="round"
                            className="transition-all duration-200"
                          />
                        );
                      })}
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10">
          <SummaryPanel
            compactLegs={compactLegs}
            leftMembers={leftMembers}
            rightMembers={rightMembers}
            leftExpanded={leftSummaryOpen}
            rightExpanded={rightSummaryOpen}
            onToggleLeft={() => setLeftSummaryOpen((prev) => !prev)}
            onToggleRight={() => setRightSummaryOpen((prev) => !prev)}
          />
        </div>
      </section>

      <RegisterMemberDialog
        open={registerDialog.open}
        sponsor={registerDialog.sponsor}
        leg={registerDialog.leg}
        onClose={closeRegisterDialog}
        onSuccess={handleRegisterSuccess}
      />
    </div>
  );
};

const renderNode = (
  node: TreeNode,
  collapsedLegs: { left: boolean; right: boolean },
  toggleLeg: (leg: 'left' | 'right') => void,
  openRegisterDialog: (sponsor: MemberTreeNode, leg: 'LEFT' | 'RIGHT') => void,
) => {
  if (node.type === 'root' && node.member) {
    return <RootCard member={node.member} />;
  }

  if (node.type === 'branch' && node.member) {
    const legKey = (node.leg?.toLowerCase() as 'left' | 'right') ?? undefined;
    const isCollapsed = legKey ? collapsedLegs[legKey] : false;
    return (
      <div className="relative">
        {legKey && (
          <button
            type="button"
            onClick={() => toggleLeg(legKey)}
            className="absolute -top-3 -right-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900 dark:text-white"
            aria-label={isCollapsed ? 'Expand leg' : 'Collapse leg'}
          >
            <span className={`text-xs font-semibold ${isCollapsed ? '' : 'rotate-90'} transition`}>{isCollapsed ? '+' : '−'}</span>
          </button>
        )}
        <MainMemberCard member={node.member} />
      </div>
    );
  }

  if (node.type === 'leaf' && node.member) {
    return <MiniMemberCard member={node.member} />;
  }

  if (node.type === 'register') {
    const disabled = !node.sponsor || !node.leg;
    return (
      <RegisterSlot
        disabled={disabled}
        onClick={() => {
          if (node.sponsor && node.leg) {
            openRegisterDialog(node.sponsor, node.leg);
          }
        }}
      />
    );
  }

  return null;
};

const Connector = ({ height = '24px' }: { height?: string }) => (
  <div className={`${connectorColor} w-0.5`} style={{ height }} />
);

const RootCard = ({ member }: { member: MemberCardData }) => (
  <div
    className="w-64 rounded-[28px] border-2 p-6 text-center shadow-lg"
    style={{ borderColor: member.rankColor, boxShadow: `0 18px 40px ${member.rankColor}2b` }}
  >
    <div className="inline-flex items-center justify-center rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white" style={{ backgroundColor: member.rankColor }}>
      Root
    </div>
    <div className="mt-4 flex flex-col items-center gap-2">
      <AvatarImage src={member.avatar} size={72} ringColor={member.rankColor} />
      <div>
        <p className="text-lg font-semibold">{member.name}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{member.role}</p>
      </div>
      <RankBadge label={member.rank} color={member.rankColor} />
    </div>
  </div>
);

const AvatarImage = ({ src, size, ringColor }: { src: string; size: number; ringColor?: string }) => (
  <div className="rounded-full border-2 p-1" style={{ borderColor: ringColor ?? 'rgba(148,163,184,0.4)' }}>
    {src ? (
      <img src={src} alt="Avatar" className="rounded-full object-cover" style={{ width: size - 10, height: size - 10 }} />
    ) : (
      <div className="rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-400" style={{ width: size - 10, height: size - 10 }}>
        N/A
      </div>
    )}
  </div>
);

const RankBadge = ({ label, color }: { label: string; color: string }) => (
  <span
    className="inline-flex items-center rounded-full px-4 py-1 text-[11px] font-semibold tracking-[0.2em]"
    style={{ color, backgroundColor: `${color}1A` }}
  >
    {label}
  </span>
);

const MainMemberCard = ({ member }: { member: MemberCardData }) => {
  console.log(member); 
  return (  
  <button
    type="button"
    className="w-44 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 p-4 text-center shadow-card"
  >
    <img src={member.avatar} alt={member.name} className="mx-auto h-12 w-12 rounded-full object-cover" />
    <p className="mt-3 font-semibold">{member.name}</p>
    <p className="text-sm text-slate-500 dark:text-slate-400">{member.role}</p>
    <div className="mt-2">
      <RankBadge label={member.rank} color={member.rankColor} />
    </div>
    <div className="mt-3 inline-flex items-center justify-center gap-2 text-[11px] font-semibold text-emerald-500">
      <span className="h-2 w-2 rounded-full bg-emerald-500" /> {member.status?.toUpperCase()}
    </div>
  </button>
  )
};

const MiniMemberCard = ({ member }: { member: MemberCardData }) => (
  <button
    type="button"
    className="w-28 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-3 text-center shadow-card"
  >
    <img src={member.avatar} alt={member.name} className="mx-auto h-10 w-10 rounded-full object-cover" />
    <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white" title={member.name}>
      {member.name}
    </p>
    <p className="text-xs text-slate-500 dark:text-slate-400">{member.rank}</p>
  </button>
);

const RegisterSlot = ({ disabled, onClick }: { disabled?: boolean; onClick?: () => void }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`flex h-28 w-28 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-primary/60 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent text-primary shadow-card transition ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:shadow-lg'
    }`}
  >
    <UserPlus size={24} />
    <span className="text-[11px] font-semibold uppercase tracking-widest">Register</span>
  </button>
);

interface SummaryPanelProps {
  compactLegs: {
    label: string;
    value: string;
    color: string;
    members: LegMember[];
    expanded: boolean;
    toggle: () => void;
  }[];
  leftMembers: LegMember[];
  rightMembers: LegMember[];
  leftExpanded: boolean;
  rightExpanded: boolean;
  onToggleLeft: () => void;
  onToggleRight: () => void;
}

const SummaryPanel = ({ compactLegs, leftMembers, rightMembers, leftExpanded, rightExpanded, onToggleLeft, onToggleRight }: SummaryPanelProps) => (
  <div className="w-full space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-inner dark:border-white/10 dark:bg-slate-900">
    <div className="grid gap-6 lg:grid-cols-2">
      <LegSummaryColumn
        label="Left Leg BV"
        value="12,450"
        color="#2B9DEE"
        members={leftMembers}
        align="start"
        expanded={leftExpanded}
        onToggle={onToggleLeft}
      />
      <LegSummaryColumn
        label="Right Leg BV"
        value="8,920"
        color="#10B981"
        members={rightMembers}
        align="end"
        expanded={rightExpanded}
        onToggle={onToggleRight}
      />
    </div>
    <div className="grid gap-4 lg:hidden">
      {compactLegs.map((leg) => (
        <LegDropdown key={leg.label} {...leg} />
      ))}
    </div>
  </div>
);

const LegSummaryColumn = ({
  label,
  value,
  color,
  members,
  align,
  expanded,
  onToggle,
}: {
  label: string;
  value: string;
  color: string;
  members: LegMember[];
  align: 'start' | 'end';
  expanded: boolean;
  onToggle: () => void;
}) => (
  <div className={`hidden lg:flex flex-col ${align === 'end' ? 'items-end' : 'items-start'}`}>
    <button onClick={onToggle} className="flex items-center gap-2 text-left">
      {align === 'start' ? null : <Chevron expanded={expanded} color={color} />}
      <SummaryTile label={label} value={value} color={color} />
      {align === 'start' ? <Chevron expanded={expanded} color={color} /> : null}
    </button>
    {expanded && (
      <div className="mt-4 max-w-sm">
        <LegGrid title={label.includes('Left') ? 'Left Leg' : 'Right Leg'} color={color} members={members} />
      </div>
    )}
  </div>
);

const Chevron = ({ expanded, color }: { expanded: boolean; color: string }) => (
  <div
    className="flex h-8 w-8 items-center justify-center rounded-full border"
    style={{ borderColor: color, color }}
  >
    <svg
      className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
    </svg>
  </div>
);

const SummaryTile = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color }}>{label}</p>
    <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
  </div>
);

const LegGrid = ({ title, color, members }: { title: string; color: string; members: LegMember[] }) => (
  <div>
    <p className="text-sm font-semibold" style={{ color }}>
      {title}
    </p>
    <div className="mt-3 grid grid-cols-2 gap-3">
      {members.map((member) => (
        <div key={member.memberId ?? member.name} className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ backgroundColor: `${color}14` }}>
          <div className="h-8 w-8 rounded-full bg-white text-center font-semibold text-sm" style={{ color }}>
            {getInitials(member.name)}
          </div>
          <span className="text-xs font-semibold text-slate-700 dark:text-white">{member.name}</span>
        </div>
      ))}
    </div>
  </div>
);

interface LegDropdownConfig {
  label: string;
  value: string;
  color: string;
  members: LegMember[];
  expanded: boolean;
  toggle: () => void;
}

const LegDropdown = ({ label, value, color, members, expanded, toggle }: LegDropdownConfig) => (
  <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-4">
    <button className="flex w-full items-center justify-between" onClick={toggle}>
      <SummaryTile label={label} value={value} color={color} />
      <svg
        className={`h-5 w-5 text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
      </svg>
    </button>
    {expanded && (
      <div className="mt-4">
        <LegGrid title={label.includes('Left') ? 'Left Leg' : 'Right Leg'} color={color} members={members} />
      </div>
    )}
  </div>
);

const getInitials = (value: string) => {
  const parts = value.trim().split(' ');
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '';
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

export default BinaryTreePage;
