import { Types } from "mongoose";

interface PaymentDoc {
  amount: number;
  status: "pending" | "approved" | "rejected";
}

interface UserLean {
  _id: Types.ObjectId;
  parentId: Types.ObjectId | null;
  payments: PaymentDoc[];
  [key: string]: any;
}

export interface TreeNode {
  _id: Types.ObjectId;
  parentId: Types.ObjectId | null;
  children: TreeNode[];
  personalInvestment: number;
  downlineInvestment: number;
  branchInvestment: number;
}

export function buildTree(users: UserLean[]) {
  const map: Record<string, TreeNode> = {};

  users.forEach((u) => {
    const approvedTotal = (u.payments || [])
      .filter((p) => p.status === "approved")
      .reduce((sum, p) => sum + p.amount, 0);

    map[u._id.toString()] = {
      _id: u._id,
      parentId: u.parentId,
      children: [],
      personalInvestment: approvedTotal,
      downlineInvestment: 0,
      branchInvestment: 0,
    };
  });

  const roots: TreeNode[] = [];
  users.forEach((u) => {
    const node = map[u._id.toString()];
    if (u.parentId && map[u.parentId.toString()]) {
      map[u.parentId.toString()].children.push(node);
    } else {
      roots.push(node);
    }
  });

  return { map, roots };
}

export function computeBranchInvestment(node: TreeNode): number {
  let downlineSum = 0;
  for (const child of node.children) {
    downlineSum += computeBranchInvestment(child);
  }
  node.downlineInvestment = downlineSum;
  node.branchInvestment = node.personalInvestment + downlineSum;
  return node.branchInvestment;
}

// Per-root level grouping — har root ka apna independent subtree.
// Ek user ka level-ratio kabhi doosre unrelated root ke totals se
// contaminate nahi hoga.
export function groupByLevelForRoot(root: TreeNode): Record<number, TreeNode[]> {
  const levels: Record<number, TreeNode[]> = {};

  function traverse(node: TreeNode, level: number) {
    if (level > 0) {
      if (!levels[level]) levels[level] = [];
      levels[level].push(node);
    }
    node.children.forEach((child) => traverse(child, level + 1));
  }

  traverse(root, 0);
  return levels;
}

// Deprecated — global mixing wala purana behavior. Naye code me
// isko distribution ke liye use mat karo, sirf backward-compat ke liye rakha hai.
export function groupByLevel(roots: TreeNode[]): Record<number, TreeNode[]> {
  const levels: Record<number, TreeNode[]> = {};
  function traverse(node: TreeNode, level: number) {
    if (level > 0) {
      if (!levels[level]) levels[level] = [];
      levels[level].push(node);
    }
    node.children.forEach((child) => traverse(child, level + 1));
  }
  roots.forEach((root) => traverse(root, 0));
  return levels;
}

export function findNodeById(
  map: Record<string, TreeNode>,
  id: string
): TreeNode | undefined {
  return map[id];
}