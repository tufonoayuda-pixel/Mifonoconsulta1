import { MadeWithDyad } from "@/components/made-with-dyad"; // This will be moved to Layout.tsx

const Index = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Bienvenido a MiFonoConsulta</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Tu sistema de gestión integral para fonoaudiólogos.
        </p>
        <p className="text-lg text-gray-500 dark:text-gray-500 mt-2">
          Aquí encontrarás un resumen rápido de tu consulta.
        </p>
      </div>
      {/* Future: Add dashboard statistics and quick links here */}
    </div>
  );
};

export default Index;