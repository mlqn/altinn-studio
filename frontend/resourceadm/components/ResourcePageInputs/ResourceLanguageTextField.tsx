import React, { forwardRef } from 'react';
import classes from './ResourcePageInputs.module.css';
import { Textfield } from '@digdir/design-system-react';

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
   * The value in the field
   */
  value: string;
  /**
   * Function that updates the value in the field
   * @param value the new value
   * @returns void
   */
  onChangeValue: (value: string) => void;
  /**
   * Function to be executed when the field is focused
   * @returns void
   */
  onFocus: () => void;
  /**
   * Function to be executed on key down
   */
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  /**
   * Function to be executed on blur
   * @returns void
   */
  onBlur: () => void;
  /**
   * The error text to be shown
   */
  errorText?: string;
};

/**
 * @component
 *    Displays an input textfield for a resource variable that has language support.
 *
 * @property {string}[label] - The label of the text field
 * @property {string}[description] - The description of the text field
 * @property {string}[value] - The value in the field
 * @property {function}[onChangeValue] - Function that updates the value in the field
 * @property {function}[onFocus] - unction to be executed when the field is focused
 * @property {React.KeyboardEventHandler<HTMLInputElement>}[onKeyDown] - Function to be executed on key down
 * @property {function}[onBlur] - Function to be executed on blur
 * @property {string}[errorText] - The error text to be shown
 *
 * @returns {React.ReactNode} - The rendered component
 */
export const ResourceLanguageTextField = forwardRef<
  HTMLInputElement,
  ResourceLanguageTextFieldProps
>(
  (
    { label, description, value, onChangeValue, onFocus, onKeyDown, onBlur, errorText },
    ref,
  ): React.ReactNode => {
    return (
      <>
        <div className={classes.divider} />
        <div className={classes.inputWrapper}>
          <Textfield
            label={label}
            description={description}
            size='small'
            value={value}
            onChange={(e) => onChangeValue(e.target.value)}
            onFocus={onFocus}
            error={errorText}
            ref={ref}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
          />
        </div>
      </>
    );
  },
);

ResourceLanguageTextField.displayName = 'ResourceLanguageTextField';
