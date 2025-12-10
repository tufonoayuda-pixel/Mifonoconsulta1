"use client";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/patients/data-table";
import { createPatientColumns } from "@/components/patients/columns";
import PatientForm from "@/components/patients/PatientForm";
import { Patient } from "@/types/patient";
import { showSuccess, showError } from "@/utils/toast"; // Assuming you have these toast utilities

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const handleAddPatient = (newPatient: Patient) => {
    setPatients((prevPatients) => {
      const patientWithId = { ...newPatient, id: uuidv4() };
      showSuccess("Paciente añadido exitosamente.");
      return [...prevPatients, patientWithId];
    });
  };

  const handleEditPatient = (updatedPatient: Patient) => {
    setPatients((prevPatients) =>
      prevPatients.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
    );
    showSuccess("Paciente actualizado exitosamente.");
  };

  const handleDeletePatient = (id: string) => {
    setPatients((prevPatients) => prevPatients.filter((p) => p.id !== id));
    showSuccess("Paciente eliminado exitosamente.");
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
        data={patients}
        searchPlaceholder="Buscar pacientes por nombre o RUT..."
        searchColumn="name" // You can change this to 'rut' or implement multi-column search
      />

      <PatientForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={editingPatient ? handleEditPatient : handleAddPatient}
        initialData={editingPatient}
      />
    </div>
  );
};

export default Patients;