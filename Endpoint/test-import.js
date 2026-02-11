// Test básico para verificar que las importaciones funcionan
try {
  const { TaskDashboard } = require('./index.js');
  console.log('✅ TaskDashboard importado correctamente');
  console.log('✅ Tipo:', typeof TaskDashboard);
  console.log('✅ Nombre del componente:', TaskDashboard.displayName || TaskDashboard.name);
} catch (error) {
  console.error('❌ Error al importar TaskDashboard:', error.message);
}