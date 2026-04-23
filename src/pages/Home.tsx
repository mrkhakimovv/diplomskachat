import React, { useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import { UploadCloud, CheckCircle2, ChevronRight, Share2, Copy } from 'lucide-react';
import { saveDiploma, Diploma } from '../lib/db';

export function Home() {
  const [studentName, setStudentName] = useState('');
  const [diplomaName, setDiplomaName] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [uploadedDiploma, setUploadedDiploma] = useState<Diploma | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !studentName) return;

    setIsUploading(true);
    try {
      const base64 = await toBase64(file);
      const id = crypto.randomUUID();
      const today = new Date().toISOString().split('T')[0];
      
      const newDiploma: Diploma = {
        id,
        studentName,
        diplomaName: diplomaName || 'Noma\'lum',
        issueDate: issueDate || today,
        fileData: base64,
        fileName: file.name,
        fileType: file.type,
        uploadDate: Date.now(),
      };

      await saveDiploma(newDiploma);
      setUploadedDiploma(newDiploma);
      
      // Reset form
      setStudentName('');
      setDiplomaName('');
      setIssueDate('');
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("Faylni yuklashda xatolik yuz berdi");
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setUploadedDiploma(null);
  };

  const diplomaUrl = uploadedDiploma ? `${window.location.origin}/diploma/${uploadedDiploma.id}` : '';

  const copyUrl = () => {
    navigator.clipboard.writeText(diplomaUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      {uploadedDiploma ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row gap-6 items-center">
          <div className="bg-slate-900 p-3 rounded-xl shrink-0">
            <div className="bg-white p-2">
              <QRCode value={diplomaUrl} size={128} />
            </div>
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded tracking-wider">Tayyor</span>
              <span className="text-sm font-medium text-slate-500">{uploadedDiploma.studentName}</span>
            </div>
            <h3 className="text-slate-900 font-bold mt-2 text-xl">Tayyor QR-kod</h3>
            <p className="text-slate-500 text-sm mt-1">
              {uploadedDiploma.diplomaName} hujjati bazaga qo'shildi. Bu kod yuklangan faylga to'g'ridan-to'g'ri havoladir.
            </p>
            
            <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1.5 w-full">
                <input 
                  type="text" 
                  readOnly 
                  value={diplomaUrl} 
                  className="bg-transparent flex-1 outline-none text-slate-600 text-sm px-2 w-full"
                />
              </div>
              <button 
                onClick={copyUrl}
                className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors shrink-0"
              >
                <Copy className="w-4 h-4" />
                {copySuccess ? "Nusxalandi!" : "Nusxa olish"}
              </button>
            </div>

            <button
              onClick={resetUpload}
              className="mt-6 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors"
            >
              Yangi hujjat yuklash <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="mb-6">
            <h1 className="text-slate-900 font-bold text-xl mb-2">Yangi diplom yuklash</h1>
            <p className="text-slate-500 text-sm">Talabaning rasmiy hujjati elektron versiyasini bazaga kiriting. Avtomatik QR kod yaratiladi.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                F.I.Sh (Talaba ismi)
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                placeholder="Masalan, Ali Valiyev"
                className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Diplom fayli (PDF, JPG, PNG)
              </label>
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed ${file ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200'} rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all group`}
              >
                <input
                  type="file"
                  required
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="hidden"
                />
                
                {file ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 mx-auto group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="text-slate-600 font-semibold mb-1">{file.name}</div>
                    <div className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-slate-600 font-medium">Faylni shu yerga tashlang yoki tanlang</p>
                    <p className="text-slate-400 text-xs mt-1">Maksimal fayl hajmi: 20MB</p>
                  </>
                )}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isUploading || !file}
                className="w-full flex justify-center items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <span>Yuklanmoqda...</span>
                ) : (
                  <>Ro'yxatdan o'tkazish <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
