import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const PublicConsult = () => {
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const user = searchParams.get('user');
    if (user) {
      window.location.href = `/consultar.html?user=${user}`;
    } else {
      window.location.href = `/consultar.html`;
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecionando para consulta...</p>
      </div>
    </div>
  );
};

export default PublicConsult;