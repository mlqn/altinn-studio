import React from 'react';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { SettingsModalProps } from './SettingsModal';
import { SettingsModal } from './SettingsModal';
import { textMock } from '@studio/testing/mocks/i18nMock';
import { createQueryClientMock } from 'app-shared/mocks/queryClientMock';
import type { QueryClient, UseMutationResult } from '@tanstack/react-query';
import type { ServicesContextProps } from 'app-shared/contexts/ServicesContext';
import { ServicesContextProvider } from 'app-shared/contexts/ServicesContext';
import type { AppConfig } from 'app-shared/types/AppConfig';
import { useAppConfigMutation } from '../../../hooks/mutations';
import { MemoryRouter } from 'react-router-dom';

import { SettingsModalContextProvider } from '../../../contexts/SettingsModalContext';
import { PreviewContextProvider } from '../../../contexts/PreviewContext';

jest.mock('../../../hooks/mutations/useAppConfigMutation');
const updateAppConfigMutation = jest.fn();
const mockUpdateAppConfigMutation = useAppConfigMutation as jest.MockedFunction<
  typeof useAppConfigMutation
>;
mockUpdateAppConfigMutation.mockReturnValue({
  mutate: updateAppConfigMutation,
} as unknown as UseMutationResult<void, Error, AppConfig, unknown>);

describe('SettingsModal', () => {
  const user = userEvent.setup();
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockOnClose = jest.fn();

  const defaultProps: SettingsModalProps = {
    isOpen: true,
    onClose: mockOnClose,
  };

  it('closes the modal when the close button is clicked', async () => {
    renderSettingsModal(defaultProps);

    const closeButton = screen.getByRole('button', {
      name: textMock('settings_modal.close_button_label'),
    });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('displays left navigation bar when promises resolves', async () => {
    await resolveAndWaitForSpinnerToDisappear();

    expect(
      screen.getByRole('tab', { name: textMock('settings_modal.left_nav_tab_about') }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: textMock('settings_modal.left_nav_tab_setup') }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: textMock('settings_modal.left_nav_tab_policy') }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: textMock('settings_modal.left_nav_tab_access_control') }),
    ).toBeInTheDocument();
  });

  it('displays the about tab, and not the other tabs, when promises resolves first time', async () => {
    await resolveAndWaitForSpinnerToDisappear();

    expect(screen.getByText(textMock('settings_modal.about_tab_heading'))).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {
        name: textMock('settings_modal.policy_tab_heading'),
        level: 2,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {
        name: textMock('settings_modal.access_control_tab_heading'),
        level: 2,
      }),
    ).not.toBeInTheDocument();
  });

  it('changes the tab from "about" to "policy" when policy tab is clicked', async () => {
    await resolveAndWaitForSpinnerToDisappear();

    expect(
      screen.queryByRole('heading', {
        name: textMock('settings_modal.policy_tab_heading'),
        level: 2,
      }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(textMock('settings_modal.about_tab_heading'))).toBeInTheDocument();

    const policyTab = screen.getByRole('tab', {
      name: textMock('settings_modal.left_nav_tab_policy'),
    });
    await user.click(policyTab);

    expect(
      screen.getByRole('heading', {
        name: textMock('settings_modal.policy_tab_heading'),
        level: 2,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(textMock('settings_modal.about_tab_heading')),
    ).not.toBeInTheDocument();
  });

  it('changes the tab from "policy" to "about" when about tab is clicked', async () => {
    await resolveAndWaitForSpinnerToDisappear();

    const policyTab = screen.getByRole('tab', {
      name: textMock('settings_modal.left_nav_tab_policy'),
    });
    await user.click(policyTab);

    const aboutTab = screen.getByRole('tab', {
      name: textMock('settings_modal.left_nav_tab_about'),
    });
    await user.click(aboutTab);

    expect(
      screen.queryByRole('heading', {
        name: textMock('settings_modal.policy_tab_heading'),
        level: 2,
      }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(textMock('settings_modal.about_tab_heading'))).toBeInTheDocument();
  });

  it('changes the tab from "about" to "accessControl" when access control tab is clicked', async () => {
    await resolveAndWaitForSpinnerToDisappear();

    expect(
      screen.queryByRole('heading', {
        name: textMock('settings_modal.access_control_tab_heading'),
        level: 2,
      }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(textMock('settings_modal.about_tab_heading'))).toBeInTheDocument();

    const accessControlTab = screen.getByRole('tab', {
      name: textMock('settings_modal.left_nav_tab_access_control'),
    });
    await user.click(accessControlTab);

    expect(
      screen.getByRole('heading', {
        name: textMock('settings_modal.access_control_tab_heading'),
        level: 2,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(textMock('settings_modal.about_tab_heading')),
    ).not.toBeInTheDocument();
  });

  it('changes the tab from "about" to "setup" when setup control tab is clicked', async () => {
    await resolveAndWaitForSpinnerToDisappear();

    expect(
      screen.queryByRole('heading', {
        name: textMock('settings_modal.setup_tab_heading'),
        level: 2,
      }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(textMock('settings_modal.about_tab_heading'))).toBeInTheDocument();

    const setupTab = screen.getByRole('tab', {
      name: textMock('settings_modal.left_nav_tab_setup'),
    });
    await user.click(setupTab);

    expect(
      screen.getByRole('heading', {
        name: textMock('settings_modal.setup_tab_heading'),
        level: 2,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(textMock('settings_modal.about_tab_heading')),
    ).not.toBeInTheDocument();
  });

  /**
   * Resolves the mocks, renders the component and waits for the spinner
   * to be removed from the screen
   */
  const resolveAndWaitForSpinnerToDisappear = async () => {
    renderSettingsModal(defaultProps);

    await waitForElementToBeRemoved(() =>
      screen.queryByTitle(textMock('settings_modal.loading_content')),
    );
  };
});

const renderSettingsModal = (
  props: SettingsModalProps,
  queries: Partial<ServicesContextProps> = {},
  queryClient: QueryClient = createQueryClientMock(),
) => {
  return render(
    <MemoryRouter>
      <ServicesContextProvider {...queries} client={queryClient}>
        <SettingsModalContextProvider>
          <PreviewContextProvider>
            <SettingsModal {...props} />
          </PreviewContextProvider>
        </SettingsModalContextProvider>
      </ServicesContextProvider>
    </MemoryRouter>,
  );
};
