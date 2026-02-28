export type FieldType =
  | "text"
  | "password"
  | "number"
  | "date"
  | "select"
  | "boolean"
  | "relation";

export type FilterType = "text" | "select" | "boolean" | "dateRange" | "numberRange";

export interface FieldSchema {
  name: string;
  label: string;
  type: FieldType;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: FilterType;
  filterOptions?: { label: string; value: any }[];
  editable?: boolean;
  visible?: boolean;
  hideable?: boolean;
  options?: { label: string; value: any }[];
  booleanLabels?: {
    true: string;
    false: string;
    trueColor?: string; 
    falseColor?: string;
  };
  relation?: RelationConfig;
}

export interface EntitySchema {
  entityName: string;
  idField: string;
  fields: FieldSchema[];
}

export interface RelationConfig {
  api: any;             
  valueField: string;  
  labelField: string;   
  multiple?: boolean;
}