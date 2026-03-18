import { memo, useMemo } from 'react';

const getInitials = (name = '') => {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

const TreeNodeComponent = ({ node, depth = 0, selectedId, expandedIds, onSelect, onToggle }) => {
  if (!node) return null;

  const initials = useMemo(() => getInitials(node.name), [node.name]);
  const hasChildren = Boolean(node.left || node.right);
  const isExpanded = expandedIds?.has(node.id);
  const isSelected = selectedId === node.id;

  const handleClick = (event) => {
    event.stopPropagation();
    onSelect?.(node);
  };

  const handleDoubleClick = (event) => {
    event.stopPropagation();
    if (hasChildren) {
      onToggle?.(node.id);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleClick(event);
    }
    if (event.key === ' ') {
      event.preventDefault();
      handleDoubleClick(event);
    }
  };

  return (
    <div className="tree-node">
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        title={hasChildren ? 'Double click to expand or collapse' : 'Leaf member'}
        className={`w-60 rounded-[24px] border bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950 p-5 shadow-card cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-900 ${
          node.active ? 'border-emerald-200/70' : 'border-rose-200/70'
        } ${isSelected ? 'ring-2 ring-primary/60' : 'ring-1 ring-slate-100/40 dark:ring-white/5'}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold flex items-center justify-center overflow-hidden">
              {node.avatar ? (
                <img src={node.avatar} alt={`${node.name} avatar`} className="h-full w-full object-cover" />
              ) : (
                <span>{initials || '?'}</span>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{node.userId}</p>
              <p className="text-base font-semibold text-slate-900 dark:text-white">{node.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">@{node.username}</p>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
              node.active
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'
                : 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-200'
            }`}
          >
            {node.active ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500 dark:text-slate-300">
          <div>
            <p className="uppercase text-[10px] text-slate-400">Left team</p>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">{node.stats?.leftTeam ?? 0}</p>
          </div>
          <div>
            <p className="uppercase text-[10px] text-slate-400">Right team</p>
            <p className="text-sm font-semibold text-fuchsia-600 dark:text-fuchsia-300">{node.stats?.rightTeam ?? 0}</p>
          </div>
          <div>
            <p className="uppercase text-[10px] text-slate-400">Rank</p>
            <p className="font-semibold text-slate-900 dark:text-white">{node.rank}</p>
          </div>
          <div>
            <p className="uppercase text-[10px] text-slate-400">Level</p>
            <p className="font-semibold text-slate-900 dark:text-white">{node.level}</p>
          </div>
        </div>

        {hasChildren ? (
          <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{node.stats?.downline ?? 0} in downline</span>
            <span className="text-primary font-semibold">
              {isExpanded ? 'Collapse branch' : 'Expand branch'}
            </span>
          </div>
        ) : (
          <div className="mt-4 text-[11px] text-slate-400">Leaf node</div>
        )}
      </div>

      {hasChildren && isExpanded ? (
        <div className="tree-children">
          <svg className="tree-connector" viewBox="0 0 240 60" preserveAspectRatio="none">
            {node.left ? <path d="M120 5 C 100 20 80 40 60 60" /> : null}
            {node.right ? <path d="M120 5 C 140 20 160 40 180 60" /> : null}
          </svg>
          <div className="tree-children-nodes">
            {node.left ? (
              <TreeNodeComponent
                key={node.left.id}
                node={node.left}
                depth={depth + 1}
                selectedId={selectedId}
                expandedIds={expandedIds}
                onSelect={onSelect}
                onToggle={onToggle}
              />
            ) : (
              <div className="tree-node-placeholder" />
            )}
            {node.right ? (
              <TreeNodeComponent
                key={node.right.id}
                node={node.right}
                depth={depth + 1}
                selectedId={selectedId}
                expandedIds={expandedIds}
                onSelect={onSelect}
                onToggle={onToggle}
              />
            ) : (
              <div className="tree-node-placeholder" />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const TreeNode = memo(TreeNodeComponent);

export { TreeNode };
