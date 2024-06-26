import React, { useEffect } from 'react';
import { LegacySelect } from '@digdir/design-system-react';
import { useDataModelMetadataQuery } from '../../hooks/queries/useDataModelMetadataQuery';
import { FormField } from '../FormField';
import type { Option } from '@altinn/text-editor/types';
import { useStudioEnvironmentParams } from 'app-shared/hooks/useStudioEnvironmentParams';
import type { DataModelFieldElement } from 'app-shared/types/DataModelFieldElement';
import { useAppContext } from '../../hooks';

export interface ISelectDataModelProps {
  inputId?: string;
  selectedElement: string;
  label: string;
  onDataModelChange: (dataModelField: string) => void;
  noOptionsMessage?: string;
  hideRestrictions?: boolean;
  dataModelFieldsFilter?: (dataModelField: DataModelFieldElement) => boolean;
  componentType?: string;
  propertyPath?: string;
  helpText?: string;
}

export const SelectDataModelComponent = ({
  inputId,
  selectedElement,
  label,
  onDataModelChange,
  noOptionsMessage,
  dataModelFieldsFilter,
  componentType,
  helpText,
  propertyPath,
}: ISelectDataModelProps) => {
  const { org, app } = useStudioEnvironmentParams();
  const { selectedFormLayoutSetName } = useAppContext();
  const { data } = useDataModelMetadataQuery(org, app, selectedFormLayoutSetName, undefined);
  const [dataModelElementNames, setDataModelElementNames] = React.useState<Option[]>([]);

  useEffect(() => {
    if (!data) return;
    const elementNames = data.filter(dataModelFieldsFilter).map((element) => ({
      value: element.dataBindingName,
      label: element.dataBindingName,
    }));
    setDataModelElementNames(elementNames);
  }, [data, dataModelFieldsFilter]);

  const onChangeSelectedBinding = (e: any) => {
    onDataModelChange(e);
  };

  return (
    <FormField
      id={inputId}
      onChange={onChangeSelectedBinding}
      value={selectedElement}
      propertyPath={propertyPath}
      componentType={componentType}
      helpText={helpText}
      label={label}
      renderField={({ fieldProps }) => (
        <LegacySelect
          {...fieldProps}
          onChange={(e: any) => fieldProps.onChange(e)}
          options={dataModelElementNames}
        />
      )}
    />
  );
};
