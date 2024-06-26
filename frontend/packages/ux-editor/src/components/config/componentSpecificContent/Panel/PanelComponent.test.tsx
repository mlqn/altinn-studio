import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PanelComponent } from './PanelComponent';
import type { FormComponent } from '../../../../types/FormComponent';
import {
  formLayoutSettingsMock,
  renderHookWithProviders,
  renderWithProviders,
} from '../../../../testing/mocks';
import { useLayoutSchemaQuery } from '../../../../hooks/queries/useLayoutSchemaQuery';
import { ComponentType } from 'app-shared/types/ComponentType';
import { useFormLayoutsQuery } from '../../../../hooks/queries/useFormLayoutsQuery';
import { useFormLayoutSettingsQuery } from '../../../../hooks/queries/useFormLayoutSettingsQuery';
import { textMock } from '@studio/testing/mocks/i18nMock';
import { FormPanelVariant } from 'app-shared/types/FormPanelVariant';
import { app, org } from '@studio/testing/testids';
import { layoutSet1NameMock } from '@altinn/ux-editor/testing/layoutSetsMock';

// Test data:
const selectedLayoutSet = layoutSet1NameMock;

const component: FormComponent<ComponentType.Panel> = {
  id: '',
  itemType: 'COMPONENT',
  type: ComponentType.Panel,
  dataModelBindings: {},
  variant: FormPanelVariant.Info,
  showIcon: false,
};

const mockHandleComponentChange = jest.fn();

const user = userEvent.setup();

const waitForData = async () => {
  const getFormLayoutSettings = jest
    .fn()
    .mockImplementation(() => Promise.resolve(formLayoutSettingsMock));
  const formLayoutsResult = renderHookWithProviders(() =>
    useFormLayoutsQuery(org, app, selectedLayoutSet),
  ).result;
  const settingsResult = renderHookWithProviders(
    () => useFormLayoutSettingsQuery(org, app, selectedLayoutSet),
    { queries: { getFormLayoutSettings } },
  ).result;
  const layoutSchemaResult = renderHookWithProviders(() => useLayoutSchemaQuery()).result;
  await waitFor(() => expect(formLayoutsResult.current.isSuccess).toBe(true));
  await waitFor(() => expect(settingsResult.current.isSuccess).toBe(true));
  await waitFor(() => expect(layoutSchemaResult.current[0].isSuccess).toBe(true));
};

const render = async () => {
  await waitForData();
  renderWithProviders(
    <PanelComponent component={component} handleComponentChange={mockHandleComponentChange} />,
  );
};

describe('PanelComponent', () => {
  afterEach(jest.clearAllMocks);

  it('should call handleComponentChange with showIcon property set to true when the showIcon checkbox is clicked', async () => {
    await render();

    const checkbox = screen.getByLabelText(textMock('ux_editor.show_icon'));

    await user.click(checkbox);

    expect(mockHandleComponentChange).toHaveBeenCalledTimes(1);
    expect(mockHandleComponentChange).toHaveBeenCalledWith({ ...component, showIcon: true });
  });

  it('should call handleComponentChange with the selected variant when a different variant is selected', async () => {
    await render();

    const select = screen.getByRole('combobox', {
      name: textMock('ux_editor.choose_variant'),
    });
    await user.click(select);
    await user.click(screen.getAllByRole('option')[1]);

    expect(mockHandleComponentChange).toHaveBeenCalledTimes(1);
    expect(mockHandleComponentChange).toHaveBeenCalledWith({
      ...component,
      variant: FormPanelVariant.Warning,
    });
  });
});
