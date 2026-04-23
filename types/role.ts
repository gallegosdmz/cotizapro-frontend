export interface Role {
  id: string;
  name: string;
  description: string;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  resource: Resource;
}

export interface Resource {
  id: string;
  name: string;
  slug: string;
}
