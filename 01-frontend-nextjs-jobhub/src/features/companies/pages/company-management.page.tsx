"use client";

import { useState } from "react";
import { CompanyForm } from "../components/company-form";
import { CompanyTable } from "../components/company-table";
import { useCompanies } from "../hooks/use-companies";
import * as companiesService from "../services/companies.service";
import type { Company, CreateCompanyPayload, UpdateCompanyPayload } from "../types/company.types";

type FormMode = { kind: "create" } | { kind: "edit"; company: Company } | null;

export function CompanyManagementPage() {
  const { data: companies, refetch } = useCompanies();
  const [formMode, setFormMode] = useState<FormMode>(null);

  async function handleSubmit(payload: CreateCompanyPayload | UpdateCompanyPayload) {
    if (formMode?.kind === "edit") {
      await companiesService.updateCompany(formMode.company.id, payload);
    } else {
      await companiesService.createCompany(payload as CreateCompanyPayload);
    }
    setFormMode(null);
    await refetch();
  }

  async function handleDelete(company: Company) {
    if (!window.confirm(`Delete ${company.name}?`)) return;
    await companiesService.deleteCompany(company.id);
    await refetch();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-void">Company Management</h1>
        {!formMode && (
          <button
            type="button"
            onClick={() => setFormMode({ kind: "create" })}
            className="rounded-full bg-signal px-5 py-2.5 text-sm font-semibold text-white"
          >
            New Company
          </button>
        )}
      </div>

      {formMode && (
        <CompanyForm
          initialValues={formMode.kind === "edit" ? formMode.company : undefined}
          onSubmit={handleSubmit}
          onCancel={() => setFormMode(null)}
        />
      )}

      <CompanyTable
        companies={companies}
        onEdit={(company) => setFormMode({ kind: "edit", company })}
        onDelete={(company) => void handleDelete(company)}
      />
    </div>
  );
}
