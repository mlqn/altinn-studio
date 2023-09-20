import React, { ReactNode, useState } from 'react';
import classes from './SettingsModalButton.module.css';
import { useTranslation } from 'react-i18next';
import { useStudioUrlParams } from 'app-shared/hooks/useStudioUrlParams';
import { useAppPolicyQuery, useAppConfigQuery } from 'app-development/hooks/queries';
import { Alert, Button, ErrorMessage, Paragraph, Spinner } from '@digdir/design-system-react';
import { SettingsModal } from './SettingsModal';
import { mergeQueryStatuses } from 'app-shared/utils/tanstackQueryUtils';
import { Center } from 'app-shared/components/Center';

/**
 * @component
 *    Displays a button to open the Settings modal
 *
 * @returns {ReactNode} - The rendered component
 */
export const SettingsModalButton = (): ReactNode => {
  const { t } = useTranslation();

  const { org, app } = useStudioUrlParams();

  const {
    status: policyStatus,
    data: policyData,
    error: policyError,
  } = useAppPolicyQuery(org, app);
  const {
    status: appConfigStatus,
    data: appConfigData,
    error: appConfigError,
  } = useAppConfigQuery(org, app);

  const [isOpen, setIsOpen] = useState(false);

  /**
   * Display spinner, error, or content based on the merged status
   */
  switch (mergeQueryStatuses(policyStatus, appConfigStatus)) {
    case 'loading': {
      return (
        <div>
          <Spinner
            size='2xLarge'
            variant='interaction'
            title={t('settings_modal.loading_content')}
          />
        </div>
      );
    }
    case 'error': {
      return (
        <Center>
          <Alert severity='danger'>
            <Paragraph>{t('general.fetch_error_message')}</Paragraph>
            <Paragraph>{t('general.error_message_with_colon')}</Paragraph>
            {policyError && <ErrorMessage>{policyError.message}</ErrorMessage>}
            {appConfigError && <ErrorMessage>{appConfigError.message}</ErrorMessage>}
          </Alert>
        </Center>
      );
    }
    case 'success': {
      return (
        <div>
          {/*TODO - Move button to the correct place to open the modal from. Issue: #11047*/}
          <Button className={classes.button} onClick={() => setIsOpen(true)}>
            {t('settings_modal.open_button')}
          </Button>
          <SettingsModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            policy={policyData}
            org={org}
            app={app}
            appConfig={appConfigData}
          />
        </div>
      );
    }
  }
};