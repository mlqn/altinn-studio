import { queriesMock } from 'app-shared/mocks/queriesMock';
import { renderHookWithProviders } from '../../testing/mocks';
import { waitFor } from '@testing-library/react';
import { useDeleteFormComponentMutation } from './useDeleteFormComponentMutation';
import { useFormLayoutsQuery } from '../queries/useFormLayoutsQuery';
import { component2IdMock, layout1NameMock } from '@altinn/ux-editor/testing/layoutMock';
import { layoutSet1NameMock } from '@altinn/ux-editor/testing/layoutSetsMock';
import { app, org } from '@studio/testing/testids';

// Test data:
const selectedLayoutSet = layoutSet1NameMock;

describe('useDeleteFormComponentMutation', () => {
  it('Should save layout without deleted component', async () => {
    const { result } = await renderDeleteFormComponentsMutation();
    await result.current.mutateAsync(component2IdMock);
    expect(queriesMock.saveFormLayout).toHaveBeenCalledTimes(1);
    expect(queriesMock.saveFormLayout).toHaveBeenCalledWith(
      org,
      app,
      layout1NameMock,
      selectedLayoutSet,
      {
        componentIdsChange: [
          {
            newComponentId: undefined,
            oldComponentId: component2IdMock,
          },
        ],
        layout: expect.objectContaining({
          data: expect.objectContaining({
            layout: expect.not.arrayContaining([expect.objectContaining({ id: component2IdMock })]),
          }),
        }),
      },
    );
  });
});

const renderDeleteFormComponentsMutation = async () => {
  const formLayoutsResult = renderHookWithProviders(() =>
    useFormLayoutsQuery(org, app, selectedLayoutSet),
  ).result;
  await waitFor(() => expect(formLayoutsResult.current.isSuccess).toBe(true));
  return renderHookWithProviders(() => useDeleteFormComponentMutation(org, app, selectedLayoutSet));
};
