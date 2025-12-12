"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/patients/data-table";
import { createPatientColumns } from "@/components/patients/columns";
import PatientForm from "@/components/patients/PatientForm";
import { Patient } from "@/types/patient";
import { showSuccess, showError } from "@/utils/toast";
import { supabase, db } from "@/integrations/supabase/client"; // Import both
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Patients = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Fetch patients from Supabase (always try online for reads, or implement read-caching)
  const { data: patients, isLoading, isError, error } = useQuery<Patient[], Error>({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("*"); // Use online client for reads
      if (error) throw error;
      return data as Patient[];
    },
  });

  // Mutation for adding a patient
  const addPatientMutation = useMutation<Patient, Error, Patient>({
    mutationFn: async (newPatient) => {
      const payload = {
        rut: newPatient.rut,
        name: newPatient.name,
        phone: newPatient.phone === "" ? null : newPatient.phone,
        age: newPatient.age === undefined ? null : newPatient.age,
        preferred_room: newPatient.preferredRoom === "Sin preferencia" ? null : newPatient.preferredRoom,
        preferred_day: newPatient.preferredDay === "Sin preferencia" ? null : newPatient.preferredDay,
        preferred_time: newPatient.preferredTime === "" ? null : newPatient.preferredTime,
        service_type: newPatient.serviceType === "Sin preferencia" ? null : newPatient.serviceType,
        observations: newPatient.observations === "" ? null : newPatient.observations,
      };
      // Removed .select().single() as offline client returns data directly
      const { data, error } = await db.from("patients").insert(payload); 
      if (error) throw error;
      return data as Patient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      showSuccess("Paciente añadido exitosamente (o en cola para sincronizar).");
    },
    onError: (err) => {
      showError("Error al añadir paciente: " + err.message);
    },
  });

  // Mutation for updating a patient
  const updatePatientMutation = useMutation<Patient, Error, Patient>({
    mutationFn: async (updatedPatient) => {
      const payload = {
        rut: updatedPatient.rut,
        name: updatedPatient.name,
        phone: updatedPatient.phone === "" ? null : updatedPatient.phone,
        age: updatedPatient.age === undefined ? null : updatedPatient.age,
        preferred_room: updatedPatient.preferredRoom === "Sin preferencia" ? null : updatedPatient.preferredRoom,
        preferred_day: updatedPatient.preferredDay === "Sin preferencia" ? null : updatedPatient.preferredDay,
        preferred_time: updatedPatient.preferredTime === "" ? null : updatedPatient.preferredTime,
        service_type: updatedPatient.serviceType === "Sin preferencia" ? null : updatedPatient.serviceType,
        observations: updatedPatient.observations === "" ? null : updatedPatient.observations,
      };
      // Removed .select().single() as offline client returns data directly
      const { data, error } = await db.from("patients").update(payload).eq("id", updatedPatient.id);
      if (error) throw error;
      return data as Patient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      showSuccess("Paciente actualizado exitosamente (o en cola para sincronizar).");
    },
    onError: (err) => {
      showError("Error al actualizar paciente: " + err.message);
    },
  });

  // Mutation for deleting a patient
  const deletePatientMutation = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const { error } = await db.from("patients").delete().eq("id", id); // Use offline client for deletes
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      showSuccess("Paciente eliminado exitosamente (o en cola para sincronizar).");
    },
    onError: (err) => {
      showError("Error al eliminar paciente: " + err.message);
    },
  });

  const handleAddPatient = (newPatient: Patient) => {
    addPatientMutation.mutate(newPatient);
  };

  const handleEditPatient = (updatedPatient: Patient) => {
    updatePatientMutation.mutate(updatedPatient);
  };

  const handleDeletePatient = (id: string) => {
    deletePatientMutation.mutate(id);
  };

  const openAddForm = () => {
    setEditingPatient(null);
    setIsFormOpen(true);
  };

  const openEditForm = (patient: Patient) => {
    setEditingPatient(patient);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPatient(null);
  };

  const columns = createPatientColumns({
    onEdit: openEditForm,
    onDelete: handleDeletePatient,
  });

  const existingRuts = patients?.map(p => p.rut) || [];

  if (isLoading) return <div className="p-4 text-center">Cargando pacientes...</div>;
  if (isError) return <div className="p-4 text-center text-red-500">Error al cargar pacientes: {error?.message}</div>;

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Pacientes</h1>
        <Button onClick={openAddForm}>Añadir Paciente</Button>
      </div>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        Administra la información de todos tus pacientes.
      </p>

      <DataTable
        columns={columns}
        data={patients || []}
        searchPlaceholder="Buscar pacientes por nombre o RUT..."
        searchColumn="name"
      />

      <PatientForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={editingPatient ? handleEditPatient : handleAddPatient}
        initialData={editingPatient}
        existingRuts={existingRuts}
      />
    </div>
  );
};

export default Patients;