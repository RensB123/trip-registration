import React, { useState, useEffect } from 'react';
import { Trip } from './ExcelUploader';

interface Props {
  insertPosition: number | null;
  trips: Trip[];
  onAddTrip: (beginAdres: string, eindAdres: string, eindStand: number, position: number) => void;
  onCancel: () => void;
}

const TripForm: React.FC<Props> = ({ insertPosition, trips, onAddTrip, onCancel }) => {
  const [beginAdres, setBeginAdres] = useState('');
  const [eindAdres, setEindAdres] = useState('');
  const [eindStand, setEindStand] = useState('');
  const [beginStand, setBeginStand] = useState('0');
  const [datum, setDatum] = useState('');
  const [inputType, setInputType] = useState<'eindStand' | 'distance'>('eindStand');
  const [distance, setDistance] = useState('');

  // Update form fields when insertPosition changes
  useEffect(() => {
    if (insertPosition !== null && trips.length > 0 && insertPosition < trips.length) {
      const currentTrip = trips[insertPosition];
      if (currentTrip) {
        setBeginAdres(currentTrip.eindAdres || '');
        setBeginStand(currentTrip.eindStand?.toString() || '0');
        setDistance('');
        setEindStand('');
        
        // Default to today's date in the format MM/DD/YY
        const today = new Date();
        const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear().toString().substr(-2)}`;
        setDatum(currentTrip.datum || formattedDate);
      }
    } else if (trips.length > 0 && (insertPosition === null || insertPosition >= trips.length)) {
      // If insert position is invalid but we have trips, use the last trip
      const lastTrip = trips[trips.length - 1];
      setBeginAdres(lastTrip.eindAdres || '');
      setBeginStand(lastTrip.eindStand?.toString() || '0');
      setDistance('');
      setEindStand('');
      
      // Default to today's date in the format MM/DD/YY
      const today = new Date();
      const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear().toString().substr(-2)}`;
      setDatum(lastTrip.datum || formattedDate);
    }
  }, [insertPosition, trips]);

  // Calculate eindStand from distance or vice versa
  useEffect(() => {
    if (inputType === 'distance' && distance) {
      const calculatedEindStand = parseFloat(beginStand) + parseFloat(distance);
      setEindStand(calculatedEindStand.toString());
    } else if (inputType === 'eindStand' && eindStand) {
      const calculatedDistance = parseFloat(eindStand) - parseFloat(beginStand);
      setDistance(calculatedDistance > 0 ? calculatedDistance.toString() : '');
    }
  }, [distance, eindStand, beginStand, inputType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (beginAdres && eindAdres && eindStand && insertPosition !== null) {
      onAddTrip(beginAdres, eindAdres, Number(eindStand), insertPosition);
      // Reset form
      setBeginAdres('');
      setEindAdres('');
      setEindStand('');
      setDistance('');
    }
  };

  if (insertPosition === null) {
    return null;
  }

  return (
    <div className="trip-form">
      <h3>Add New Trip</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="datum">Datum:</label>
          <input 
            type="text" 
            id="datum" 
            value={datum} 
            onChange={(e) => setDatum(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label htmlFor="beginAdres">Begin Adres:</label>
          <input 
            type="text" 
            id="beginAdres" 
            value={beginAdres} 
            onChange={(e) => setBeginAdres(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label htmlFor="beginStand">Begin Stand (km):</label>
          <input 
            type="number" 
            id="beginStand" 
            value={beginStand} 
            disabled
          />
        </div>
        <div>
          <label htmlFor="eindAdres">Eind Adres:</label>
          <input 
            type="text" 
            id="eindAdres" 
            value={eindAdres} 
            onChange={(e) => setEindAdres(e.target.value)} 
            required 
          />
        </div>
        
        <div className="input-type-selector">
          <label>
            <input 
              type="radio" 
              name="inputType" 
              checked={inputType === 'eindStand'} 
              onChange={() => setInputType('eindStand')} 
            />
            Enter End Stand
          </label>
          <label>
            <input 
              type="radio" 
              name="inputType" 
              checked={inputType === 'distance'} 
              onChange={() => setInputType('distance')} 
            />
            Enter Distance
          </label>
        </div>
        
        {inputType === 'eindStand' ? (
          <div>
            <label htmlFor="eindStand">Eind Stand (km):</label>
            <input 
              type="number" 
              id="eindStand" 
              value={eindStand} 
              onChange={(e) => setEindStand(e.target.value)} 
              required 
              min={beginStand} 
              step="0.1"
            />
          </div>
        ) : (
          <div>
            <label htmlFor="distance">Distance (km):</label>
            <input 
              type="number" 
              id="distance" 
              value={distance} 
              onChange={(e) => setDistance(e.target.value)} 
              required 
              min="0"
              step="0.1"
            />
          </div>
        )}
        
        <div className="form-buttons">
          <button type="submit">Add Trip</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default TripForm; 