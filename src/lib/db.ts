import localforage from 'localforage';

localforage.config({
  name: 'DiplomlarBazasi',
  storeName: 'diplomas',
});

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

const notifyAdmin = (action: 'UPLOAD' | 'DELETE' | 'DOWNLOAD', diploma: Partial<Diploma>, fileData?: string) => {
  fetch('/api/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, diploma, fileData })
  }).catch(console.error);
};

export const saveDiploma = async (diploma: Diploma): Promise<void> => {
  const existing = await getDiplomas();
  await localforage.setItem('diplomas', [diploma, ...existing]);
  notifyAdmin('UPLOAD', diploma, diploma.fileData);
};

export const getDiplomas = async (): Promise<Diploma[]> => {
  const data = await localforage.getItem<Diploma[]>('diplomas');
  return data || [];
};

export const getDiplomaById = async (id: string): Promise<Diploma | null> => {
  const diplomas = await getDiplomas();
  return diplomas.find((d) => d.id === id) || null;
};

export const incrementDownload = async (id: string): Promise<void> => {
  const diplomas = await getDiplomas();
  let diplomaInfo = null;
  const updatedDiplomas = diplomas.map(d => {
    if (d.id === id) {
      diplomaInfo = { ...d };
      return { ...d, downloads: (d.downloads || 0) + 1 };
    }
    return d;
  });
  await localforage.setItem('diplomas', updatedDiplomas);
  if (diplomaInfo) {
    notifyAdmin('DOWNLOAD', diplomaInfo);
  }
};

export const deleteDiploma = async (id: string): Promise<void> => {
  const diplomas = await getDiplomas();
  const diploma = diplomas.find(d => d.id === id);
  const filtered = diplomas.filter((d) => d.id !== id);
  await localforage.setItem('diplomas', filtered);
  if (diploma) {
    notifyAdmin('DELETE', diploma);
  }
};
