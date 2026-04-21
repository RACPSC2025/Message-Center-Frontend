/**
 * Playwright custom reporter — genera Markdown detallado por ejecución.
 * Archivo: test/results/YYYY-MM-DD_HH-mm-ss_results.md
 */

const fs   = require('fs');
const path = require('path');

const CRITICALITY_ORDER = { 'CRÍTICO': 0, 'ALTO': 1, 'MEDIO': 2, 'BAJO': 3 };
const CRITICALITY_BADGE = {
  'CRÍTICO': '🔴 CRÍTICO',
  'ALTO':    '🟠 ALTO',
  'MEDIO':   '🟡 MEDIO',
  'BAJO':    '🟢 BAJO',
};

function stripAnsi(str) {
  return (str || '').replace(/\x1b\[[0-9;]*m/g, '');
}

function pad(n) { return String(n).padStart(2, '0'); }

function getAnnotation(test, type) {
  return test.annotations?.find(a => a.type === type)?.description || '';
}

function relPath(absPath) {
  if (!absPath) return '';
  return path.relative(process.cwd(), absPath).replace(/\\/g, '/');
}

class MarkdownReporter {
  constructor() {
    this.results  = [];   // { project, suite, title, status, duration, error, shots, annotations }
    this.startTime = null;
  }

  onBegin(_config, suite) {
    this.startTime = new Date();
    this.totalTests = suite.allTests().length;
  }

  onTestEnd(test, result) {
    // Named attachments (screenshots taken inside tests via testInfo.attach)
    const namedShots = result.attachments
      .filter(a => a.contentType === 'image/png' && a.path)
      .map(a => ({ name: a.name, path: relPath(a.path) }));

    // Auto-captured failure screenshots
    const failShots = result.attachments
      .filter(a => a.name === 'screenshot' && a.path)
      .map(a => ({ name: 'failure-screenshot', path: relPath(a.path) }));

    this.results.push({
      project:     test.parent?.project()?.name || 'unknown',
      suite:       test.parent?.title || '',
      title:       test.title,
      status:      result.status,
      duration:    result.duration,
      error:       result.error ? stripAnsi(result.error.message) : null,
      shots:       [...namedShots, ...failShots],
      annotations: test.annotations || [],
    });
  }

  onEnd(_result) {
    const endTime  = new Date();
    const d        = this.startTime;
    const timestamp = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
    const totalSec  = ((endTime - this.startTime) / 1000).toFixed(1);

    const passed  = this.results.filter(r => r.status === 'passed');
    const failed  = this.results.filter(r => r.status === 'failed');
    const flaky   = this.results.filter(r => r.status === 'flaky');
    const skipped = this.results.filter(r => r.status === 'skipped');

    const overallOk = failed.length === 0;
    const statusBadge = overallOk ? '✅ PASÓ' : `❌ FALLÓ (${failed.length})`;

    // ── Header ─────────────────────────────────────────────────────────────────
    let md = `# Reporte de Pruebas E2E — ${d.toLocaleString('es-CO')}\n\n`;
    md += `> **Módulo revisado:** Notifications  \n`;
    md += `> **Ruta:** \`http://localhost:3000/amatia/message-center#/view/notifications\`  \n`;
    md += `> **Resultado global:** ${statusBadge}  \n`;
    md += `> **Tests:** ${this.results.length} total — ✅ ${passed.length} pasaron · ❌ ${failed.length} fallaron`;
    if (flaky.length)   md += ` · ⚠️ ${flaky.length} intermitentes`;
    if (skipped.length) md += ` · ⏭️ ${skipped.length} omitidos`;
    md += `  \n`;
    md += `> **Duración total:** ${totalSec}s  \n`;
    md += `> **Resoluciones probadas:** desktop-1280 (1280×800) · tablet-768 (768×1024) · mobile-375 (375×667)  \n\n`;
    md += `---\n\n`;

    // ── Por resolución ─────────────────────────────────────────────────────────
    const projects = [...new Set(this.results.map(r => r.project))];
    for (const proj of projects) {
      const projResults = this.results.filter(r => r.project === proj);
      const projPassed  = projResults.filter(r => r.status === 'passed').length;
      const projFailed  = projResults.filter(r => r.status === 'failed').length;
      const viewport = proj.includes('1280') ? '1280×800' : proj.includes('768') ? '768×1024' : '375×667';

      md += `## 📐 ${proj}  —  ${viewport}\n\n`;
      md += `| Estado | Tests |\n|--------|-------|\n`;
      md += `| ✅ Pasaron | ${projPassed} |\n`;
      md += `| ❌ Fallaron | ${projFailed} |\n\n`;

      // Por suite
      const suites = [...new Set(projResults.map(r => r.suite))];
      for (const suite of suites) {
        const suiteResults = projResults.filter(r => r.suite === suite);
        md += `### ${suite}\n\n`;

        for (const r of suiteResults) {
          const icon         = r.status === 'passed' ? '✅' : r.status === 'failed' ? '❌' : r.status === 'flaky' ? '⚠️' : '⏭️';
          const dur          = `${(r.duration / 1000).toFixed(1)}s`;
          const criticality  = getAnnotation({ annotations: r.annotations }, 'criticality');
          const elements     = getAnnotation({ annotations: r.annotations }, 'elements');
          const badge        = CRITICALITY_BADGE[criticality] || criticality;

          md += `#### ${icon} ${r.title}\n\n`;
          md += `| Campo | Detalle |\n|-------|--------|\n`;
          md += `| Estado | ${icon} ${r.status} |\n`;
          md += `| Duración | \`${dur}\` |\n`;
          if (criticality) md += `| Criticidad | ${badge} |\n`;
          md += `\n`;

          if (elements) {
            md += `**Elementos revisados:**\n\`\`\`\n${elements}\n\`\`\`\n\n`;
          }

          // Screenshots del test
          const testShots = r.shots.filter(s => s.name !== 'failure-screenshot');
          if (testShots.length > 0) {
            md += `**Screenshots:**\n\n`;
            for (const s of testShots) {
              md += `- 📸 \`${s.path}\`\n`;
            }
            md += `\n`;
          }

          // Error
          if (r.error) {
            md += `**Error detectado:**\n\`\`\`\n${r.error.split('\n').slice(0, 15).join('\n')}\n\`\`\`\n\n`;
            const failShot = r.shots.find(s => s.name === 'failure-screenshot');
            if (failShot) {
              md += `**Screenshot del error:** \`${failShot.path}\`\n\n`;
            }
          }
        }
      }
    }

    // ── Tabla resumen global ────────────────────────────────────────────────────
    md += `---\n\n## Resumen Global\n\n`;
    md += `| Resolución | ✅ Pasaron | ❌ Fallaron | Total |\n`;
    md += `|------------|-----------|------------|-------|\n`;
    for (const proj of projects) {
      const pr = this.results.filter(r => r.project === proj);
      md += `| \`${proj}\` | ${pr.filter(r => r.status==='passed').length} | ${pr.filter(r => r.status==='failed').length} | ${pr.length} |\n`;
    }
    md += `| **TOTAL** | **${passed.length}** | **${failed.length}** | **${this.results.length}** |\n\n`;

    // ── Sección de fallos ───────────────────────────────────────────────────────
    if (failed.length > 0) {
      md += `---\n\n## ❌ Fallos Detallados\n\n`;
      const sorted = [...failed].sort((a, b) =>
        (CRITICALITY_ORDER[getAnnotation({ annotations: a.annotations }, 'criticality')] ?? 9) -
        (CRITICALITY_ORDER[getAnnotation({ annotations: b.annotations }, 'criticality')] ?? 9)
      );
      for (const r of sorted) {
        const criticality = getAnnotation({ annotations: r.annotations }, 'criticality');
        const route       = getAnnotation({ annotations: r.annotations }, 'route');
        const badge       = CRITICALITY_BADGE[criticality] || criticality;
        md += `### ❌ [${r.project}] ${r.suite} › ${r.title}\n\n`;
        md += `- **Criticidad:** ${badge}\n`;
        if (route) md += `- **Ruta:** \`${route}\`\n`;
        md += `- **Resolución:** \`${r.project}\`\n\n`;
        if (r.error) {
          md += `\`\`\`\n${r.error.split('\n').slice(0, 20).join('\n')}\n\`\`\`\n\n`;
        }
        const failShot = r.shots.find(s => s.name === 'failure-screenshot');
        if (failShot) {
          md += `**Screenshot auto-capturado en fallo:**\n\`${failShot.path}\`\n\n`;
        }
      }
    } else {
      md += `---\n\n## ✅ Sin Fallos\n\nTodas las pruebas pasaron en todas las resoluciones.\n\n`;
    }

    // ── Pie con ruta del archivo ───────────────────────────────────────────────
    const outFile = `test/results/${timestamp}_results.md`;
    md += `---\n\n## 📁 Archivos Generados\n\n`;
    md += `| Tipo | Ruta |\n|------|------|\n`;
    md += `| 📄 Este reporte | \`${outFile}\` |\n`;
    md += `| 🖼️ Screenshots desktop | \`test/results/screenshots/desktop-1280/\` |\n`;
    md += `| 🖼️ Screenshots tablet | \`test/results/screenshots/tablet-768/\` |\n`;
    md += `| 🖼️ Screenshots mobile | \`test/results/screenshots/mobile-375/\` |\n`;
    md += `| 🔴 Artifacts de fallo | \`test/results/artifacts/\` |\n`;
    md += `| 🌐 Reporte HTML | \`test/results/html-report/index.html\` |\n\n`;
    md += `_Generado automáticamente por \`test/md-reporter.js\` — ${new Date().toISOString()}_\n`;

    // ── Escribir archivo ───────────────────────────────────────────────────────
    const outDir = path.join(process.cwd(), 'test', 'results');
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, `${timestamp}_results.md`);
    fs.writeFileSync(outPath, md, 'utf8');

    console.log(`\n📄 Reporte MD generado: ${outFile}`);
    console.log(`📁 Screenshots: test/results/screenshots/<resolución>/`);
    if (failed.length > 0) {
      console.log(`⚠️  Artifacts de fallo: test/results/artifacts/`);
    }
  }
}

module.exports = MarkdownReporter;
