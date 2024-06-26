import { queriesMock } from 'app-shared/mocks/queriesMock';
import { renderHookWithProviders } from '../../testing/mocks';
import { useFormLayoutsQuery } from '../queries/useFormLayoutsQuery';
import { waitFor } from '@testing-library/react';
import { useUpdateFormComponentOrderMutation } from './useUpdateFormComponentOrderMutation';
import type { IFormLayoutOrder } from '../../types/global';
import {
  component1IdMock,
  component2IdMock,
  component3IdMock,
  container1IdMock,
  container2IdMock,
  externalLayoutsMock,
  layout1NameMock,
  layoutMock,
} from '@altinn/ux-editor/testing/layoutMock';
import { layoutSet1NameMock } from '@altinn/ux-editor/testing/layoutSetsMock';
import type { FormLayoutsResponse } from 'app-shared/types/api';
import { app, org } from '@studio/testing/testids';

// Test data:
const selectedLayoutSet = layoutSet1NameMock;

describe('useUpdateFormComponentOrderMutation', () => {
  afterEach(jest.clearAllMocks);

  it('Calls updateFormComponentOrder with correct arguments and payload', async () => {
    await renderAndWaitForData();

    const componentOrderResult = renderHookWithProviders(() =>
      useUpdateFormComponentOrderMutation(org, app, selectedLayoutSet),
    ).result;

    const newOrder: IFormLayoutOrder = {
      ...layoutMock.order,
      [container2IdMock]: [component3IdMock],
      [container1IdMock]: [component2IdMock, component1IdMock],
    };
    await componentOrderResult.current.mutateAsync(newOrder);

    expect(queriesMock.saveFormLayout).toHaveBeenCalledTimes(1);
    expect(queriesMock.saveFormLayout).toHaveBeenCalledWith(
      org,
      app,
      layout1NameMock,
      selectedLayoutSet,
      {
        componentIdsChange: undefined,
        layout: expect.objectContaining({
          data: expect.objectContaining({
            layout: [
              expect.objectContaining({ id: container1IdMock }),
              expect.objectContaining({ id: container2IdMock }),
              expect.objectContaining({ id: 'ComponentWithOptionsMock' }),
              expect.objectContaining({ id: component2IdMock }),
              expect.objectContaining({ id: component1IdMock }),
              expect.objectContaining({ id: component3IdMock }),
            ],
          }),
        }),
      },
    );
  });
});

const renderAndWaitForData = async () => {
  const getFormLayouts = jest
    .fn()
    .mockImplementation(() => Promise.resolve<FormLayoutsResponse>(externalLayoutsMock));
  const formLayoutsResult = renderHookWithProviders(
    () => useFormLayoutsQuery(org, app, selectedLayoutSet),
    { queries: { getFormLayouts } },
  ).result;
  await waitFor(() => expect(formLayoutsResult.current.isSuccess).toBe(true));
};
