import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, User, QrCode, Download } from 'lucide-react';
import { getDiplomas, Diploma, deleteDiploma } from '../lib/db';

export function Baza() {
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDiplomas = async () => {
    try {
      const data = await getDiplomas();
      // Sort by newest first
      data.sort((a, b) => b.uploadDate - a.uploadDate);
      setDiplomas(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiplomas();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Rostdan ham ushbu diplomni o'chirib tashlamoqchimisiz?")) {
      await deleteDiploma(id);
      fetchDiplomas();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-gray-500">
        Yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-full">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-slate-900 font-bold text-2xl">Baza</h1>
          <p className="text-slate-500 text-sm mt-1">Barcha yuklangan diplomlar ro'yxati</p>
        </div>
        <div className="text-sm text-slate-500 font-bold bg-white px-4 py-2 border border-slate-200 rounded-lg shadow-sm">
          Jami: {diplomas.length} ta
        </div>
      </div>

      {diplomas.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center bg-slate-50 text-center">
          <FileText className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">Mavjud emas</h3>
          <p className="text-slate-500 text-sm mb-4">Hali birorta ham diplom bazaga kiritilmagan.</p>
          <Link to="/" className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1">
            Birinchi diplomni yuklash &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {diplomas.map((diploma) => (
            <Link
              key={diploma.id}
              to={`/diploma/${diploma.id}`}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-200 hover:bg-slate-50 transition-all flex flex-col group relative"
            >
              <button 
                onClick={(e) => handleDelete(diploma.id, e)}
                className="absolute top-4 right-4 text-[11px] font-bold uppercase tracking-wider text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 px-2 py-1 rounded-md"
              >
                O'chirish
              </button>
              
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 mb-4 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">
                {diploma.studentName}
              </h3>
              <p className="text-slate-500 text-xs font-semibold mb-4 line-clamp-1">
                {diploma.diplomaName}
              </p>
              
              <div className="mt-auto space-y-2 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Sana</span>
                  <span className="text-slate-700 font-bold">{diploma.issueDate}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1"><QrCode className="w-3.5 h-3.5" /> ID</span>
                  <span className="text-slate-700 font-mono font-medium truncate">{diploma.id.split('-')[0]}***</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" /> Yuklangani</span>
                  <span className="text-slate-700 font-bold">{diploma.downloads || 0} marta</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
