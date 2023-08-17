import React from 'react';
import { DataModelling } from './DataModelling';
import { render as rtlRender, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { textMock } from '../../../testing/mocks/i18nMock';
import { ServicesContextProps, ServicesContextProvider } from 'app-shared/contexts/ServicesContext';
import { queriesMock } from 'app-shared/mocks/queriesMock';
import { createQueryClientMock } from 'app-shared/mocks/queryClientMock';
import { QueryKey } from 'app-shared/types/QueryKey';
import { jsonMetadata1Mock } from '../../../packages/schema-editor/test/mocks/metadataMocks';
import { QueryClient } from '@tanstack/react-query';

// workaround for https://jestjs.io/docs/26.x/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const org = 'org';
const app = 'app';

// Mocks:
const getDatamodel = jest.fn().mockImplementation(() => Promise.resolve({}));
const getDatamodels = jest.fn().mockImplementation(() => Promise.resolve([]));
const getDatamodelsXsd = jest.fn().mockImplementation(() => Promise.resolve([]));

const render = (queries: Partial<ServicesContextProps> = {}, queryClient: QueryClient = createQueryClientMock()) => {
  const allQueries: ServicesContextProps = {
    ...queriesMock,
    getDatamodel,
    getDatamodels,
    getDatamodelsXsd,
    ...queries,
  };

  return rtlRender(
    <ServicesContextProvider {...allQueries} client={queryClient}>
      <DataModelling/>
    </ServicesContextProvider>
  );
};

describe('DataModelling', () => {
  afterEach(jest.clearAllMocks);

  it('fetches models on mount', () => {
    render();
    expect(getDatamodels).toHaveBeenCalledTimes(1);
    expect(getDatamodelsXsd).toHaveBeenCalledTimes(1);
  });

  it('shows start dialog when no models are present and intro page is closed', () => {
    const queryClient = createQueryClientMock();
    queryClient.setQueryData([QueryKey.DatamodelsMetadata, org, app], []);
    render({}, queryClient);
    const dialogHeader = screen.getByRole('heading', { name: textMock('app_data_modelling.landing_dialog_header') });
    expect(dialogHeader).toBeInTheDocument();
  });

  it('does not show start dialog when the models have not been loaded yet', () => {
    render();
    expect(screen.getByTitle(textMock('general.loading'))).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: textMock('app_data_modelling.landing_dialog_header') })).not.toBeInTheDocument();
  });

  it('does not show start dialog when there are models present', async () => {
    getDatamodels.mockImplementation(() => Promise.resolve([jsonMetadata1Mock]));
    render();
    await waitForElementToBeRemoved(() => screen.queryByTitle(textMock('general.loading')));
    expect(screen.queryByRole('heading', { name: textMock('app_data_modelling.landing_dialog_header') })).not.toBeInTheDocument();
  });

  it('shows an error message if an error occured', async () => {
    const errorMessage = 'error-message-test';
    render({
      getDatamodels: () => Promise.reject({ message: errorMessage }),
    });
    await waitForElementToBeRemoved(() => screen.queryByTitle(textMock('general.loading')));
    expect(screen.getByText(textMock('general.fetch_error_message'))).toBeInTheDocument();
    expect(screen.getByText(textMock('general.error_message_with_colon'))).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});