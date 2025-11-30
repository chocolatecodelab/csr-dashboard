import { Action } from '@/components/shared/DataTable';

interface CrudActionsProps<T extends { id: string; name: string }> {
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  editLabel?: string;
  deleteLabel?: string;
  extraActions?: Action<T>[];
}

export function createCrudActions<T extends { id: string; name: string }>({
  onEdit,
  onDelete,
  editLabel = "Edit",
  deleteLabel = "Hapus",
  extraActions = []
}: CrudActionsProps<T>): Action<T>[] {
  const baseActions: Action<T>[] = [
    {
      label: editLabel,
      icon: "edit",
      onClick: onEdit,
      variant: "primary",
    },
    {
      label: deleteLabel,
      icon: "trash",
      onClick: onDelete,
      variant: "danger",
    },
  ];

  return [...baseActions, ...extraActions];
}