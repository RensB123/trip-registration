import React, { useState } from 'react';
import * as XLSX from 'xlsx';

interface Props {
  onFileUpload: (data: Trip[]) => void;
}

export interface Trip {
  id: number;
  ritNummer: string;
  datum: string;
  beginTijd: string;
  beginNaam: string;
  beginAdres: string;
  beginStand: number;
  eindTijd: string;
  eindNaam: string;
  eindAdres: string;
  eindStand: number;
  ritAfstand: number;
  afstand: number;
  duur: string;
  parkeerTijd: string;
}

const ExcelUploader: React.FC<Props> = ({ onFileUpload }) => {
  const [fileName, setFileName] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryString = event.target?.result as string;
      const workbook = XLSX.read(binaryString, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with A as header
      const data = XLSX.utils.sheet_to_json<any>(worksheet, { header: 'A' });
      
      // Process data (starting from row 6 - index 5)
      const trips: Trip[] = [];
      
      // Start processing from row 6 (index 5 in zero-based array)
      for (let i = 5; i < data.length; i++) {
        const row = data[i];
        
        // Skip rows without rit nummer or begin/eind stand
        if (!row.A && !row.F && !row.J) continue;
        
        trips.push({
          id: i - 4, // Start IDs from 1
          ritNummer: row.A || '',
          datum: row.B || '',
          beginTijd: row.C || '',
          beginNaam: row.D || '',
          beginAdres: row.E || '',
          beginStand: Number(row.F) || 0,
          eindTijd: row.G || '',
          eindNaam: row.H || '',
          eindAdres: row.I || '',
          eindStand: Number(row.J) || 0,
          ritAfstand: Number(row.K) || 0,
          afstand: Number(row.L) || 0,
          duur: row.M || '',
          parkeerTijd: row.N || ''
        });
      }

      onFileUpload(trips);
    };
    
    reader.readAsBinaryString(file);
  };

  return (
    <div className="excel-uploader">
      <h2>Upload Trip Data</h2>
      <input 
        type="file" 
        accept=".xlsx,.xls" 
        onChange={handleFileUpload} 
      />
      {fileName && <p>Uploaded: {fileName}</p>}
    </div>
  );
};

export default ExcelUploader; 