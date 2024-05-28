import { type MutableRefObject, useEffect, useCallback, useRef } from 'react';
import type BpmnModeler from 'bpmn-js/lib/Modeler';
import { useBpmnContext } from '../contexts/BpmnContext';
import { useBpmnModeler } from './useBpmnModeler';
import { getBpmnEditorDetailsFromBusinessObject } from '../utils/hookUtils';
import { useBpmnConfigPanelFormContext } from '../contexts/BpmnConfigPanelContext';
import { useBpmnApiContext } from '../contexts/BpmnApiContext';
import {
  AddProcessTaskManager,
  RemoveProcessTaskManager,
  type TaskEvent,
} from '../utils/ProcessTaskManager';

// Wrapper around bpmn-js to Reactify it

type UseBpmnViewerResult = {
  canvasRef: MutableRefObject<HTMLDivElement>;
  modelerRef: MutableRefObject<BpmnModeler>;
};

export const useBpmnEditor = (): UseBpmnViewerResult => {
  const { getUpdatedXml, bpmnXml, modelerRef, setBpmnDetails } = useBpmnContext();
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const { metaDataFormRef, resetForm } = useBpmnConfigPanelFormContext();
  const { getModeler, destroyModeler } = useBpmnModeler();

  const {
    addLayoutSet,
    deleteLayoutSet,
    addDataTypeToAppMetadata,
    deleteDataTypeFromAppMetadata,
    saveBpmn,
    layoutSets,
    onProcessTaskAdd,
    onProcessTaskRemove,
  } = useBpmnApiContext();

  // Needs to update the layoutSetsRef.current when layoutSets changes to avoid staled data in the event listeners
  const layoutSetsRef = useRef(layoutSets);
  useEffect(() => {
    layoutSetsRef.current = layoutSets;
  }, [layoutSets]);

  const handleCommandStackChanged = async () => {
    saveBpmn(await getUpdatedXml(), metaDataFormRef.current || null);
    resetForm();
  };

  const handleShapeAdd = (taskEvent: TaskEvent): void => {
    const bpmnDetails = getBpmnEditorDetailsFromBusinessObject(taskEvent?.element?.businessObject);
    const addProcessTaskManager = new AddProcessTaskManager(
      addLayoutSet,
      addDataTypeToAppMetadata,
      bpmnDetails,
      onProcessTaskAdd,
    );

    addProcessTaskManager.handleTaskAdd(taskEvent);
    updateBpmnDetailsByTaskEvent(taskEvent);
  };

  const handleShapeRemove = (taskEvent: TaskEvent): void => {
    const bpmnDetails = getBpmnEditorDetailsFromBusinessObject(taskEvent?.element?.businessObject);
    const removeProcessTaskManager = new RemoveProcessTaskManager(
      layoutSetsRef.current,
      deleteLayoutSet,
      deleteDataTypeFromAppMetadata,
      bpmnDetails,
      onProcessTaskRemove,
    );

    removeProcessTaskManager.handleTaskRemove(taskEvent);
    setBpmnDetails(null);
  };

  const updateBpmnDetailsByTaskEvent = useCallback(
    (taskEvent: TaskEvent) => {
      const bpmnDetails = {
        ...getBpmnEditorDetailsFromBusinessObject(taskEvent.element?.businessObject),
        element: taskEvent.element,
      };
      setBpmnDetails(bpmnDetails);
    },
    [setBpmnDetails],
  );

  const initializeEditor = async () => {
    try {
      await modelerRef.current.importXML(bpmnXml);
      const canvas: any = modelerRef.current.get('canvas');
      canvas.zoom('fit-viewport');
    } catch (exception) {
      console.log('An error occurred while rendering the viewer:', exception);
    }
  };

  const initializeBpmnChanges = () => {
    modelerRef.current.on('commandStack.changed', async () => {
      await handleCommandStackChanged();
    });
    modelerRef.current.on('shape.add', (taskEvent: TaskEvent) => {
      handleShapeAdd(taskEvent);
    });
    modelerRef.current.on('shape.remove', (taskEvent: TaskEvent) => {
      handleShapeRemove(taskEvent);
    });
  };

  useEffect(() => {
    if (!canvasRef.current) {
      console.log('Canvas reference is not yet available in the DOM.');
    }
    // GetModeler can only be fetched from this hook once since the modeler creates a
    // new instance and will attach the same canvasRef container to all instances it fetches.
    // Set modelerRef.current to the Context so that it can be used in other components
    modelerRef.current = getModeler(canvasRef.current);

    initializeEditor().then(() => {
      // Wait for the initializeEditor to be initialized before attaching event listeners, to avoid trigger add.shape events on first draw
      initializeBpmnChanges();
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Missing dependencies are not added to avoid getModeler to be called multiple times

  useEffect(() => {
    const eventBus: BpmnModeler = modelerRef.current.get('eventBus');
    eventBus.on('element.click', updateBpmnDetailsByTaskEvent);
  }, [modelerRef, updateBpmnDetailsByTaskEvent]);

  useEffect(() => {
    // Destroy the modeler instance when the component is unmounted
    return () => {
      destroyModeler();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { canvasRef, modelerRef };
};
