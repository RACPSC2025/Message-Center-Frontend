import {
  Apps,
  AssignmentTurnedIn,
  CalendarToday,
  CheckCircleOutline,
  Forum,
  Gavel,
  MailOutline,
  Search
} from '@mui/icons-material';
import NatureIcon from '@mui/icons-material/Nature';
import defaultConfig from './defaultConfig.json';
import { modulesConfiguration } from './modulesConfig';

const MODULE_DEFINITIONS = [
  {
    configKey: 'legal_matrix',
    moduleName: 'LegalMatriz',
    key: 'LegalMatriz',
    fallbackLabel: 'legal_parent',
    icon: <Apps fontSize="small" />
  },
  {
    configKey: 'task',
    moduleName: 'events',
    key: 'events',
    fallbackLabel: 'tasks',
    icon: <CalendarToday fontSize="small" />
  },
  {
    configKey: 'findings',
    moduleName: 'findings',
    key: 'findings',
    fallbackLabel: 'findings',
    icon: <Search fontSize="small" />
  },
  {
    configKey: 'actions',
    moduleName: 'actions',
    key: 'actions',
    fallbackLabel: 'Actions',
    icon: <CheckCircleOutline fontSize="small" />
  },
  {
    configKey: 'permit_manager',
    moduleName: 'permit_manager',
    key: 'permit_manager',
    fallbackLabel: 'Permit Manager',
    icon: <AssignmentTurnedIn fontSize="small" />
  },
  {
    configKey: 'ambiental_permit',
    moduleName: 'ambiental_permit',
    key: 'ambiental_permit',
    fallbackLabel: 'Ambiental Permit',
    icon: <NatureIcon fontSize="small" />
  },
  {
    configKey: 'sanctioning_processes',
    moduleName: 'sanctioning_processes',
    key: 'sanctioning_processes',
    fallbackLabel: 'Sanctioning Processes',
    icon: <Gavel fontSize="small" />
  },
  {
    configKey: 'legal_comunications',
    moduleName: 'legal_comunications',
    key: 'legal_comunications',
    fallbackLabel: 'Legal Communications',
    icon: <Forum fontSize="small" />
  }
];

const getLocalizedTitle = (moduleConfig, fallbackLabel, language = 'es') => {
  const preferredTitle = language === 'en' ? moduleConfig?.title_en : moduleConfig?.title_es;
  const secondaryTitle = language === 'en' ? moduleConfig?.title_es : moduleConfig?.title_en;
  return preferredTitle || secondaryTitle || fallbackLabel;
};

const getModulePermissionsFromPlatformConfig = (platformConfig = defaultConfig, language = 'es') => {
  const modules = platformConfig?.modules ?? {};

  const mappedPermissions = MODULE_DEFINITIONS.map((definition) => {
    const moduleConfig = modules?.[definition.configKey];
    const hasLocalizedTitle = Boolean(moduleConfig?.title_es || moduleConfig?.title_en);

    return {
      moduleName: definition.moduleName,
      key: definition.key,
      label: getLocalizedTitle(moduleConfig, definition.fallbackLabel, language),
      icon: definition.icon,
      visibility: moduleConfig?.enabled ?? false,
      skipTranslation: hasLocalizedTitle
    };
  });

  return [
    {
      moduleName: 'notifications',
      key: 'notifications',
      label: 'Messages',
      icon: <MailOutline fontSize="small" />
    },
    ...mappedPermissions
  ];
};

export const generalConfiguration = {
  // Put general configuration here, which will be apply for all domains/subdomains
  subdomain: 'GENERAL',
  modulePermissions: getModulePermissionsFromPlatformConfig(defaultConfig, 'es')
};

// Deep merge utility function
export const deepMerge = (target, source) => {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      target[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
};

const DEFINITION_BY_CONFIG_KEY = Object.fromEntries(
  MODULE_DEFINITIONS.map((def) => [def.configKey, def])
);

export const getModuleGroupsFromPlatformConfig = (platformConfig = defaultConfig, language = 'es') => {
  const modulesGroup = platformConfig?.modules_group ?? {};
  const modules = platformConfig?.modules ?? {};

  return Object.entries(modulesGroup)
    .filter(([, group]) => group.enable === true)
    .map(([groupKey, group]) => {
      const title =
        language === 'en'
          ? group.title_en || group.title_es
          : group.title_es || group.title_en;

      const groupModules = Object.entries(group.modules ?? {})
        .filter(([, included]) => included === true)
        .map(([configKey]) => {
          const definition = DEFINITION_BY_CONFIG_KEY[configKey];
          if (!definition) return null;
          const moduleConfig = modules[configKey];
          if (!moduleConfig?.enabled) return null;
          return {
            moduleName: definition.moduleName,
            key: definition.key,
            label: getLocalizedTitle(moduleConfig, definition.fallbackLabel, language),
            icon: definition.icon,
            configKey,
            skipTranslation: Boolean(moduleConfig?.title_es || moduleConfig?.title_en)
          };
        })
        .filter(Boolean);

      return { groupKey, title, order: group.order ?? 999, modules: groupModules };
    })
    .filter((group) => group.modules.length > 0)
    .sort((a, b) => a.order - b.order);
};

export const getGlobalConfiguration = (subdomain, options = {}) => {
  const { platformConfig = defaultConfig, language = 'es' } = options;
  const baseConfiguration = {
    ...generalConfiguration,
    modulePermissions: getModulePermissionsFromPlatformConfig(platformConfig, language),
    moduleGroups: getModuleGroupsFromPlatformConfig(platformConfig, language)
  };

  // Find specific configuration for the subdomain
  const specificConfig = modulesConfiguration?.find((config) => config.subdomain === subdomain);

  // If no specific configuration is found, return the general configuration
  if (!specificConfig) {
    return baseConfiguration;
  }

  // Deep merge configurations
  const mergedConfiguration = deepMerge({ ...baseConfiguration }, specificConfig);

  // Handle deep merge for modulePermissions
  if (specificConfig?.modulePermissions) {
    mergedConfiguration.modulePermissions = baseConfiguration?.modulePermissions.map(
      (generalPermission) => {
        const specificPermission = specificConfig?.modulePermissions?.find(
          (specific) => specific?.moduleName === generalPermission?.moduleName
        );
        return specificPermission || generalPermission;
      }
    );
  }

  return mergedConfiguration ?? {};
};
