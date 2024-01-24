import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useServicesContext } from 'app-shared/contexts/ServicesContext';
import { QueryKey } from 'app-shared/types/QueryKey';
import type { DatamodelMetadataJson } from 'app-shared/types/DatamodelMetadata';
import type { AxiosError } from 'axios';

export const useDatamodelsJsonQuery = (
  owner,
  app,
): UseQueryResult<DatamodelMetadataJson[], AxiosError> => {
  const { getDatamodelsJson } = useServicesContext();
  return useQuery<DatamodelMetadataJson[], AxiosError>({
    queryKey: [QueryKey.DatamodelsJson, owner, app],
    queryFn: () => getDatamodelsJson(owner, app),
  });
};
