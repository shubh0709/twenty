import { ApolloClient, useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import { UNSYNC_REMOTE_TABLE } from '@/databases/graphql/mutations/unSyncRemoteTable';
import { GET_MANY_REMOTE_TABLES } from '@/databases/graphql/queries/findManyRemoteTables';
import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import {
  RemoteTableInput,
  UnsyncRemoteTableMutation,
  UnsyncRemoteTableMutationVariables,
} from '~/generated-metadata/graphql';

export const useUnsyncRemoteTable = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate] = useMutation<
    UnsyncRemoteTableMutation,
    UnsyncRemoteTableMutationVariables
  >(UNSYNC_REMOTE_TABLE, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const unsyncRemoteTable = async (input: RemoteTableInput) => {
    return await mutate({
      variables: {
        input,
      },
      awaitRefetchQueries: true,
      refetchQueries: [getOperationName(GET_MANY_REMOTE_TABLES) ?? ''],
    });
  };

  return {
    unsyncRemoteTable,
  };
};
