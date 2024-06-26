import React from 'react';
import { render as rtlRender, screen } from '@testing-library/react';
import { SchemaEditorApp } from './SchemaEditorApp';
import { jsonMetadataMock } from 'app-shared/mocks/dataModelMetadataMocks';
import { jsonSchemaMock } from '../test/mocks/jsonSchemaMock';
import userEvent from '@testing-library/user-event';
import { textMock } from '@studio/testing/mocks/i18nMock';

// Mocks:
const saveMock = jest.fn();
const initialProps = {
  dataModels: [jsonMetadataMock],
  jsonSchema: jsonSchemaMock,
  modelPath: jsonMetadataMock.repositoryRelativeUrl,
  save: saveMock,
  name: 'Test',
};

export const render = () => rtlRender(<SchemaEditorApp {...initialProps} />);

describe('SchemaEditorApp', () => {
  afterEach(jest.clearAllMocks);

  it('Renders a tree view of the schema model', () => {
    render();
    expect(screen.getByRole('tree')).toBeInTheDocument();
  });

  it('Calls the save function when something is changed', async () => {
    const user = userEvent.setup();
    render();
    jest.spyOn(window, 'confirm').mockImplementation(() => true);
    const deleteButtonName = textMock('general.delete');
    const firstDeleteButton = screen.getAllByRole('button', { name: deleteButtonName })[0];
    await user.click(firstDeleteButton);
    expect(saveMock).toHaveBeenCalledTimes(1);
  });
});
