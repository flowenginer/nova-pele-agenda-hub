
import React from 'react';

const PublicScheduling = () => {
  React.useEffect(() => {
    // Redirecionar para a página HTML estática
    window.location.href = '/agendamento.html';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-nova">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nova-pink-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecionando para agendamento...</p>
      </div>
    </div>
  );
};

export default PublicScheduling;
