import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import classes from './ResourcePageInputs.module.css';
import { Textarea, Textfield } from '@digdir/design-system-react';
import { RightTranslationBar } from '../RightTranslationBar';
import type { SupportedLanguage } from 'app-shared/types/ResourceAdm';
import { getMissingInputLanguageString } from '../../utils/resourceUtils';
import { ResourceFieldHeader } from './ResourceFieldHeader';

/**
 * Initial value for languages with empty fields
 */
const emptyLanguages: SupportedLanguage = { nb: '', nn: '', en: '' };

type ResourceLanguageTextFieldProps = {
  /**
   * The label of the text field
   */
  label: string;
  /**
   * The description of the text field
   */
  description: string;
  /**
   * The description of the translation fields
   */
  translationDescription: string;
  /**
   * Whether the translation panel is open or not
   */
  isTranslationPanelOpen: boolean;
  /**
   * The value in the field
   */
  value: SupportedLanguage;
  /**
   * Function to be executed when the field is focused
   * @returns void
   */
  onFocus: () => void;
  /**
   * Function to be executed on blur
   * @returns void
   */
  onBlur: (translations: SupportedLanguage) => void;
  /**
   * The error text to be shown
   */
  errorText?: string;
  /**
   * Whether the component should use textarea instead of input
   */
  useTextArea?: boolean;
  /**
   * Whether this field is required or not
   */
  required?: boolean;
};

/**
 * @component
 *    Displays an input textfield for a resource variable that has language support.
 *
 * @property {string}[label] - The label of the text field
 * @property {string}[description] - The description of the text field
 * @property {string}[translationDescription] - The description of the translation fields
 * @property {boolean}[isTranslationPanelOpen] - Whether the translation panel is open or not
 * @property {string}[value] - The value in the field
 * @property {function}[onFocus] - unction to be executed when the field is focused
 * @property {function}[onBlur] - Function to be executed on blur
 * @property {string}[errorText] - The error text to be shown
 * @property {boolean}[useTextArea] - Whether the component should use textarea instead of input
 * @property {boolean}[required] - Whether this field is required or not
 *
 * @returns {React.JSX.Element} - The rendered component
 */
export const ResourceLanguageTextField = ({
  label,
  description,
  translationDescription,
  isTranslationPanelOpen,
  value,
  onFocus,
  onBlur,
  errorText,
  useTextArea,
  required,
}: ResourceLanguageTextFieldProps): React.JSX.Element => {
  const { t } = useTranslation();

  const [translations, setTranslations] = useState<SupportedLanguage>(value ?? emptyLanguages);

  const getTrimmedTranslations = (): SupportedLanguage => {
    return Object.keys(translations).reduce((acc: SupportedLanguage, key) => {
      return {
        ...acc,
        [key]: translations[key].trim(),
      };
    }, {} as SupportedLanguage);
  };
  const onBlurField = () => {
    onBlur(getTrimmedTranslations());
  };

  const onChangeNbField = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setTranslations((oldTranslations) => {
      return { ...oldTranslations, nb: event.target.value };
    });
  };

  const fieldError = errorText
    ? getMissingInputLanguageString(getTrimmedTranslations(), errorText, t)
    : '';

  return (
    <>
      <div className={classes.inputWrapper}>
        {useTextArea ? (
          <Textarea
            label={<ResourceFieldHeader label={label} required={required} />}
            description={description}
            size='small'
            value={translations['nb']}
            onChange={onChangeNbField}
            onFocus={onFocus}
            error={fieldError}
            onBlur={onBlurField}
            rows={5}
            required={required}
          />
        ) : (
          <Textfield
            label={<ResourceFieldHeader label={label} required={required} />}
            description={description}
            size='small'
            value={translations['nb']}
            onChange={onChangeNbField}
            onFocus={onFocus}
            error={fieldError}
            onBlur={onBlurField}
            required={required}
          />
        )}
      </div>
      {isTranslationPanelOpen && (
        <RightTranslationBar
          title={translationDescription}
          value={translations}
          onLanguageChange={setTranslations}
          usesTextArea={useTextArea}
          showErrors={!!errorText}
          onBlur={onBlurField}
          required={required}
        />
      )}
    </>
  );
};
