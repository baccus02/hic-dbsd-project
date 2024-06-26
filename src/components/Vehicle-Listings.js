import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled from "styled-components";
import env from "react-dotenv";
import Cookies from 'js-cookie';
import axios from "axios";

const apiUrl = env.APIURL;


export const MainContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
`;


// Section header used for Today's Deals and Used cars 
export const SectionHeader = styled.h1`
    margin-top: 100px;
    padding-left: 20px;
`;


export const ListingContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    width: 80%; 
    align-items: flex-start;
`;


export const MoreVehiclesButtonContainer = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    border: 1px solid #ccc;
    width: 15%; 
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-top: 1.35%;    
    margin-left: -1.2%
`;


// Box to add vehicle + details to
export const BoxForListing = styled.div`
    position: relative;
    width: ${props => props.width}%; /* Use template literal syntax to interpolate props */
    margin: 20px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
`;


export const ButtonContainer = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
`;


const RedirectToSearch = () => {
    window.location.href = "/search";
};


export const MoreVehiclesButton = () => {
    return (
        <button onClick={RedirectToSearch}
            style={{
                backgroundColor: "#fff",
                color: "#00000",
                padding: "10px",
                border: "none",
                height: "100%",
                width: "100%",
                borderRadius: "5px",
                cursor: "pointer",
            }}
        >
            <h2>More Vehicles</h2>
            <h1>&rarr;</h1>
        </button>
    )
};


const RedirectToPurchasePage = (vin) => {
    window.location.href = "/purchase";
    Cookies.set('purchaseVehicle', vin);
};

export const PurchaseButton = ({ vin }) => {
    const handleClick = () => {
        RedirectToPurchasePage(vin);
    };

    return (
        <button
            onClick={handleClick}
            style={{
                backgroundColor: "#007bff",
                color: "#fff",
                height: "100%",
                width: "45%",
                margin: "2%",
                padding: "5% 8%",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginTop: "auto",
            }}
        >
            Purchase
        </button>
    );
};


export const SaveVehicleButton = ({ vin }) => {
    const location = useLocation(); // Get the current location
    const isSavedVehiclesPage = location.pathname === '/saved-vehicles';

    // If it's the /saved-vehicles page, return null to prevent rendering the button
    if (isSavedVehiclesPage) {
        return null;
    }
    
    const handleSaveClick = () => {
        // Retrieve the existing saved vehicles array from the cookie or initialize it as an empty array
        var json_str = Cookies.get('savedVehicles');
        if (json_str) {
        var vins = JSON.parse(json_str);
    
        // Check if the VIN is not already in the saved vehicles array
        if (!vins.includes(vin)) {
            // Add the VIN to the saved vehicles array
            vins.push(vin);
            var json_str2 = JSON.stringify(vins);
            Cookies.set('savedVehicles', json_str2, { expires: 7 });
        }
    
        // Print every VIN to the console for debugging
        console.log("All saved VINs:", vins);
         } else {
            var vins2 = [];
            vins2.push(vin);
            var json_str3 = JSON.stringify(vins2);
            Cookies.set('savedVehicles', json_str3, {expires: 7});
         }
    };
    

    return (
        <button
            onClick={handleSaveClick}
            style={{
                backgroundColor: "#007bff",
                color: "#fff",
                height: "100%",
                width: "45%",
                padding: "5% 5%",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
            }}   
        >
            Save Vehicle
        </button>
    );
}


export const fetchVehicleData = async (vin) => {
    try {
        const response = await axios.get(`${apiUrl}/getVehicleDetails/${vin}`);
        return response.data; // Assuming you expect only one vehicle data object
    } catch (error) {
        // console.error('Error fetching data:', error);
        throw new Error('Error fetching data');
    }
};


const ListingTile = ({ vin, width }) => {
    const [vehicleData, setVehicleData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                try {
                    const dataResponse = await fetchVehicleData(vin);
                    setVehicleData(dataResponse);
                } catch (error) {
                    // console.error('Error fetching data:', error);
                }
            } catch (error) {
                // console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [vin]);

    const handleAboutVehicleClick = (vehicleVIN) => {
            Cookies.set('aboutVin', vehicleVIN);
    };

    if (!vehicleData) {
        return <div>Loading...</div>;
    }

    return (
        <BoxForListing width={width}> {/* Render the BoxForListing component with the width prop */}
            {vehicleData.photos && vehicleData.photos.length > 0 && (
                <img
                    src={vehicleData.photos[0]}
                    alt={`${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`}
                    style={{ maxWidth: '100%' }}
                />
            )}

            <a href="/about-vehicle" onClick={() => handleAboutVehicleClick(vehicleData.vin)}>
                <h3>{`${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`}</h3>
            </a>
            <p>{`${vehicleData.mileage} Miles`}</p>
            <p>{`$${vehicleData.msrp}`}</p>

            {vehicleData.features && vehicleData.features.length > 0 && (
                <>
                    <h4>Features:</h4>
                    <ul>
                        {vehicleData.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                        ))}
                    </ul>
                </>
            )}


            {/* Assuming ButtonContainer and PurchaseButton/SaveVehicleButton are defined elsewhere */}
            <ButtonContainer>
                <PurchaseButton vin={vin} />
                <SaveVehicleButton vin={vin} />
            </ButtonContainer>
        </BoxForListing>
    );

};


export default ListingTile;


export const ListAllVehicles = () => {
    const [vehicles, setVehicles] = useState([]);
   
    const fetchVehicles = async () => {
    try {
        const response = await axios.get(`${apiUrl}/getAllVehicles`);
        // Extract the vehicles from the response data
        const { data } = response;
        setVehicles(data);
    }
    catch (error) {
        // console.error('Error:', error);
    }
};
   
    useEffect(() => {
        fetchVehicles();
    }, []); 
   
    return (
        <div>
            <h1>Vehicle List</h1>
            <ul>
                {vehicles.map(vehicle => (
                <li key={vehicle.id}>
                    {vehicle.make} {vehicle.model} - {vehicle.year} - {vehicle.vin}
                </li>
                ))}
            </ul>
        </div>
    );
};