import React from 'react';
import { screen } from '@testing-library/react';
import type { NewExpressionButtonProps } from './NewExpressionButton';
import { NewExpressionButton } from './NewExpressionButton';
import type { ServicesContextProps } from 'app-shared/contexts/ServicesContext';
import { renderWithMockStore } from '../../../testing/mocks';
import { textMock } from '@studio/testing/mocks/i18nMock';
import userEvent from '@testing-library/user-event';
import { ExpressionPropertyBase } from '../../../types/Expressions';

const user = userEvent.setup();

describe('NewExpressionButton', () => {
  afterEach(jest.clearAllMocks);

  it('renders add expression button by default', () => {
    render({});

    const addButton = screen.getByText(textMock('right_menu.expressions_add'));

    expect(addButton).toBeInTheDocument();
  });

  it('renders dropdown when button is clicked', async () => {
    render({});

    const addButton = screen.getByText(textMock('right_menu.expressions_add'));
    await user.click(addButton);
    const dropdown = screen.getByRole('heading', {
      name: textMock('right_menu.expressions_property'),
    });
    expect(dropdown).toBeInTheDocument();
  });

  it('calls onAddExpression when an option is selected', async () => {
    const onAddExpressionMock = jest.fn();
    render({
      props: {
        onAddExpression: onAddExpressionMock,
      },
    });

    const addButton = screen.getByText(textMock('right_menu.expressions_add'));
    await user.click(addButton);
    const dropdownOption = screen.getByRole('menuitem', {
      name: textMock('right_menu.expressions_property_read_only'),
    });
    await user.click(dropdownOption);

    expect(onAddExpressionMock).toHaveBeenCalledWith(optionsMock[1]);
    expect(onAddExpressionMock).toHaveBeenCalledTimes(1);
  });
});

const optionsMock = [ExpressionPropertyBase.Required, ExpressionPropertyBase.ReadOnly];

const render = ({
  props = {},
  queries = {},
}: {
  props?: Partial<NewExpressionButtonProps>;
  queries?: Partial<ServicesContextProps>;
}) => {
  const defaultProps: NewExpressionButtonProps = {
    options: optionsMock,
    onAddExpression: jest.fn(),
  };
  return renderWithMockStore({}, queries)(<NewExpressionButton {...defaultProps} {...props} />);
};
