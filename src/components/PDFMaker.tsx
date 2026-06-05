import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Upload, X, FileText, Trash2, FilePlus } from 'lucide-react';

export default function PDFMaker() {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const generatePDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    for (let i = 0; i < files.length; i++) {
      if (i > 0) doc.addPage();
      const file = files[i];

      if (file.type.startsWith('image/')) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        doc.addImage(base64, 'PNG', 10, 10, 190, 0);
      } else if (file.type === 'text/plain') {
        const text = await file.text();
        doc.text(text, 10, 10);
      }
    }
    doc.save('Lisa_generated.pdf');
  };

  return (
    <div className="p-4 space-y-4">
      <div 
        className="border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center text-white/50 hover:text-white hover:border-cyan-500 transition-all cursor-pointer"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files) setFiles([...files, ...Array.from(e.dataTransfer.files)]);
        }}
      >
        <Upload size={32} className="mb-2" />
        <p className="text-sm">Drag & Drop images or text docs</p>
        <input type="file" onChange={handleFileChange} className="hidden" id="fileInput" multiple accept="image/*,.txt" />
        <label htmlFor="fileInput" className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg cursor-pointer text-xs uppercase font-bold">Browse</label>
      </div>

      <div className="space-y-2">
        {files.map((file, index) => (
          <div key={index} className="flex items-center justify-between bg-white/[0.03] p-3 rounded-lg text-white text-xs">
            <div className="flex items-center gap-2">
              <FilePlus size={16} />
              {file.name}
            </div>
            <button onClick={() => removeFile(index)} className="text-red-400 hover:text-red-300">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {files.length > 0 && (
        <button 
          onClick={generatePDF}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all uppercase text-xs"
        >
          Generate PDF (A4)
        </button>
      )}
    </div>
  );
}
