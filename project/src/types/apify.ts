export interface Actor {
  id: string;
  name: string;
  username: string;
  title?: string;
  description?: string;
}

export interface ActorSchema {
  title?: string;
  type: string;
  properties?: Record<string, SchemaProperty>;
  required?: string[];
}

export interface SchemaProperty {
  type: string;
  title?: string;
  description?: string;
  default?: any;
  enum?: any[];
  items?: SchemaProperty;
  properties?: Record<string, SchemaProperty>;
  required?: string[];
}

export interface ActorRun {
  runId: string;
  status: string;
  output?: any[];
  error?: string;
  message?: string;
}