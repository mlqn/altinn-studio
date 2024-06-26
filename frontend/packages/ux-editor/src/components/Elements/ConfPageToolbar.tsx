import React, { useState } from 'react';
import classes from './ConfPageToolbar.module.css';
import type { ComponentType } from 'app-shared/types/ComponentType';
import type { IToolbarElement } from '../../types/global';
import { InformationPanelComponent } from '../toolbar/InformationPanelComponent';
import { ToolbarItem } from './ToolbarItem';
import { confOnScreenComponents, paymentLayoutComponents } from '../../data/formItemConfig';
import { getComponentTitleByComponentType } from '../../utils/language';
import { mapComponentToToolbarElement } from '../../utils/formLayoutUtils';
import { useTranslation } from 'react-i18next';

const getAvailableComponentList = (confPageType: ConfPageType) => {
  switch (confPageType) {
    case 'receipt':
      return confOnScreenComponents;
    case 'payment':
      return paymentLayoutComponents;
    default:
      return [];
  }
};

export type ConfPageType = 'receipt' | 'payment';

export type ConfPageToolbarProps = {
  confPageType: ConfPageType;
};

export const ConfPageToolbar = ({ confPageType }: ConfPageToolbarProps) => {
  const [anchorElement, setAnchorElement] = useState<any>(null);
  const [compSelForInfoPanel, setCompSelForInfoPanel] = useState<ComponentType>(null);
  const { t } = useTranslation();
  const componentList: IToolbarElement[] = getAvailableComponentList(confPageType).map(
    mapComponentToToolbarElement,
  );
  const handleComponentInformationOpen = (component: ComponentType, event: any) => {
    setCompSelForInfoPanel(component);
    setAnchorElement(event.currentTarget);
  };

  const handleComponentInformationClose = () => {
    setCompSelForInfoPanel(null);
    setAnchorElement(null);
  };
  return (
    <div className={classes.customComponentList}>
      {componentList.map((component: IToolbarElement) => (
        <ToolbarItem
          text={getComponentTitleByComponentType(component.type, t) || component.label}
          icon={component.icon}
          componentType={component.type}
          onClick={handleComponentInformationOpen}
          key={component.type}
        />
      ))}
      <InformationPanelComponent
        anchorElement={anchorElement}
        informationPanelOpen={Boolean(anchorElement)}
        onClose={handleComponentInformationClose}
        selectedComponent={compSelForInfoPanel}
      />
    </div>
  );
};
