import React, { useState, useEffect } from 'react';
import './App.css';
import ExcelUploader, { Trip } from './components/ExcelUploader';
import TripTable from './components/TripTable';
import TripForm from './components/TripForm';
import ExcelExporter from './components/ExcelExporter';

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [loginError, setLoginError] = useState('');

  // Initialize with empty trips array
  const [trips, setTrips] = useState<Trip[]>([]);
  const [insertPosition, setInsertPosition] = useState<number | null>(null);

  // Set default insert position to the last trip if we have trips
  useEffect(() => {
    if (trips.length > 0 && insertPosition === null) {
      setInsertPosition(trips.length - 1);
    }
  }, [trips.length, insertPosition]);

  // Handle login attempt
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.toLowerCase() === 'marc') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Access denied. Please enter a valid name.');
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

  const handleFileUpload = (uploadedTrips: Trip[]) => {
    setTrips(uploadedTrips);
    // Set insert position to the last trip
    if (uploadedTrips.length > 0) {
      setInsertPosition(uploadedTrips.length - 1);
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
    const majorNumber = updatedTrips.length > 0 && updatedTrips[0].ritNummer 
      ? updatedTrips[0].ritNummer.split('.')[0] 
      : "1";
      
    updatedTrips.forEach((trip, index) => {
      if (index === 0 && trip.ritNummer && trip.ritNummer.includes('.')) {
        // Keep the first trip's ritNummer if it's already in format X.Y
        trip.ritNummer = `${majorNumber}.1`;
      } else if (index > 0) {
        trip.ritNummer = `${majorNumber}.${index + 1}`;
      } else {
        // First trip with no existing ritNummer
        trip.ritNummer = `${majorNumber}.1`;
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
    if (updatedTrips.length > 0) {
      const majorNumber = updatedTrips[0].ritNummer?.split('.')[0] || "1";
      updatedTrips.forEach((trip, index) => {
        if (index === 0 && trip.ritNummer?.includes('.')) {
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
    }
    
    setTrips(updatedTrips);
  };

  // Debugging: log the trips state to see what's happening
  console.log("Current trips state:", trips);

  // Render login screen or app content based on authentication state
  if (!isAuthenticated) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Trip Registration</h1>
        </header>
        <div className="login-container">
          <form onSubmit={handleLogin} className="login-form">
            <h2>Please Enter Your Name</h2>
            {loginError && <div className="login-error">{loginError}</div>}
            <div className="login-input-group">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            <button type="submit" className="login-button">Enter</button>
          </form>
        </div>
      </div>
    );
  }

  // Normal app content (only shown when authenticated)
  return (
    <div className="App">
      <header className="App-header">
        <h1>Trip Registration</h1>
        <div className="user-info">
          Welcome, {userName}! <button onClick={() => setIsAuthenticated(false)} className="logout-button">Logout</button>
        </div>
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
