import type {
  FormLayoutsSelector,
  IFormDesignerComponents,
  IFormDesignerContainers,
  IFormLayoutOrder,
} from '../types/global';

export const getAllLayoutContainers: FormLayoutsSelector<IFormDesignerContainers> = (
  formLayoutsData,
) => Object.values(formLayoutsData).reduce((acc, layout) => ({ ...acc, ...layout.containers }), {});

export const getAllLayoutComponents: FormLayoutsSelector<IFormDesignerComponents> = (
  formLayoutsData,
) => Object.values(formLayoutsData).reduce((acc, layout) => ({ ...acc, ...layout.components }), {});

export const getFullLayoutOrder: FormLayoutsSelector<IFormLayoutOrder> = (formLayoutsData) =>
  Object.values(formLayoutsData).reduce((acc, layout) => ({ ...acc, ...layout.order }), {});
