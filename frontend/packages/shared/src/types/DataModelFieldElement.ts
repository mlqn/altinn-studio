export interface DataModelFieldElement {
  choices?: any;
  customProperties?: any;
  dataBindingName: string;
  displayString: string;
  fixedValue?: any;
  id: string;
  isReadOnly: boolean;
  isTagContent: boolean;
  jsonSchemaPointer: string;
  maxOccurs: number;
  minOccurs: number;
  name: string;
  parentElement: string;
  restrictions: any;
  texts: any;
  type: string;
  typeName?: string;
  xmlSchemaXPath: string;
  xName?: string;
  xPath: string;
  xsdValueType?: string;
}
