"use client";

import React, { useState, useMemo } from "react";
import { PlusCircle, FileText, ExternalLink, Trash2, Edit, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

import StudyMaterialForm from "@/components/study-materials/StudyMaterialForm";
import { StudyMaterial } from "@/types/study-material";
import { showSuccess, showError } from "@/utils/toast";
import { supabase, db } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useSession } from "@/components/SessionContextProvider"; // Import useSession

const StudyMaterialsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
  const [currentTab, setCurrentTab] = useState<string>("all");
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const { user } = useSession(); // Get the authenticated user

  // Fetch study materials
  const { data: materials, isLoading, isError, error } = useQuery<StudyMaterial[], Error>({
    queryKey: ["studyMaterials", user?.id], // Include user.id in query key
    queryFn: async () => {
      if (!user?.id) return []; // Return empty if no user
      const { data, error } = await supabase.from("study_materials").select("*").eq("user_id", user.id).order("category", { ascending: true }).order("name", { ascending: true });
      if (error) throw error;
      return data as StudyMaterial[];
    },
    enabled: !!user?.id, // Only run query if user ID is available
  });

  // Mutation for adding a study material
  const addMaterialMutation = useMutation<StudyMaterial, Error, StudyMaterial>({ // Removed file parameter
    mutationFn: async (material) => {
      if (!user?.id) throw new Error("Usuario no autenticado.");

      const payload = {
        user_id: user.id,
        name: material.name,
        description: material.description,
        category: material.category,
        external_url: material.external_url,
        // file_url and file_path are not set for new entries
      };

      const { data, error } = await db.from("study_materials").insert(payload).select().single(); // Added .select().single() to get the inserted data
      if (error) throw error;
      return data as StudyMaterial;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studyMaterials"] });
      showSuccess("Material de estudio añadido exitosamente (o en cola para sincronizar).");
      setIsFormOpen(false);
      setEditingMaterial(null);
    },
    onError: (err) => {
      showError("Error al añadir material: " + err.message);
    },
  });

  // Mutation for updating a study material
  const updateMaterialMutation = useMutation<StudyMaterial, Error, StudyMaterial>({ // Removed file parameter
    mutationFn: async (material) => {
      if (!user?.id) throw new Error("Usuario no autenticado.");

      // If an existing material had a file_path, and now it's being updated without a new file
      // and potentially with an external_url, we should delete the old file from storage.
      // However, since we are removing file upload functionality, we will not manage file deletion here.
      // Existing file_url/file_path will remain in the DB but won't be editable/removable via this form.
      // If the user wants to remove an old file, they would need to do it manually in Supabase Storage.

      const payload = {
        name: material.name,
        description: material.description,
        category: material.category,
        external_url: material.external_url,
        // file_url and file_path are not updated via this form
      };

      const { data, error } = await db.from("study_materials").update(payload).match({ id: material.id, user_id: user.id }).select().single(); // Added .select().single()
      if (error) throw error;
      return data as StudyMaterial;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studyMaterials"] });
      showSuccess("Material de estudio actualizado exitosamente (o en cola para sincronizar).");
      setIsFormOpen(false);
      setEditingMaterial(null);
    },
    onError: (err) => {
      showError("Error al actualizar material: " + err.message);
    },
  });

  // Mutation for deleting a study material
  const deleteMaterialMutation = useMutation<void, Error, StudyMaterial>({
    mutationFn: async (materialToDelete) => {
      if (!user?.id) throw new Error("Usuario no autenticado.");
      // We are no longer managing file deletion from storage via the app.
      // If there was an associated file, it will remain in storage unless manually deleted.
      const { error } = await db.from("study_materials").delete().match({ id: materialToDelete.id, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studyMaterials"] });
      showSuccess("Material de estudio eliminado exitosamente (o en cola para sincronizar).");
    },
    onError: (err) => {
      showError("Error al eliminar material: " + err.message);
    },
  });

  const openAddForm = () => {
    setEditingMaterial(null);
    setIsFormOpen(true);
  };

  const openEditForm = (material: StudyMaterial) => {
    setEditingMaterial(material);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (material: StudyMaterial) => { // Removed file parameter
    if (editingMaterial) {
      updateMaterialMutation.mutate(material);
    } else {
      addMaterialMutation.mutate(material);
    }
  };

  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    materials?.forEach(m => categories.add(m.category));
    return ["all", ...Array.from(categories).sort()];
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    let filtered = materials || [];

    if (currentTab !== "all") {
      filtered = filtered.filter((material) => material.category === currentTab);
    }

    if (globalFilter) {
      const lowerCaseFilter = globalFilter.toLowerCase();
      filtered = filtered.filter(
        (material) =>
          material.name.toLowerCase().includes(lowerCaseFilter) ||
          material.description?.toLowerCase().includes(lowerCaseFilter) ||
          material.category.toLowerCase().includes(lowerCaseFilter)
      );
    }
    return filtered;
  }, [materials, currentTab, globalFilter]);

  if (isLoading) return <div className="p-4 text-center">Cargando materiales de estudio...</div>;
  if (isError) return <div className="p-4 text-center text-red-500">Error al cargar materiales: {error?.message}</div>;

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Material de Estudio</h1>
        <Button onClick={openAddForm}>
          <PlusCircle className="mr-2 h-4 w-4" /> Añadir Material
        </Button>
      </div>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        Accede y gestiona recursos educativos y enlaces relevantes para tu práctica.
      </p>

      <div className="flex items-center py-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar material por nombre, descripción o categoría..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <TabsList className="w-full justify-start">
            {allCategories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category === "all" ? "Todos" : category}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>
        <TabsContent value={currentTab} className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMaterials.length === 0 ? (
              <p className="text-center text-muted-foreground col-span-full py-8">No hay materiales en esta categoría.</p>
            ) : (
              filteredMaterials.map((material) => (
                <Card key={material.id} className="relative border-l-4 border-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {material.external_url ? <ExternalLink className="h-5 w-5 text-primary" /> : <FileText className="h-5 w-5 text-primary" />}
                      {material.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Categoría: {material.category}
                      <br />
                      Última actualización: {material.updated_at ? format(new Date(material.updated_at), "PPP HH:mm", { locale: es }) : "N/A"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-3">
                      {material.description || "Sin descripción."}
                    </p>
                    {material.external_url ? (
                      <a
                        href={material.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Abrir Enlace
                      </a>
                    ) : material.file_url ? (
                      <a
                        href={material.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-green-600 hover:underline dark:text-green-400 mt-2"
                      >
                        <Download className="h-4 w-4" />
                        Descargar Archivo (existente)
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">No hay enlace ni archivo.</p>
                    )}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditForm(material)} className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar material</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar material</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Esto eliminará permanentemente el material de estudio. Si tenía un archivo asociado, este deberá ser eliminado manualmente de Supabase Storage.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMaterialMutation.mutate(material)}>Eliminar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <StudyMaterialForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingMaterial}
        isSubmitting={addMaterialMutation.isPending || updateMaterialMutation.isPending}
      />
    </div>
  );
};

export default StudyMaterialsPage;