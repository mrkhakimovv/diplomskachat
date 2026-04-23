export interface Diploma {
  id: string;
  studentName: string;
  diplomaName: string;
  issueDate: string;
  fileData: string; // Base64 data URL
  fileName: string;
  fileType: string; // e.g. application/pdf, image/jpeg
  uploadDate: number;
  downloads?: number;
}

export const saveDiploma = async (diploma: Diploma): Promise<void> => {
  await fetch('/api/diplomas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(diploma)
  });
};

export const getDiplomas = async (): Promise<Diploma[]> => {
  try {
    const res = await fetch('/api/diplomas');
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Failed to load diplomas:", error);
    return [];
  }
};

export const getDiplomaById = async (id: string): Promise<Diploma | null> => {
  const diplomas = await getDiplomas();
  return diplomas.find((d) => d.id === id) || null;
};

export const incrementDownload = async (id: string): Promise<void> => {
  try {
    await fetch(`/api/diplomas/${id}/download`, {
      method: 'POST'
    });
  } catch (error) {
    console.error("Failed to increment download counter:", error);
  }
};

export const deleteDiploma = async (id: string): Promise<void> => {
  try {
    await fetch(`/api/diplomas/${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error("Failed to delete diploma:", error);
  }
};
