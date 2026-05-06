import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

const cache = { data: null };

export function useNavConfig() {
  const [config, setConfig] = useState(cache.data);

  // API is the source of truth — both live in Redux after fetchPlatformConfig
  const modulesGroup = useSelector((state) => state.platformConfig?.data?.modules_group ?? {});
  const platformModules = useSelector((state) => state.platformConfig?.data?.modules ?? {});

  // nav-config.json is decoration only: icons, routes, routeKey, dataId, color, name overrides
  useEffect(() => {
    if (cache.data) return;
    fetch(`${process.env.PUBLIC_URL}/nav-config.json`)
      .then((r) => r.json())
      .then((data) => { cache.data = data; setConfig(data); })
      .catch(() => setConfig({ workareas: [], modules: [] }));
  }, []);

  // Build module list from API; decorate with UI fields from nav-config.json
  const modules = useMemo(() => {
    const decorations = config?.modules ?? [];
    return Object.entries(platformModules)
      .filter(([, apiMod]) => apiMod.enabled !== false)
      .map(([key, apiMod]) => {
        const dec = decorations.find((d) => d.platformKey === key) ?? {};
        return {
          slug: dec.slug ?? key,
          platformKey: key,
          routeKey: dec.routeKey ?? key,
          dataId: dec.dataId ?? null,
          route: dec.route ?? `/view/${key}`,
          icon: dec.icon ?? 'LayoutGrid',
          color: dec.color ?? '#00bcd4',
          name: {
            es: dec.name?.es ?? apiMod.title_es ?? key,
            en: dec.name?.en ?? apiMod.title_en ?? key,
          },
        };
      });
  }, [platformModules, config]);

  // Build workarea list from API groups; decorate with icon/color/name from nav-config.json
  const workareas = useMemo(() => {
    const decorations = config?.workareas ?? [];
    const enabledByPlatformKey = new Set(modules.map((m) => m.platformKey));
    const enabledSlugs = new Set(modules.map((m) => m.slug));

    return Object.entries(modulesGroup)
      .filter(([, g]) => g.enable !== false) // API uses singular "enable" on groups
      .sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0))
      .map(([key, apiGroup]) => {
        const dec = decorations.find((d) => d.slug === key) ?? {};
        // Resolve API module keys → nav slugs via platformKey bridge
        const waModuleSlugs = Object.keys(apiGroup.modules ?? {})
          .filter((mKey) => enabledByPlatformKey.has(mKey))
          .map((mKey) => modules.find((m) => m.platformKey === mKey)?.slug ?? mKey)
          .filter((slug) => enabledSlugs.has(slug));

        return {
          slug: key,
          name: {
            es: dec.name?.es ?? apiGroup.title_es ?? key,
            en: dec.name?.en ?? apiGroup.title_en ?? key,
          },
          icon: dec.icon ?? 'LayoutGrid',
          color: dec.color ?? '#00bcd4',
          modules: waModuleSlugs,
        };
      })
      .filter((wa) => wa.modules.length > 0);
  }, [modulesGroup, modules, config]);

  const getModule = (slug) => modules.find((m) => m.slug === slug);

  const getActiveWorkarea = (activeModuleSlug) =>
    workareas.find((wa) => wa.modules.includes(activeModuleSlug)) ?? workareas[0];

  // Ready only when both the Redux API data and the decoration JSON are loaded
  const loaded = !!config && Object.keys(platformModules).length > 0;

  return { workareas, modules, getModule, getActiveWorkarea, loaded };
}
