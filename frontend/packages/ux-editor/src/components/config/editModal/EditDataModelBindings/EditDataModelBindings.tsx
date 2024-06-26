import type { IGenericEditComponent } from '../../componentConfig';
import {
  getMaxOccursFromDataModel,
  getMinOccursFromDataModel,
  getXsdDataTypeFromDataModel,
} from '../../../../utils/dataModel';
import { ComponentType } from 'app-shared/types/ComponentType';
import React, { useEffect, useState } from 'react';
import { useDataModelMetadataQuery } from '../../../../hooks/queries/useDataModelMetadataQuery';
import { useStudioEnvironmentParams } from 'app-shared/hooks/useStudioEnvironmentParams';
import classes from './EditDataModelBindings.module.css';
import { useTranslation } from 'react-i18next';
import { UndefinedBinding } from './UndefinedBinding';
import { EditBinding } from './EditBinding';
import { DefinedBinding } from './DefinedBinding';
import type { FormItem } from '../../../../types/FormItem';
import { useAppContext } from '../../../../hooks';

export interface EditDataModelBindingsProps<T extends ComponentType>
  extends IGenericEditComponent<T> {
  renderOptions?: {
    label?: string;
    returnValue?: any;
    key?: string;
    uniqueKey?: any;
  };
  helpText?: string;
}

export const EditDataModelBindings = <T extends ComponentType>({
  component,
  handleComponentChange,
  renderOptions,
  helpText,
}: EditDataModelBindingsProps<T>) => {
  const { org, app } = useStudioEnvironmentParams();
  const { selectedFormLayoutSetName, refetchLayouts } = useAppContext();
  const { data } = useDataModelMetadataQuery(org, app, selectedFormLayoutSetName, undefined);
  const { t } = useTranslation();
  const [dataModelSelectVisible, setDataModelSelectVisible] = useState(false);

  useEffect(() => {
    setDataModelSelectVisible(false);
  }, [component.id]);

  const { uniqueKey, key, label } = renderOptions || {};
  const bindingKey = key || 'simpleBinding';

  const handleBindingChange = (selectedDataModelElement: string) => {
    handleComponentChange(
      {
        ...component,
        dataModelBindings: {
          ...component.dataModelBindings,
          [bindingKey]: selectedDataModelElement,
        },
        required: getMinOccursFromDataModel(selectedDataModelElement, data) > 0 || undefined,
        timeStamp:
          component.type === ComponentType.Datepicker
            ? getXsdDataTypeFromDataModel(selectedDataModelElement, data) === 'DateTime'
            : undefined,
        maxCount:
          component.type === ComponentType.RepeatingGroup
            ? getMaxOccursFromDataModel(selectedDataModelElement, data)
            : undefined,
      } as FormItem<T>,
      {
        onSuccess: async () => {
          await refetchLayouts(selectedFormLayoutSetName, true);
        },
      },
    );
  };

  const handleDelete = () => {
    handleBindingChange('');
    setDataModelSelectVisible(false);
  };

  const selectedOption = component.dataModelBindings
    ? component.dataModelBindings[key || 'simpleBinding']
    : undefined;

  const labelSpecificText = label
    ? t(`ux_editor.modal_properties_data_model_label.${label}`)
    : t(`ux_editor.component_title.${component.type}`);

  return (
    <div key={uniqueKey || ''} className={classes.wrapper}>
      {!selectedOption && !dataModelSelectVisible ? (
        <UndefinedBinding
          onClick={() => setDataModelSelectVisible(true)}
          label={labelSpecificText}
        />
      ) : dataModelSelectVisible ? (
        <EditBinding
          bindingKey={bindingKey}
          component={component}
          helpText={helpText}
          label={labelSpecificText}
          onBindingChange={handleBindingChange}
          selectedElement={selectedOption}
          onDelete={handleDelete}
          onClose={() => setDataModelSelectVisible(false)}
        />
      ) : (
        <DefinedBinding
          label={labelSpecificText}
          onClick={() => setDataModelSelectVisible(true)}
          selectedOption={selectedOption}
        />
      )}
    </div>
  );
};
