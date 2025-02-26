import React, { useState, useEffect } from 'react';
import './App.css';
import ExcelUploader, { Trip } from './components/ExcelUploader';
import TripTable from './components/TripTable';
import TripForm from './components/TripForm';
import ExcelExporter from './components/ExcelExporter';

function App() {
  // Initial dummy data matching the Excel format
  const dummyTrips: Trip[] = [
    {
      id: 1,
      ritNummer: "1.1",
      datum: "11/4/24",
      beginTijd: "9:07:36",
      beginNaam: "",
      beginAdres: "1 Hoeven, Oirschot",
      beginStand: 37092,
      eindTijd: "9:20:55",
      eindNaam: "",
      eindAdres: "14 Genoenhuis, Geldrop",
      eindStand: 37115,
      ritAfstand: 23,
      afstand: 23,
      duur: "0:13:19",
      parkeerTijd: "9:07:36"
    },
    {
      id: 2,
      ritNummer: "1.2",
      datum: "11/4/24",
      beginTijd: "9:28:35",
      beginNaam: "",
      beginAdres: "14 Genoenhuis, Geldrop",
      beginStand: 37115,
      eindTijd: "10:09:41",
      eindNaam: "",
      eindAdres: "10 De Gruisdorfer, Sterksel",
      eindStand: 37161.5,
      ritAfstand: 46.5,
      afstand: 69.5,
      duur: "0:41:06",
      parkeerTijd: "9:15:16"
    },
    {
      id: 3,
      ritNummer: "1.3",
      datum: "11/4/24",
      beginTijd: "10:15:22",
      beginNaam: "",
      beginAdres: "10 De Gruisdorfer, Sterksel",
      beginStand: 37161.5,
      eindTijd: "10:17:00",
      eindNaam: "",
      eindAdres: "2 De Gruisdorfer, Sterksel",
      eindStand: 37161.8,
      ritAfstand: 0.3,
      afstand: 69.8,
      duur: "0:01:38",
      parkeerTijd: "9:20:57"
    }
  ];

  // Initialize with dummy data directly
  const [trips, setTrips] = useState<Trip[]>(dummyTrips);
  const [insertPosition, setInsertPosition] = useState<number | null>(null);

  // Set default insert position to the last trip
  useEffect(() => {
    if (trips.length > 0 && insertPosition === null) {
      setInsertPosition(trips.length - 1);
    }
  }, [trips.length, insertPosition]);

  const handleFileUpload = (data: Trip[]) => {
    if (data && data.length > 0) {
      setTrips(data);
      // Set insert position to the last trip when data is loaded
      setInsertPosition(data.length - 1);
    } else {
      console.error("No valid data found in the uploaded file");
    }
  };

  const handleInsertTrip = (position: number) => {
    setInsertPosition(position);
  };

  const handleCancelAdd = () => {
    // Instead of setting to null, set to last position
    if (trips.length > 0) {
      setInsertPosition(trips.length - 1);
    }
  };

  const handleAddTrip = (beginAdres: string, eindAdres: string, eindStand: number, position: number) => {
    // Create a copy of the trips array
    const updatedTrips = [...trips];
    
    // Calculate new ID
    const newId = Math.max(...trips.map(trip => trip.id), 0) + 1;
    
    // Get the current trip's beginStand
    const beginStand = position >= 0 && position < trips.length 
      ? trips[position].eindStand 
      : 0;
    
    // Calculate ritAfstand (distance of this specific trip)
    const ritAfstand = eindStand - beginStand;
    
    // Calculate the cumulative distance
    let afstand = ritAfstand;
    if (position >= 0 && position < trips.length) {
      afstand = trips[position].afstand + ritAfstand;
    }
    
    // Get today's date in the format MM/DD/YY
    const today = new Date();
    const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear().toString().substr(-2)}`;
    
    // Create the new trip
    const newTrip: Trip = {
      id: newId,
      ritNummer: "", // Will be updated later
      datum: formattedDate,
      beginTijd: "",
      beginNaam: "",
      beginAdres: beginAdres,
      beginStand: beginStand,
      eindTijd: "",
      eindNaam: "",
      eindAdres: eindAdres,
      eindStand: eindStand,
      ritAfstand: ritAfstand,
      afstand: afstand,
      duur: "",
      parkeerTijd: ""
    };
    
    // Insert the new trip after the specified position
    updatedTrips.splice(position + 1, 0, newTrip);
    
    // Renumber all trip numbers
    const majorNumber = updatedTrips[0].ritNummer.split('.')[0] || "1";
    updatedTrips.forEach((trip, index) => {
      if (index === 0 && trip.ritNummer.includes('.')) {
        // Keep the first trip's ritNummer if it's already in format X.Y
        trip.ritNummer = `${majorNumber}.1`;
      } else if (index > 0) {
        trip.ritNummer = `${majorNumber}.${index + 1}`;
      }
    });
    
    // Calculate the offset that should be applied to all subsequent trips
    // This is the distance (ritAfstand) of the newly added trip
    const offsetToApply = ritAfstand;
    
    // Recalculate all subsequent trip values
    for (let i = position + 2; i < updatedTrips.length; i++) {
      // Increase both beginStand and eindStand by the same offset
      updatedTrips[i].beginStand += offsetToApply;
      updatedTrips[i].eindStand += offsetToApply;
      
      // The ritAfstand should remain the same (individual trip distance doesn't change)
      // No need to recalculate: updatedTrips[i].ritAfstand = updatedTrips[i].eindStand - updatedTrips[i].beginStand;
      
      // Recalculate the cumulative distance
      updatedTrips[i].afstand = updatedTrips[i-1].afstand + updatedTrips[i].ritAfstand;
    }
    
    setTrips(updatedTrips);
    setInsertPosition(position + 1);  // Set insert position to the newly added trip
  };

  const handleDeleteTrip = (position: number) => {
    if (trips.length <= 1) {
      alert("Cannot delete the only trip. At least one trip must remain.");
      return;
    }
    
    // If we're deleting the trip at the current insert position,
    // move the insert position to the previous trip (or the new last trip after deletion)
    if (insertPosition === position) {
      const newPosition = Math.max(0, position - 1);
      setInsertPosition(newPosition);
    } else if (insertPosition !== null && insertPosition > position) {
      // If we're deleting a trip before the current insert position,
      // decrement the insert position to maintain the same relative position
      setInsertPosition(insertPosition - 1);
    }
    
    const updatedTrips = [...trips];
    
    // Remove the trip at the specified position
    updatedTrips.splice(position, 1);
    
    // Renumber all trip numbers
    const majorNumber = updatedTrips[0].ritNummer.split('.')[0];
    updatedTrips.forEach((trip, index) => {
      if (index === 0 && trip.ritNummer.includes('.')) {
        // Keep the first trip's ritNummer if it's already in format X.Y
        trip.ritNummer = `${majorNumber}.1`;
      } else if (index > 0) {
        trip.ritNummer = `${majorNumber}.${index + 1}`;
      }
    });
    
    // Special handling for the case when the first trip is deleted
    if (position === 0 && updatedTrips.length > 0) {
      // If we deleted the first trip, set beginStand of the new first trip to 0
      updatedTrips[0].beginStand = 0;
      // Calculate the new endStand by adding ritAfstand to the beginStand
      updatedTrips[0].eindStand = updatedTrips[0].beginStand + updatedTrips[0].ritAfstand;
      updatedTrips[0].afstand = updatedTrips[0].ritAfstand;
    }
    
    // Recalculate all subsequent trip values
    for (let i = Math.max(position, 1); i < updatedTrips.length; i++) {
      // Set beginStand to the previous trip's eindStand
      updatedTrips[i].beginStand = updatedTrips[i-1].eindStand;
      
      // Keep the original trip distance (ritAfstand) and recalculate eindStand
      updatedTrips[i].eindStand = updatedTrips[i].beginStand + updatedTrips[i].ritAfstand;
      
      // Recalculate the cumulative distance
      updatedTrips[i].afstand = updatedTrips[i-1].afstand + updatedTrips[i].ritAfstand;
    }
    
    setTrips(updatedTrips);
  };

  // Debugging: log the trips state to see what's happening
  console.log("Current trips state:", trips);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Trip Registration</h1>
      </header>
      <main>
        <div className="action-buttons">
          <ExcelUploader onFileUpload={handleFileUpload} />
          <ExcelExporter trips={trips} />
        </div>
        
        {/* Trip Form now appears at the top */}
        <TripForm 
          insertPosition={insertPosition} 
          trips={trips}
          onAddTrip={handleAddTrip} 
          onCancel={handleCancelAdd} 
        />
        
        <TripTable 
          trips={trips} 
          onInsertTrip={handleInsertTrip} 
          onDeleteTrip={handleDeleteTrip} 
        />
      </main>
    </div>
  );
}

export default App;
