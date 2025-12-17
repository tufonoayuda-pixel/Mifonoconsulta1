"use client";

import React, { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client'; // Use the online supabase client
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/components/SessionContextProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import FallingIconsBackground from '@/components/FallingIconsBackground'; // Import the new component

const Login: React.FC = () => {
  const { session, isLoading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session && !isLoading) {
      navigate('/'); // Redirect to dashboard if already logged in
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <FallingIconsBackground /> {/* Add the falling icons background */}
      <Card className="w-full max-w-md z-10 bg-card/90 backdrop-blur-sm"> {/* Added z-10 and backdrop-blur for effect */}
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
            <span className="text-5xl">🧠👅</span> MiFonoConsulta
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Tu consulta fonoaudiológica, organizada y al alcance de tu mano.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            providers={[]} // No third-party providers for now
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary-foreground))',
                    brandButtonText: 'hsl(var(--primary-foreground))',
                    defaultButtonBackground: 'hsl(var(--secondary))',
                    defaultButtonBackgroundHover: 'hsl(var(--secondary-foreground))',
                    defaultButtonBorder: 'hsl(var(--border))',
                    defaultButtonText: 'hsl(var(--foreground))',
                    inputBackground: 'hsl(var(--input))',
                    inputBorder: 'hsl(var(--border))',
                    inputBorderHover: 'hsl(var(--ring))',
                    inputBorderFocus: 'hsl(var(--ring))',
                    inputText: 'hsl(var(--foreground))',
                    inputLabelText: 'hsl(var(--foreground))',
                    messageText: 'hsl(var(--foreground))',
                    messageBackground: 'hsl(var(--card))',
                    anchorText: 'hsl(var(--primary))',
                    anchorTextHover: 'hsl(var(--primary-foreground))',
                  },
                },
              },
            }}
            theme="dark" // Using dark theme to match the app's dark mode
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Correo electrónico',
                  password_label: 'Contraseña',
                  email_input_placeholder: 'Tu correo electrónico',
                  password_input_placeholder: 'Tu contraseña',
                  button_label: 'Iniciar sesión',
                  social_provider_text: 'O continúa con',
                  link_text: '¿Ya tienes una cuenta? Inicia sesión',
                },
                sign_up: {
                  email_label: 'Correo electrónico',
                  password_label: 'Contraseña',
                  email_input_placeholder: 'Tu correo electrónico',
                  password_input_placeholder: 'Crea una contraseña',
                  button_label: 'Registrarse',
                  social_provider_text: 'O regístrate con',
                  link_text: '¿No tienes una cuenta? Regístrate',
                },
                forgotten_password: {
                  email_label: 'Correo electrónico',
                  password_label: 'Tu contraseña',
                  email_input_placeholder: 'Tu correo electrónico',
                  button_label: 'Enviar instrucciones de recuperación',
                  link_text: '¿Olvidaste tu contraseña?',
                },
                update_password: {
                  password_label: 'Nueva contraseña',
                  password_input_placeholder: 'Tu nueva contraseña',
                  button_label: 'Actualizar contraseña',
                },
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;