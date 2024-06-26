import { useSearchParamsState } from 'app-shared/hooks/useSearchParamsState';
import { useFormLayoutSettingsQuery } from './queries/useFormLayoutSettingsQuery';
import { useStudioEnvironmentParams } from 'app-shared/hooks/useStudioEnvironmentParams';

export type UseSelectedFormLayoutNameResult = {
  selectedFormLayoutName: string;
  setSelectedFormLayoutName: (layoutName: string) => void;
};

export const useSelectedFormLayoutName = (
  selectedFormLayoutSetName: string,
): UseSelectedFormLayoutNameResult => {
  const { org, app } = useStudioEnvironmentParams();
  const { data: formLayoutSettings } = useFormLayoutSettingsQuery(
    org,
    app,
    selectedFormLayoutSetName,
  );
  const layoutPagesOrder = formLayoutSettings?.pages?.order;

  const isValidLayout = (layoutName: string): boolean => {
    const isExistingLayout = layoutPagesOrder?.includes(layoutName);
    const isReceipt = formLayoutSettings?.receiptLayoutName === layoutName;
    return isExistingLayout || isReceipt;
  };

  const [selectedFormLayoutName, setSelectedFormLayoutName] = useSearchParamsState<string>(
    'layout',
    undefined,
    (value: string) => {
      return isValidLayout(value) ? value : undefined;
    },
  );

  return {
    selectedFormLayoutName,
    setSelectedFormLayoutName,
  };
};
