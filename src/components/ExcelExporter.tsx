import React from 'react';
import * as XLSX from 'xlsx';
import { Trip } from './ExcelUploader';

interface Props {
  trips: Trip[];
}

const ExcelExporter: React.FC<Props> = ({ trips }) => {
  const handleExport = () => {
    // Create worksheet with headers
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['Rit Nummer', 'Datum', 'Begin Tijd', 'Naam', 'Begin Adres', 'Begin Stand', 
       'Eind Tijd', 'Naam', 'Eind Adres', 'Eind Stand', 'Ritafstand', 'afstand', 'Duur', 'Parkeer Tijd']
    ]);
    
    // Add trip data
    const data = trips.map(trip => [
      trip.ritNummer,
      trip.datum,
      trip.beginTijd,
      trip.beginNaam,
      trip.beginAdres,
      trip.beginStand,
      trip.eindTijd,
      trip.eindNaam,
      trip.eindAdres,
      trip.eindStand,
      trip.ritAfstand,
      trip.afstand,
      trip.duur,
      trip.parkeerTijd
    ]);
    
    XLSX.utils.sheet_add_aoa(worksheet, data, { origin: 'A2' });
    
    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Trip Data');
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, 'trip_data.xlsx');
  };
  
  return (
    <div className="excel-exporter">
      <button onClick={handleExport}>Export to Excel</button>
    </div>
  );
};

export default ExcelExporter; 