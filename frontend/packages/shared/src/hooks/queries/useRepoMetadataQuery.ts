import type { QueryMeta, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { Repository } from 'app-shared/types/Repository';
import { useServicesContext } from 'app-shared/contexts/ServicesContext';
import { QueryKey } from 'app-shared/types/QueryKey';
import type { AxiosError } from 'axios';

/**
 * Query function to get the metadata of a repo
 *
 * @param owner the owner of the repo
 * @param app the application
 *
 * @returns useQuery result with the Repository
 */
export const useRepoMetadataQuery = (
  owner: string,
  app: string,
  meta?: QueryMeta,
): UseQueryResult<Repository, AxiosError> => {
  const { getRepoMetadata } = useServicesContext();
  return useQuery<Repository, AxiosError>({
    queryKey: [QueryKey.RepoMetadata, owner, app],
    queryFn: () => getRepoMetadata(owner, app),
    meta,
  });
};
