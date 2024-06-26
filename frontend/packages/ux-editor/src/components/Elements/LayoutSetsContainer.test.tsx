import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LayoutSetsContainer } from './LayoutSetsContainer';
import { queryClientMock } from 'app-shared/mocks/queryClientMock';
import { renderWithProviders } from '../../testing/mocks';
import {
  layoutSet1NameMock,
  layoutSet2NameMock,
  layoutSetsMock,
} from '../../testing/layoutSetsMock';
import { QueryKey } from 'app-shared/types/QueryKey';
import { appContextMock } from '../../testing/appContextMock';
import { app, org } from '@studio/testing/testids';

// Test data
const layoutSetName1 = layoutSet1NameMock;
const layoutSetName2 = layoutSet2NameMock;

describe('LayoutSetsContainer', () => {
  it('renders component', async () => {
    render();

    expect(await screen.findByRole('option', { name: layoutSetName1 })).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: layoutSetName2 })).toBeInTheDocument();
  });

  it('NativeSelect should be rendered', async () => {
    render();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('Should update selected layout set when set is clicked in native select', async () => {
    render();
    const user = userEvent.setup();
    await user.selectOptions(screen.getByRole('combobox'), layoutSetName2);
    expect(appContextMock.setSelectedFormLayoutSetName).toHaveBeenCalledTimes(1);
    expect(appContextMock.refetchLayouts).toHaveBeenCalledTimes(1);
    expect(appContextMock.refetchLayouts).toHaveBeenCalledWith('test-layout-set-2');
    expect(appContextMock.refetchLayoutSettings).toHaveBeenCalledTimes(1);
    expect(appContextMock.refetchLayoutSettings).toHaveBeenCalledWith('test-layout-set-2');
    expect(appContextMock.onLayoutSetNameChange).toHaveBeenCalledWith('test-layout-set-2');
  });
});

const render = () => {
  queryClientMock.setQueryData([QueryKey.LayoutSets, org, app], layoutSetsMock);
  return renderWithProviders(<LayoutSetsContainer />);
};
