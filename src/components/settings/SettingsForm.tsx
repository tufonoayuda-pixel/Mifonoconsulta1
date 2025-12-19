"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ImageUpload from "@/components/ImageUpload"; // Reusable ImageUpload component
import { SystemConfig } from "@/types/system-config";
import { showSuccess, showError } from "@/utils/toast";
import { supabase, db } from "@/integrations/supabase/client";
import { useSession } from "@/components/SessionContextProvider";

const settingsFormSchema = z.object({
  professionalName: z.string().optional(),
  digitalSignatureUrl: z.string().optional().nullable(),
  digitalSignaturePath: z.string().optional().nullable(),
  professionalLogoUrl: z.string().optional().nullable(),
  professionalLogoPath: z.string().optional().nullable(),
  healthSuperintendenceRegistration: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

interface SettingsFormProps {
  initialData?: SystemConfig | null;
  onSave: (config: SystemConfig) => Promise<void>;
  isSaving: boolean;
}

const SettingsForm: React.FC<SettingsFormProps> = ({
  initialData,
  onSave,
  isSaving,
}) => {
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      professionalName: "",
      digitalSignatureUrl: null,
      digitalSignaturePath: null,
      professionalLogoUrl: null,
      professionalLogoPath: null,
      healthSuperintendenceRegistration: "",
    },
  });

  const { user } = useSession();
  const [digitalSignatureFile, setDigitalSignatureFile] = useState<File | null>(null);
  const [professionalLogoFile, setProfessionalLogoFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialData) {
      form.reset({
        professionalName: initialData.professionalName || "",
        digitalSignatureUrl: initialData.digitalSignatureUrl || null,
        digitalSignaturePath: initialData.digitalSignaturePath || null,
        professionalLogoUrl: initialData.professionalLogoUrl || null,
        professionalLogoPath: initialData.professionalLogoPath || null,
        healthSuperintendenceRegistration: initialData.healthSuperintendenceRegistration || "",
      });
      setDigitalSignatureFile(null);
      setProfessionalLogoFile(null);
    }
  }, [initialData, form]);

  const handleSubmit = async (values: SettingsFormValues) => {
    if (!user?.id) {
      showError("Usuario no autenticado.");
      return;
    }

    let signatureUrl = values.digitalSignatureUrl;
    let signaturePath = values.digitalSignaturePath;
    let logoUrl = values.professionalLogoUrl;
    let logoPath = values.professionalLogoPath;

    try {
      // Handle digital signature upload
      if (digitalSignatureFile) {
        if (initialData?.digitalSignaturePath) {
          await supabase.onlineClient.storage.from("user-settings").remove([initialData.digitalSignaturePath]);
        }
        const fileExtension = digitalSignatureFile.name.split(".").pop();
        const filePath = `${user.id}/signature/${crypto.randomUUID()}.${fileExtension}`;
        const { data: uploadData, error: uploadError } = await supabase.onlineClient.storage
          .from("user-settings")
          .upload(filePath, digitalSignatureFile, { cacheControl: '3600', upsert: false });
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.onlineClient.storage.from("user-settings").getPublicUrl(filePath);
        signatureUrl = publicUrlData?.publicUrl || null;
        signaturePath = filePath;
      } else if (initialData?.digitalSignaturePath && !values.digitalSignatureUrl) {
        await supabase.onlineClient.storage.from("user-settings").remove([initialData.digitalSignaturePath]);
        signatureUrl = null;
        signaturePath = null;
      }

      // Handle professional logo upload
      if (professionalLogoFile) {
        if (initialData?.professionalLogoPath) {
          await supabase.onlineClient.storage.from("user-settings").remove([initialData.professionalLogoPath]);
        }
        const fileExtension = professionalLogoFile.name.split(".").pop();
        const filePath = `${user.id}/logo/${crypto.randomUUID()}.${fileExtension}`;
        const { data: uploadData, error: uploadError } = await supabase.onlineClient.storage
          .from("user-settings")
          .upload(filePath, professionalLogoFile, { cacheControl: '3600', upsert: false });
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.onlineClient.storage.from("user-settings").getPublicUrl(filePath);
        logoUrl = publicUrlData?.publicUrl || null;
        logoPath = filePath;
      } else if (initialData?.professionalLogoPath && !values.professionalLogoUrl) {
        await supabase.onlineClient.storage.from("user-settings").remove([initialData.professionalLogoPath]);
        logoUrl = null;
        logoPath = null;
      }

      const configToSave: SystemConfig = {
        professionalName: values.professionalName || undefined,
        digitalSignatureUrl: signatureUrl || undefined,
        digitalSignaturePath: signaturePath || undefined,
        professionalLogoUrl: logoUrl || undefined,
        professionalLogoPath: logoPath || undefined,
        healthSuperintendenceRegistration: values.healthSuperintendenceRegistration || undefined,
      };

      await onSave(configToSave);
      setDigitalSignatureFile(null);
      setProfessionalLogoFile(null);
    } catch (error: any) {
      showError("Error al guardar la configuración: " + error.message);
      console.error("Error saving settings:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos del Profesional</CardTitle>
        <FormDescription>
          Configura tu información personal y profesional que se utilizará en documentos y reportes.
        </FormDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-6">
            <FormField
              control={form.control}
              name="professionalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Profesional</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Flgo. Cristobal San Martin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="healthSuperintendenceRegistration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registro Superintendencia de Salud</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="digitalSignatureUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firma Digital</FormLabel>
                    <FormControl>
                      <ImageUpload
                        onImageChange={setDigitalSignatureFile}
                        initialImageUrl={field.value || undefined}
                        disabled={isSaving}
                        label="Arrastra o haz clic para subir tu firma digital"
                        description="(JPG, PNG, GIF - máximo 5MB)"
                      />
                    </FormControl>
                    <FormDescription>
                      Sube una imagen de tu firma para usarla en documentos.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="professionalLogoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo Profesional</FormLabel>
                    <FormControl>
                      <ImageUpload
                        onImageChange={setProfessionalLogoFile}
                        initialImageUrl={field.value || undefined}
                        disabled={isSaving}
                        label="Arrastra o haz clic para subir tu logo profesional"
                        description="(JPG, PNG, GIF - máximo 5MB)"
                      />
                    </FormControl>
                    <FormDescription>
                      Sube el logo de tu consulta o marca personal.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar Configuración"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SettingsForm;