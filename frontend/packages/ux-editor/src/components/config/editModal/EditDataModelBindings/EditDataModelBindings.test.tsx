import React from 'react';
import { screen } from '@testing-library/react';
import { renderHookWithProviders, renderWithProviders } from '../../../../testing/mocks';
import { EditDataModelBindings } from './EditDataModelBindings';
import { textMock } from '@studio/testing/mocks/i18nMock';
import { ComponentType } from 'app-shared/types/ComponentType';
import userEvent from '@testing-library/user-event';
import type { DataModelMetadataResponse } from 'app-shared/types/api';
import { queryClientMock } from 'app-shared/mocks/queryClientMock';
import { QueryKey } from 'app-shared/types/QueryKey';
import { componentMocks } from '../../../../testing/componentMocks';
import type { FormItem } from '../../../../types/FormItem';
import { app, org } from '@studio/testing/testids';
import { layoutSet1NameMock } from '@altinn/ux-editor/testing/layoutSetsMock';
import { useMutation } from '@tanstack/react-query';
import { appContextMock } from '@altinn/ux-editor/testing/appContextMock';

const dataModelName = undefined;

const dataModelMetadata: DataModelMetadataResponse = {
  elements: {
    testModel: {
      id: 'testModel',
      type: 'ComplexType',
      dataBindingName: 'testModel',
      displayString: 'testModel',
      isReadOnly: false,
      isTagContent: false,
      jsonSchemaPointer: '#/definitions/testModel',
      maxOccurs: 1,
      minOccurs: 1,
      name: 'testModel',
      parentElement: null,
      restrictions: [],
      texts: [],
      xmlSchemaXPath: '/testModel',
      xPath: '/testModel',
    },
    'testModel.field1': {
      id: 'testModel.field1',
      type: 'SimpleType',
      dataBindingName: 'testModel.field1',
      displayString: 'testModel.field1',
      isReadOnly: false,
      isTagContent: false,
      jsonSchemaPointer: '#/definitions/testModel/properties/field1',
      maxOccurs: 1,
      minOccurs: 1,
      name: 'testModel/field1',
      parentElement: null,
      restrictions: [],
      texts: [],
      xmlSchemaXPath: '/testModel/field1',
      xPath: '/testModel/field1',
    },
    datePickerField: {
      id: 'datePickerField',
      type: 'SimpleType',
      dataBindingName: 'datePickerField',
      displayString: 'datePickerField',
      isReadOnly: false,
      isTagContent: false,
      jsonSchemaPointer: '#/definitions/datePickerField',
      maxOccurs: 1,
      minOccurs: 1,
      name: 'datePickerField',
      parentElement: null,
      restrictions: [],
      texts: [],
      xsdValueType: 'DateTime',
      xmlSchemaXPath: 'datePickerField',
      xPath: 'datePickerField',
    },
  },
};

const getDataModelMetadata = () => Promise.resolve(dataModelMetadata);
const defaultComponent = componentMocks[ComponentType.Input];
const defaultRenderOptions = {
  uniqueKey: 'someComponentId-data-model-select',
  key: undefined,
  label: undefined,
};

const render = ({
  component = defaultComponent,
  renderOptions = defaultRenderOptions,
}: {
  component?: FormItem;
  handleComponentChange?: () => void;
  renderOptions?: { uniqueKey: string; key: string; label: string };
} = {}) => {
  const handleComponentMutation = renderHookWithProviders(() =>
    useMutation({
      mutationFn: () => Promise.resolve(),
    }),
  ).result;
  const mockhHandleComponentChange = jest
    .fn()
    .mockImplementation(async (mutationArgs, mutateOptions) => {
      await handleComponentMutation.current.mutateAsync(mutationArgs, mutateOptions);
    });
  return {
    mockhHandleComponentChange,
    ...renderWithProviders(
      <EditDataModelBindings
        handleComponentChange={mockhHandleComponentChange}
        component={component as FormItem}
        renderOptions={renderOptions}
      />,
      {
        queries: { getDataModelMetadata },
      },
    ),
  };
};

