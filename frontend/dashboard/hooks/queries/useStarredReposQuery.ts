import { useServicesContext } from 'app-shared/contexts/ServicesContext';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { QueryKey } from 'app-shared/types/QueryKey';
import type { RepoIncludingStarredData } from 'dashboard/utils/repoUtils/repoUtils';

export const useStarredReposQuery = (): UseQueryResult<RepoIncludingStarredData[]> => {
  const { getStarredRepos } = useServicesContext();
  return useQuery({
    queryKey: [QueryKey.StarredRepos],
    queryFn: () =>
      getStarredRepos().then((data) => data.map((repo) => ({ ...repo, hasStarred: true }))),
  });
};
