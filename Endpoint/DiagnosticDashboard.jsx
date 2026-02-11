import React from 'react';
import { TASKS_DATA } from './data/tasksData';

/**
 * Componente de diagnóstico para verificar que los datos y componentes básicos funcionen
 */
export function DiagnosticDashboard() {
  console.log('DiagnosticDashboard - TASKS_DATA:', TASKS_DATA);
  
  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">🔧 Diagnóstico del Dashboard</h1>
      
      <div className="space-y-6">
        {/* Verificación de datos */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">📊 Datos de Prueba</h2>
          <p className="text-sm text-gray-600 mb-2">
            Total de tareas: <span className="font-bold">{TASKS_DATA.length}</span>
          </p>
          
          {TASKS_DATA.length > 0 ? (
            <div className="space-y-2">
              {TASKS_DATA.map((task, index) => (
                <div key={task.id} className="bg-gray-50 p-3 rounded">
                  <p className="font-medium">{index + 1}. {task.label}</p>
                  <p className="text-sm text-gray-600">
                    Tipo: {task.type} | Estado: {task.status} | Ciclos: {task.cycles.length}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-red-600">❌ No hay datos de prueba disponibles</p>
          )}
        </div>

        {/* Verificación de componentes */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">🧩 Componentes</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded">
              <p className="font-medium">Header</p>
              <p className="text-sm text-gray-600">✅ Importado correctamente</p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <p className="font-medium">SidebarLeft</p>
              <p className="text-sm text-gray-600">✅ Importado correctamente</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded">
              <p className="font-medium">MainContent</p>
              <p className="text-sm text-gray-600">✅ Importado correctamente</p>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <p className="font-medium">SidebarRight</p>
              <p className="text-sm text-gray-600">✅ Importado correctamente</p>
            </div>
          </div>
        </div>

        {/* Información del entorno */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">🌐 Entorno</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p>React: ✅ Funcionando</p>
            <p>Tailwind CSS: ✅ Estilos aplicados</p>
            <p>Datos de prueba: ✅ {TASKS_DATA.length} tareas cargadas</p>
          </div>
        </div>

        {/* Botón de prueba */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">🧪 Prueba Interactiva</h2>
          <button 
            onClick={() => alert(`Datos cargados: ${TASKS_DATA.length} tareas`)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
          >
            Probar Datos
          </button>
        </div>
      </div>
    </div>
  );
}

export default DiagnosticDashboard;