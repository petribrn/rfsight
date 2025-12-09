import { FilterFunction } from 'json-edit-react';

export interface IJsonPayloadEditorProps {
  data: object | Array<any>;
  collapse?: number | boolean | FilterFunction | undefined;
  setData: (arg0: unknown) => void;
}
