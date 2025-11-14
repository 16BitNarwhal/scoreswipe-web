import type { Folder } from '@/lib/models/folder';

const normalizeId = (value: string | null | undefined) => (value ?? null);

export const getFolderAncestors = (folders: Folder[], folderId: string | null) => {
  if (!folderId) return [] as Folder[];
  const map = new Map(folders.map((folder) => [folder.id, folder] as const));
  const path: Folder[] = [];
  let current = map.get(folderId) ?? null;
  while (current) {
    path.unshift(current);
    current = current.parentId ? map.get(current.parentId) ?? null : null;
  }
  return path;
};

export const getFolderTree = (
  folders: Folder[],
  parentId: string | null = null,
  depth = 0,
): Array<{ folder: Folder; depth: number }> => {
  const normalizedParent = normalizeId(parentId);
  return folders
    .filter((folder) => normalizeId(folder.parentId) === normalizedParent)
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((folder) => [
      { folder, depth },
      ...getFolderTree(folders, folder.id, depth + 1),
    ]);
};

export const getChildFolders = (folders: Folder[], parentId: string | null) => {
  const normalizedParent = normalizeId(parentId);
  return folders
    .filter((folder) => normalizeId(folder.parentId) === normalizedParent)
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const getFolderPathLabel = (folder: Folder, folders: Folder[]) => {
  const ancestry = getFolderAncestors(folders, folder.id);
  if (!ancestry.length) {
    return folder.name;
  }
  return ancestry.map((item) => item.name).join(' / ');
};