describe('EditDataModelBindings', () => {
  afterEach(jest.clearAllMocks);

  it('should show select with no selected option by default', async () => {
    const user = userEvent.setup();
    render({
      component: {
        ...defaultComponent,
        dataModelBindings: undefined,
      },
    });
    const linkIcon = screen.getByRole('button', {
      name: textMock('ux_editor.component_title.Input'),
    });
    await user.click(linkIcon);
    const combobox = screen.getByRole('combobox', {
      name: textMock('ux_editor.component_title.Input'),
    });
    expect(combobox.getAttribute('value')).toEqual('');
  });

  it('should show select with provided data model binding', async () => {
    const user = userEvent.setup();
    render();
    const linkIcon = screen.getByRole('button', {
      name: textMock('ux_editor.component_title.Input'),
    });
    await user.click(linkIcon);
    screen.getByRole('combobox', { name: textMock('ux_editor.component_title.Input') });
    screen.getByText('testModel.field1');
  });

  it('should render link icon', () => {
    render();
    const linkIcon = screen.getByRole('button', {
      name: textMock('ux_editor.component_title.Input'),
    });
    expect(linkIcon).toBeInTheDocument();
  });

  it('should show select when link icon is clicked', async () => {
    const user = userEvent.setup();
    render();
    const linkIcon = screen.getByRole('button', {
      name: textMock('ux_editor.component_title.Input'),
    });
    await user.click(linkIcon);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('should toggle select on link icon click', async () => {
    const user = userEvent.setup();
    render();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    const linkIcon = screen.getByRole('button', {
      name: textMock('ux_editor.component_title.Input'),
    });
    await user.click(linkIcon);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('check that handleComponentChange is called', async () => {
    const user = userEvent.setup();

    const { mockhHandleComponentChange } = render();
    const linkIcon = screen.getByRole('button', {
      name: textMock('ux_editor.component_title.Input'),
    });
    await user.click(linkIcon);
    const option = screen.getByText('testModel');
    await user.click(option);
    expect(mockhHandleComponentChange).toHaveBeenCalledWith(
      {
        ...defaultComponent,
        dataModelBindings: { simpleBinding: 'testModel' },
        maxCount: undefined,
        required: true,
        timeStamp: undefined,
      },
      {
        onSuccess: expect.any(Function),
      },
    );
    expect(appContextMock.refetchLayouts).toHaveBeenCalledTimes(1);
    expect(appContextMock.refetchLayouts).toHaveBeenCalledWith(layoutSet1NameMock, true);
  });

  it('check that handleComponentChange is called with timestamp for DatePicker component', async () => {
    const user = userEvent.setup();
    const { mockhHandleComponentChange } = render({
      component: { ...defaultComponent, type: ComponentType.Datepicker },
    });
    const linkIcon = screen.getByRole('button', {
      name: textMock('ux_editor.component_title.Datepicker'),
    });
    await user.click(linkIcon);
    const option = screen.getByText('datePickerField');
    await user.click(option);
    expect(mockhHandleComponentChange).toHaveBeenCalledWith(
      {
        ...defaultComponent,
        type: ComponentType.Datepicker,
        dataModelBindings: { simpleBinding: 'datePickerField' },
        maxCount: undefined,
        required: true,
        timeStamp: true,
      },
      {
        onSuccess: expect.any(Function),
      },
    );
    expect(appContextMock.refetchLayouts).toHaveBeenCalledTimes(1);
    expect(appContextMock.refetchLayouts).toHaveBeenCalledWith(layoutSet1NameMock, true);
  });

  it('should render close icon', async () => {
    const user = userEvent.setup();
    render();
    const linkIcon = screen.getByRole('button', {
      name: textMock('ux_editor.component_title.Input'),
    });
    await user.click(linkIcon);
    const saveButton = screen.getByRole('button', { name: textMock('general.close') });
    expect(saveButton).toBeInTheDocument();
  });

  it('should render delete icon', async () => {
    const user = userEvent.setup();
    render();
    const linkIcon = screen.getByRole('button', {
      name: textMock('ux_editor.component_title.Input'),
    });
    await user.click(linkIcon);
    const deleteButton = screen.getByRole('button', { name: textMock('general.delete') });
    expect(deleteButton).toBeInTheDocument();
  });

  it('show link data model again when the user clicks on save button and no data model binding is selected', async () => {
    const user = userEvent.setup();
    render();
    const linkIcon = screen.getByRole('button', {
      name: textMock('ux_editor.component_title.Input'),
    });
    await user.click(linkIcon);
    const combobox = screen.getByRole('combobox', {
      name: textMock('ux_editor.component_title.Input'),
    });
    expect(combobox.getAttribute('value')).toEqual('');

    const saveButton = screen.getByRole('button', { name: textMock('general.close') });
    await user.click(saveButton);

    expect(
      screen.getByRole('button', { name: textMock('ux_editor.component_title.Input') }),
    ).toBeInTheDocument();
  });

  it('deletes existing data model link', async () => {
    const user = userEvent.setup();
    jest.spyOn(window, 'confirm').mockImplementation(() => true);
    const dataModelBindingKey = 'testModel.field1';

    const { mockhHandleComponentChange } = render({
      component: {
        ...defaultComponent,
        dataModelBindings: {
          simpleBinding: dataModelBindingKey,
        },
      },
    });

    const editButton = screen.getByRole('button', {
      name: textMock('right_menu.data_model_bindings_edit', {
        binding: textMock('ux_editor.component_title.Input'),
      }),
    });
    await user.click(editButton);

    screen.getByText(dataModelBindingKey);
    const deleteButton = screen.getByRole('button', { name: textMock('general.delete') });
    await user.click(deleteButton);
    expect(mockhHandleComponentChange).toHaveBeenCalledWith(
      {
        ...defaultComponent,
        dataModelBindings: { simpleBinding: '' },
        timeStamp: undefined,
      },
      {
        onSuccess: expect.any(Function),
      },
    );
    expect(appContextMock.refetchLayouts).toHaveBeenCalledTimes(1);
    expect(appContextMock.refetchLayouts).toHaveBeenCalledWith(layoutSet1NameMock, true);
  });

  it('shows edit fieldset when the user clicks on a binding button', async () => {
    const user = userEvent.setup();
    const dataModelBindingKey = 'testModel.field1';
    render({
      component: {
        ...defaultComponent,
        dataModelBindings: { simpleBinding: dataModelBindingKey },
      },
    });

    const editIcon = screen.getByRole('button', {
      name: textMock('right_menu.data_model_bindings_edit', {
        binding: textMock('ux_editor.component_title.Input'),
      }),
    });
    await user.click(editIcon);

    expect(screen.getByRole('group', { name: textMock('ux_editor.component_title.Input') }));
    expect(screen.getByRole('combobox').getAttribute('value')).toEqual(dataModelBindingKey);
  });

  it('should call "handleComponentUpdate" with maxCount when dataModelBinding is clicked for RepeatingGroup', async () => {
    const user = userEvent.setup();
    const dataBindingNameMock = 'element';
    const maxCountMock = 2;
    queryClientMock.setQueryData(
      [QueryKey.DataModelMetadata, org, app, layoutSet1NameMock, dataModelName],
      [{ dataBindingName: dataBindingNameMock, maxOccurs: maxCountMock }],
    );
    const { mockhHandleComponentChange } = render({
      component: componentMocks[ComponentType.RepeatingGroup],
      renderOptions: {
        uniqueKey: 'some-key',
        key: 'group',
        label: 'group',
      },
    });

    const dataModelBinding = screen.getByRole('button', {
      name: textMock('ux_editor.modal_properties_data_model_label.group'),
    });
    await user.click(dataModelBinding);
    const dataModelBindingSelector = screen.getByRole('combobox', {
      name: textMock(`ux_editor.modal_properties_data_model_label.group`),
    });
    await user.click(dataModelBindingSelector);
    const dataModelOption = screen.getByRole('option', { name: dataBindingNameMock });
    await user.click(dataModelOption);

    expect(mockhHandleComponentChange).toHaveBeenCalled();
    expect(mockhHandleComponentChange).toHaveBeenCalledWith(
      expect.objectContaining({
        ...componentMocks[ComponentType.RepeatingGroup],
        maxCount: maxCountMock,
        dataModelBindings: { group: dataBindingNameMock },
      }),
      {
        onSuccess: expect.any(Function),
      },
    );
    expect(appContextMock.refetchLayouts).toHaveBeenCalledTimes(1);
    expect(appContextMock.refetchLayouts).toHaveBeenCalledWith(layoutSet1NameMock, true);
  });

  it('show right data model when switching component', () => {
    const { rerender } = render({
      component: {
        ...defaultComponent,
        dataModelBindings: { simpleBinding: 'testModel.field1' },
      },
    });
    screen.getByText('testModel.field1');
    rerender(
      <EditDataModelBindings
        handleComponentChange={jest.fn()}
        component={{
          id: 'someComponentId',
          type: ComponentType.Input,
          dataModelBindings: { simpleBinding: 'testModel.field2' },
          itemType: 'COMPONENT',
        }}
      />,
    );

    screen.getByText('testModel.field2');
  });
});
