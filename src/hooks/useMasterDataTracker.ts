import { useState, useCallback, useRef } from 'react';

interface MasterDataChange {
  fieldName: string;
  action: 'create' | 'update' | 'delete';
  item: any;
  timestamp: Date;
}

interface UseMasterDataTrackerReturn {
  changes: MasterDataChange[];
  hasChanges: boolean;
  recordChange: (fieldName: string, action: 'create' | 'update' | 'delete', item: any) => void;
  clearChanges: () => void;
  getChangesByField: (fieldName: string) => MasterDataChange[];
  getLatestChange: (fieldName?: string) => MasterDataChange | null;
}

export function useMasterDataTracker(): UseMasterDataTrackerReturn {
  const [changes, setChanges] = useState<MasterDataChange[]>([]);
  const changeId = useRef(0);

  const recordChange = useCallback((
    fieldName: string, 
    action: 'create' | 'update' | 'delete', 
    item: any
  ) => {
    const change: MasterDataChange = {
      fieldName,
      action,
      item,
      timestamp: new Date()
    };

    setChanges(prev => [...prev, change]);
    
    // Optional: Store in localStorage for persistence
    const changeKey = `master_data_change_${++changeId.current}`;
    localStorage.setItem(changeKey, JSON.stringify(change));
    
    console.log('📝 Master data change recorded:', change);
  }, []);

  const clearChanges = useCallback(() => {
    setChanges([]);
    
    // Clear from localStorage
    Object.keys(localStorage)
      .filter(key => key.startsWith('master_data_change_'))
      .forEach(key => localStorage.removeItem(key));
  }, []);

  const getChangesByField = useCallback((fieldName: string) => {
    return changes.filter(change => change.fieldName === fieldName);
  }, [changes]);

  const getLatestChange = useCallback((fieldName?: string) => {
    const relevantChanges = fieldName 
      ? getChangesByField(fieldName)
      : changes;
    
    return relevantChanges.length > 0 
      ? relevantChanges[relevantChanges.length - 1]
      : null;
  }, [changes, getChangesByField]);

  return {
    changes,
    hasChanges: changes.length > 0,
    recordChange,
    clearChanges,
    getChangesByField,
    getLatestChange
  };
}