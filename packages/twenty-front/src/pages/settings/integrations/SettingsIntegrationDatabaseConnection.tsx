import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IconSettings } from 'twenty-ui';

import { useDeleteOneDatabaseConnection } from '@/databases/hooks/useDeleteOneDatabaseConnection';
import { useGetDatabaseConnection } from '@/databases/hooks/useGetDatabaseConnection';
import { useGetDatabaseConnectionTables } from '@/databases/hooks/useGetDatabaseConnectionTables';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationDatabaseTablesListCard } from '@/settings/integrations/components/SettingsIntegrationDatabaseTablesListCard';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { getConnectionDbName } from '@/settings/integrations/utils/getConnectionDbName';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { SettingsIntegrationDatabaseConnectionSummaryCard } from '~/pages/settings/integrations/SettingsIntegrationDatabaseConnectionSummaryCard';

export const SettingsIntegrationDatabaseConnection = () => {
  const { databaseKey = '', connectionId = '' } = useParams();
  const navigate = useNavigate();

  const [integrationCategoryAll] = useSettingsIntegrationCategories();
  const integration = integrationCategoryAll.integrations.find(
    ({ from: { key } }) => key === databaseKey,
  );

  const isAirtableIntegrationEnabled = useIsFeatureEnabled(
    'IS_AIRTABLE_INTEGRATION_ENABLED',
  );
  const isPostgresqlIntegrationEnabled = useIsFeatureEnabled(
    'IS_POSTGRESQL_INTEGRATION_ENABLED',
  );
  const isIntegrationAvailable =
    !!integration &&
    ((databaseKey === 'airtable' && isAirtableIntegrationEnabled) ||
      (databaseKey === 'postgresql' && isPostgresqlIntegrationEnabled));

  const { connection, loading } = useGetDatabaseConnection({
    databaseKey,
    connectionId,
    skip: !isIntegrationAvailable,
  });

  const { deleteOneDatabaseConnection } = useDeleteOneDatabaseConnection();

  const deleteConnection = async () => {
    if (!connection) return;

    await deleteOneDatabaseConnection({ id: connection.id });

    navigate(`${settingsIntegrationsPagePath}/${databaseKey}`);
  };

  useEffect(() => {
    if (!isIntegrationAvailable || (!loading && !connection)) {
      navigate(AppPath.NotFound);
    }
  }, [
    integration,
    databaseKey,
    navigate,
    isIntegrationAvailable,
    connection,
    loading,
  ]);

  const { tables } = useGetDatabaseConnectionTables({
    connectionId,
    skip: !isIntegrationAvailable || !connection,
  });

  if (!isIntegrationAvailable || !connection) return null;

  const settingsIntegrationsPagePath = getSettingsPagePath(
    SettingsPath.Integrations,
  );

  const connectionName = getConnectionDbName({ integration, connection });

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <Breadcrumb
          links={[
            {
              children: 'Integrations',
              href: settingsIntegrationsPagePath,
            },
            {
              children: integration.text,
              href: `${settingsIntegrationsPagePath}/${databaseKey}`,
            },
            { children: connectionName },
          ]}
        />
        <Section>
          <H2Title title="About" description="About this remote object" />
          <SettingsIntegrationDatabaseConnectionSummaryCard
            databaseLogoUrl={integration.from.image}
            connectionId={connectionId}
            connectionName={connectionName}
            onRemove={deleteConnection}
          />
        </Section>
        <Section>
          <H2Title
            title="Tables"
            description="Select the tables that should be tracked"
          />
          <SettingsIntegrationDatabaseTablesListCard
            connectionId={connectionId}
            tables={tables}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
