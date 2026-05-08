import React, { useEffect, useRef } from 'react';
import $ from 'jquery';
import 'jstree';
import 'jstree/dist/themes/default/style.min.css';

const TYPE_TO_STRUCT_KEY = {
  region: 'region',
  pais: 'country',
  negocio: 'business',
  plant: 'plant'
};

// Deepest-first order: plant > business > country > region
const DEPTH_ORDER = ['plant', 'business', 'country', 'region'];

function isDeepestLevelForPath(structKey, path) {
  for (const key of DEPTH_ORDER) {
    if (key === structKey) return true;   // reached this level — no deeper non-null found
    if (path[key] != null) return false;  // a deeper level exists
  }
  return true;
}

const JSTreeComponent = ({ treeId, data, onSelectionChange, preSelectPaths = [] }) => {
  const treeRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const $tree = $(`#${treeId}`);

    if ($tree.jstree(true)) {
      $tree.jstree('destroy');
    }

    $tree.jstree({
      core: { data, themes: { icons: true } },
      checkbox: { keep_selected_style: false, three_state: true, cascade: 'up+down+undetermined' },
      plugins: ['checkbox']
    });

    $tree.on('ready.jstree', function (e, jstreeData) {
      if (!preSelectPaths || preSelectPaths.length === 0) return;

      const instance = jstreeData.instance;
      const allNodes = instance.get_json('#', { flat: true });
      const toCheck = [];

      allNodes.forEach((node) => {
        const nodeId = String(node.id);
        const atIdx = nodeId.indexOf('@');
        if (atIdx === -1) return;

        const typePrefix = nodeId.slice(0, atIdx);
        const afterAt = nodeId.slice(atIdx + 1);
        const idParts = afterAt.split('_');
        const lastId = idParts[idParts.length - 1];

        const structKey = TYPE_TO_STRUCT_KEY[typePrefix];
        if (!structKey) return;

        const match = preSelectPaths.some(
          (path) =>
            path[structKey] != null &&
            String(path[structKey]) === String(lastId) &&
            isDeepestLevelForPath(structKey, path)
        );

        if (match) toCheck.push(nodeId);
      });

      toCheck.forEach((nodeId) => {
        // Expand all ancestor nodes so the checked node is visible
        const nodeObj = instance.get_node(nodeId);
        if (nodeObj && Array.isArray(nodeObj.parents)) {
          nodeObj.parents.forEach((parentId) => {
            if (parentId !== '#') instance.open_node(parentId);
          });
        }
        instance.check_node(nodeId);
      });
    });

    $tree.on('changed.jstree', function (e, data) {
      if (onSelectionChange) {
        const selectedNodes = data.instance.get_selected(true);
        onSelectionChange(selectedNodes);
      }
    });

    return () => {
      if ($tree.jstree(true)) {
        $tree.off('changed.jstree');
        $tree.off('ready.jstree');
        $tree.jstree('destroy');
      }
    };
  }, [treeId, data, onSelectionChange, preSelectPaths]);

  return <div id={treeId} ref={treeRef} style={{ minHeight: '200px' }} />;
};

export default JSTreeComponent;
