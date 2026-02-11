import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchListTasksSpecial } from '../stores/tasks/fetchListTasksSlice';

const TestListTasks = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(state => state.fetchListTasksSpecial);

  useEffect(() => {
    console.log('🚀 Iniciando carga de tareas desde list_tasks endpoint...');
    dispatch(fetchListTasksSpecial());
  }, [dispatch]);

  useEffect(() => {
    if (data) {
      console.log('✅ Datos recibidos desde fetchListTasksSlice:', data);
    }
  }, [data]);

  if (loading) {
    console.log('⏳ Cargando tareas...');
    return <div>⏳ Cargando tareas desde list_tasks endpoint...</div>;
  }

  if (error) {
    console.error('❌ Error en fetchListTasksSlice:', error);
    return <div>❌ Error: {error}</div>;
  }

  return (
    <div>
      <h2>📋 Lista de Tareas (Nuevo Endpoint)</h2>
      <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <strong>Console Log:</strong><br/>
        <small>Verifica la consola del navegador para ver los datos recibidos</small>
      </div>
      {data && (
        <div>
          <h3>📊 Datos recibidos:</h3>
          <pre style={{ background: '#eee', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestListTasks;