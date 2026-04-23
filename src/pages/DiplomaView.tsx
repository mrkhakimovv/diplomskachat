import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, ChevronLeft, Calendar, User, FileText, FileImage } from 'lucide-react';
import { getDiplomaById, Diploma, incrementDownload } from '../lib/db';

export function DiplomaView() {
  const { id } = useParams<{ id: string }>();
  const [diploma, setDiploma] = useState<Diploma | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiploma = async () => {
      if (!id) return;
      try {
        const data = await getDiplomaById(id);
        if (data) {
          setDiploma(data);
        } else {
          setError("Kechirasiz, bunday ID raqamiga ega hujjat topilmadi.");
        }
      } catch (err) {
        console.error(err);
        setError("Ma'lumotlarni yuklashda xatolik yuz berdi.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiploma();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-gray-500">
        Yuklanmoqda...
      </div>
    );
  }

  if (error || !diploma) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl mb-6">
          <p className="font-medium text-lg">{error || "Hujjat topilmadi"}</p>
        </div>
        <Link to="/baza" className="text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Bazaga qaytish
        </Link>
      </div>
    );
  }

  const isImage = diploma.fileType.startsWith('image/');
  const isPdf = diploma.fileType === 'application/pdf';

  const handleDownloadClick = async () => {
    if (id) {
      await incrementDownload(id);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col h-full gap-6">
      <div>
        <Link to="/baza" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-6 font-semibold text-sm transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Bazaga qaytish
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 w-full">
          <div className="bg-white p-8 border border-slate-200 rounded-2xl shadow-sm sticky top-8">
            <h1 className="text-xl font-bold text-slate-900 mb-6">Diplom Ma'lumotlari</h1>
            
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Talaba Ismi</p>
                <p className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" /> {diploma.studentName}
                </p>
              </div>
              
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Kurs / Yo'nalish nomi</p>
                <p className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" /> {diploma.diplomaName}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Berilgan Sana</p>
                <p className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" /> {diploma.issueDate}
                </p>
              </div>
            </div>

            <hr className="my-6 border-slate-100" />
            
            <a
              href={diploma.fileData}
              download={diploma.fileName}
              onClick={handleDownloadClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm text-sm border border-transparent"
            >
              <Download className="w-4 h-4" />
              Yuklab Olish
            </a>
            <p className="text-center text-[11px] text-slate-400 mt-3 font-medium">
              Fayl turi: {isPdf ? 'PDF' : isImage ? 'Rasm' : 'Boshqa'} ({diploma.fileName})
            </p>
          </div>
        </div>
        
        <div className="lg:col-span-7">
          <div className="bg-white border text-center border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col items-center justify-center min-h-[400px] p-8">
            {isImage ? (
              <img 
                src={diploma.fileData} 
                alt="Diplom nusxasi" 
                className="max-w-full h-auto rounded-lg border border-slate-200 shadow-sm"
              />
            ) : isPdf ? (
              <div className="w-full flex-col flex items-center justify-center text-slate-500">
                <FileText className="w-20 h-20 text-slate-300 mb-4" />
                <p className="font-medium text-slate-700">Ushbu fayl PDF formatida.</p>
                <p className="text-sm mt-1 mb-6 text-slate-400">Faylni ko'rish uchun yuklab oling.</p>
                
                <a
                  href={diploma.fileData}
                  download={diploma.fileName}
                  onClick={handleDownloadClick}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2 px-6 rounded-lg transition-colors border border-slate-300 shadow-sm text-sm"
                >
                  PDF yuklash
                </a>
              </div>
            ) : (
              <div className="flex flex-col items-center text-slate-400">
                <FileImage className="w-20 h-20 text-slate-200 mb-4" />
                <p>Faylni oldindan ko'rib bo'lmaydi.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
