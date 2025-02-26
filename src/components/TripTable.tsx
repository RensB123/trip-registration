import React from 'react';
import { Trip } from './ExcelUploader';

interface Props {
  trips: Trip[];
  onInsertTrip: (position: number) => void;
  onDeleteTrip: (position: number) => void;
}

const TripTable: React.FC<Props> = ({ trips, onInsertTrip, onDeleteTrip }) => {
  if (!trips || trips.length === 0) {
    return (
      <div className="trip-table">
        <h2>Trip Data</h2>
        <div className="empty-state">
          <p>No trip data available. Please upload an Excel file or add a trip.</p>
        </div>
      </div>
    );
  }

  // Format number to avoid NaN display
  const formatNumber = (num: number) => {
    if (isNaN(num)) return 0;
    return Number(num.toFixed(1)); // Format to 1 decimal place
  };

  return (
    <div className="trip-table">
      <h2>Trip Data</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Rit Nr.</th>
              <th>Datum</th>
              <th>Begin Adres</th>
              <th>Begin Stand</th>
              <th>Eind Adres</th>
              <th>Eind Stand</th>
              <th>Rit Afstand</th>
              <th>Totaal</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip, index) => (
              <tr key={trip.id || index}>
                <td>{trip.ritNummer || ""}</td>
                <td>{trip.datum || ""}</td>
                <td>{trip.beginAdres || ""}</td>
                <td>{formatNumber(trip.beginStand)}</td>
                <td>{trip.eindAdres || ""}</td>
                <td>{formatNumber(trip.eindStand)}</td>
                <td>{formatNumber(trip.ritAfstand)}</td>
                <td>{formatNumber(trip.afstand)}</td>
                <td>
                  <div className="button-container">
                    <button 
                      onClick={() => onInsertTrip(index)}
                      className="insert-button"
                    >
                      Insert
                    </button>
                    <button 
                      onClick={() => onDeleteTrip(index)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TripTable; 