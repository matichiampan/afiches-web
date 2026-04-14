import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, AlertTriangle, HardDrive } from 'lucide-react';

const DebugBucketList = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const listFiles = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: listError } = await supabase.storage
          .from('datosabiertos')
          .list();

        if (listError) {
          throw listError;
        }
        
        const visibleFiles = data.filter(file => file.name !== '.emptyFolderPlaceholder');
        setFiles(visibleFiles);

      } catch (err) {
        console.error('Error listing bucket files:', err);
        setError(err.message || 'No se pudo acceder al bucket de almacenamiento.');
      } finally {
        setLoading(false);
      }
    };

    listFiles();
  }, []);

  return (
    <div className="container mx-auto px-4 my-8">
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <HardDrive className="w-8 h-8 text-yellow-600 mr-4" />
          <h2 className="text-2xl font-bold text-yellow-800">Archivos en Supabase Storage ('datosabiertos')</h2>
        </div>
        
        {loading && (
          <div className="flex items-center text-yellow-700">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Buscando archivos...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center text-red-700 bg-red-100 p-4 rounded-md">
            <AlertTriangle className="w-6 h-6 mr-2" />
            <span><strong>Error:</strong> {error}</span>
          </div>
        )}

        {!loading && !error && (
          <div>
            {files.length > 0 ? (
              <ul className="list-disc list-inside bg-white p-4 rounded-md shadow-sm">
                {files.map(file => (
                  <li key={file.id} className="text-gray-800 font-mono text-sm">
                    {file.name} <span className="text-gray-500">- (ID: {file.id})</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-yellow-800 font-medium">No se encontraron archivos en el bucket 'datosabiertos'.</p>
            )}
          </div>
        )}
         <p className="text-xs text-yellow-600 mt-4">
          Esta es una herramienta de depuración para verificar el contenido del bucket. Una vez que los archivos se muestren aquí, deberían aparecer en la sección de abajo.
        </p>
      </div>
    </div>
  );
};

export default DebugBucketList;